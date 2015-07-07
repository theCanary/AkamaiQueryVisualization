"""
Sets up a basic Tornado server application that serves a single page
for graphs, and a JSON object containing graph data, for tests.
"""
from tornado.ioloop import IOLoop
from tornado.web import RequestHandler, Application, url, StaticFileHandler
from tornado.websocket import WebSocketHandler, WebSocketClosedError
from tornado import gen
import json
import os
import random
import requests
import datetime
import sortedcontainers #for fake data. TODO: remove when we have a real DB!
from impala.dbapi import connect
from impala.util import as_pandas
from flask import Flask, jsonify, json, render_template, request
from concurrent.futures import ThreadPoolExecutor

##THE BELOW VARIABLES ARE FOR DEVELOPMENT
GLOBAL_COUNTER = 1432924245 #starts the testing graphs at a particular epoch time
STEP_SIZE = 10 #how far we go each "step" in our graph update
##Boundary values for random data:
MIN_INT = 5
MAX_INT = 40
DEBUG = True #Currently unused. Set such that we can start server in debug mode. Maybe add an optparse for this?
##THESE ARE FOR REAL
ALL_SOCKETS = [] #store all client sockets here - this could get messy; figure out a better way
all_alerts = sortedcontainers.SortedListWithKey(key=lambda x: x["score"]) #can't leave this in fake_data, it's got state.

# CHANGE THIS IF THE IMPALA DATABASE CHANGES - ashwang
host_machine_ip_address = '198.18.55.221'

"""
Handler that carries any variables we want to toss in multiple templates at once.
"""
class BaseQuery2Handler(RequestHandler):
	executor = ThreadPoolExecutor(max_workers=50) #this pool is shared between all requesthandlers. TODO: make max_workers a parameter

"""
Renders DEC information.
"""
class DashboardHandler(BaseQuery2Handler):
	def get(self):
		self.render("dashboard.html")
"""
Renders TST information.
"""
class TSTHandler(BaseQuery2Handler):
	def get(self):
		self.render("threadstats.html")
"""
Renders VER information.
"""
class VERHandler(BaseQuery2Handler):
	def get(self):
		self.render("versionstats.html")

"""
Renders SQL information.
"""
class SQLHandler(BaseQuery2Handler):
	def get(self):
		self.render("sqlstats.html")

"""
Renders Impala Query box.
"""
class ImpalaQueryHandler(BaseQuery2Handler):
	def get(self):
		self.render("impalaQuery.html")


"""
Catches exeptions in a decorator wrapper.
"""
def exception_catcher(func,self,*args,**kwargs):
	try:
		return func(self,*args,**kwargs)
	except:
		ex = traceback.print_exc() #TODO: Do something more appropriate with this


"""
Queries Impala asynchronously, making it possible to have more than 1 concurrent user.
This is executed as a function decorator on a RequestHandler's get/post, which allows us
to simply execute our synchronous code as an asynchronous process that takes full advantage
of Tornado's event loop capabilities.
Code thanks to Sschalk
"""
def query_database(use_thread=False):
	def query_wrapper(function_to_wrap):
		def wrapper(self,*args,**kwargs):
			try:
				if use_thread:
					future = self.executor.submit(exception_catcher,function_to_wrap,self,*args,**kwargs)
					try:
						content = yield future
					except Exception:
						self.set_status(500)
						self.write("Problem in Nested exception! Writing to request and to error logs...\n")
						trace = traceback.format_exc()
						self.write(trace)
						self.write("Nested exception was:\n")
						msg = future.exception().message
						self.write(msg+"\n")
				else:
					content = function_to_wrap(self,*args,**kwargs) #WARNING: This is synchronous!
				self.finish()
			except Exception as e:
				self.set_status(500)
				self.finish("Database error:\n " + str(e))
				return
		return gen.coroutine(wrapper)
	return query_wrapper


"""
SQL QUERIES!!! 
This should take in a fully formed SQL Query (with the ; as well) and return a list of tuples 
that can be graphed or presented as a table.
"""
class SQLQueryHandler(BaseQuery2Handler):
	@query_database(use_thread=True)
	def get(self):
	    print "Got here"
	    conn = connect(host = host_machine_ip_address, port=21050)
	    cur = conn.cursor()
	    command = self.get_argument('query')
	    print command, type(command), type(command.encode('ascii','ignore'))
	    cur.execute(command.encode('ascii','ignore').replace(";", ""))
	    # cur.execute("show tables")
	    timeline = cur.fetchall()
	    print timeline
	    json_data = {"data": timeline, "query": command}
	    self.write(json_data)

	def post(self):
		pass

"""
QUERIES!!! 
This should take in several types of user input information, execute the appropriate query in Impala, and then
return a list of tuples that will be changed into a graph.
"""
class QueryHandler(BaseQuery2Handler):
	@query_database(use_thread=True)
	def get(self):
	    # Setup
	    conn = connect(host = host_machine_ip_address, port=21050)
	    cur = conn.cursor()

	    table = self.get_argument('table')

	    if table == 'dec': # Set in dec.js
		    # span = 'freeflow'
		    # domain = 'mapnocctwo'
		    # threadName = "decoder"
		    # tableName = ""
		    # ipAddress = ""
		    # startDate = "2013-06-16T12:37"
		    # endDate = "2015-06-16T12:37"
		    span = self.get_argument('a')
		    domain = self.get_argument('b')
		    threadName = self.get_argument('c')
		    tableName = self.get_argument('d')
		    ipAddress = self.get_argument('e')
		    startDate = self.get_argument('f')
		    endDate = self.get_argument('g')
		    json_data = self.dec(cur, span, domain, threadName, tableName, ipAddress, startDate, endDate)
	    # elif table == 'tst_CPU_RSS': # Set in tst.js
		   #  span = self.get_argument('a')
		   #  domain = self.get_argument('b')
		   #  endDate = self.get_argument('d')
		   #  startDate = self.get_argument('c')
		   #  json_data = self.tst_CPU_RSS(cur, span, domain, startDate, endDate)
	    elif table == 'tst': # Set in tst.js
		    span = self.get_argument('a')
		    domain = self.get_argument('b')
		    thread = self.get_argument('c')
		    startDate = self.get_argument('d')
		    endDate = self.get_argument('e')
		    option = self.get_argument('option')
		    json_data = self.tst(cur, span, domain, thread, startDate, endDate, option)
	    elif table == 'ver': # Set in ver.js
		    span = self.get_argument('a')
		    domain = self.get_argument('b')
		    multithreaded = self.get_argument('c')
		    ipAddress = self.get_argument('d')
		    aggtype = self.get_argument('e')
		    build = self.get_argument('f')
		    startDate = self.get_argument('g')
		    endDate = self.get_argument('h')
		    json_data = self.ver(cur, span, domain, multithreaded, ipAddress, aggtype, build, startDate, endDate)
	    elif table == 'sql': # Set in sql.js
		    span = self.get_argument('a')
		    domain = self.get_argument('b')
		    host = self.get_argument('c')
		    client = self.get_argument('d')
		    startDate = self.get_argument('e')
		    endDate = self.get_argument('f')
		    option = self.get_argument('option')
		    json_data = self.sql(cur, span, domain, host, client, startDate, endDate, option)

	    self.write(json_data)

	def post(self):
	    pass

	def dec(self, cur, span, domain, thread, tableName, ipAddress, startDate, endDate):

	    command = "SELECT time, sum(numrows) from dec"
	    name = ""
	    command += " WHERE "
	    if span != "ALL":
	    	name += span + "."
	        command += "span = '" + span + "' and "
	    if domain != "ALL":
	    	name += domain + " "
	        command += "domain = '" + domain + "' and "
	    if thread != "ALL":
	    	name += thread + " "
	    	command += "name LIKE '%" + thread + "%' and "
	    if tableName != "":
	    	name += tableName + " "
	        command += "table_name = '" + tableName + "' and "
	    if ipAddress != "":
	    	name += ipAddress + " "
	        command += "ip LIKE '" + ipAddress.replace('*', '%') + "' and "
	    command += "cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp) between cast(from_unixtime(unix_timestamp('" + startDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) and cast(from_unixtime(unix_timestamp('" + endDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) "
	    command += "GROUP BY time ORDER BY cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp)"
	    print command

	    cur.execute(command)
	    timeline = cur.fetchall()
	    timeline = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[1]] for i in timeline];
	    print timeline
	    json_data = {"data": timeline, "query": command, "name": name}
	    return json_data

	# def tst_CPU_RSS(self, cur, span, domain, startDate, endDate):
	#     print span, domain, startDate, endDate
	#     json_data = {}

	#     for x in ["decoder", "encoder", "comm", "merger", "gcollect", "sql", "listener", "main"]:
	#     	command  = "select time, avg(cpu), avg(rss), count(distinct span, domain) from tst WHERE name LIKE '%" + x + "%' and time LIKE '%2015%' GROUP BY time ORDER BY cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp)"
	#     	print command

	#     	cur.execute(command)
	#     	timeline = cur.fetchall()
	#     	cpuTime = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[1]] for i in timeline]
	#     	rssMemory = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[2]] for i in timeline]
	#     	numAggsets = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[3]] for i in timeline];

	#     	json_data[x] = {"name" : x, "color": x, "CPU_Time": cpuTime, "numSources": numAggsets, "RSS_Memory": rssMemory}
	#     print json_data
	#     return json_data

	def tst(self, cur, span, domain, thread, startDate, endDate, numOption):
	    
	    tags = [("(Minor)", "(Major)"), ("(Voluntary)", "(Involuntary)"), ("(Input)", "(Output)"), "CPU Time", "RSS Memory"]
	    options = ["sum(minorpf), sum(majorpf)", "sum(vcs), sum(ics)", "sum(input), sum(output)", "avg(cpu)", "avg(rss)"]
	    selection = options[int(numOption)]
	    tag = tags[int(numOption)]

	    command = "SELECT time, " + selection + " from tst"
	    name = ""
	    command += " WHERE "
	    if span != "ALL":
	    	name += span + "."
	        command += "span = '" + span + "' and "
	    if domain != "ALL":
	    	name += domain + " "
	        command += "domain = '" + domain + "' and "
	    if thread != "ALL":
	    	name += thread
	        command += "name LIKE '%" + thread + "%' and "
	    command += "cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp) between cast(from_unixtime(unix_timestamp('" + startDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) and cast(from_unixtime(unix_timestamp('" + endDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) "
	    command += "GROUP BY time ORDER BY cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp)"
	    print command

	    cur.execute(command)
	    timeline = cur.fetchall()

	    if int(numOption) < 3:
		    data1 = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[1]] for i in timeline];
		    data2 = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[2]] for i in timeline];
		    print data1, data2
		    json_data = {"name1": name + " " + tag[0], "data1": data1, "name2": name + " " +  tag[1], "data2": data2, "query": command}
	    else:
		    data = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[1]] for i in timeline];
		    print data
		    json_data = {"name": name, "data": data, "query": command}
		
	    return json_data

	def ver(self, cur, span, domain, multithreaded, ipAddress, aggtype, build, startDate, endDate):
	    command = "SELECT CONCAT(substr(starttime,1, 10), ':', substr(starttime,14, 8)), generation from ver"
	    name = ""
	    command += " WHERE "
	    if span != "ALL":
	    	name += span + "."
	        command += "span = '" + span + "' and "
	    if domain != "ALL":
	    	name += domain + " "
	        command += "domain = '" + domain + "' and "
	    if ipAddress != "":
	    	name += ipAddress + " "
	        command += "ip LIKE '" + ipAddress.replace('*', '%') + "' and "
	    if aggtype != "ALL":
	    	name += aggtype + " "
	        command += "aggtype = '" + aggtype + "' and "
	    if build != "ALL":
	    	name += build + " "
	        command += "ver = '" + build + "' and "
	    command += "cast(from_unixtime(unix_timestamp(substr(starttime,1, 10), 'yyyy-MM-dd')) as timestamp) between cast(from_unixtime(unix_timestamp('" + startDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) and cast(from_unixtime(unix_timestamp('" + endDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) "
	    # command += "GROUP BY starttime"
	     # ORDER BY cast(from_unixtime(substr(starttime,1, 10), 'yyyy-MM-dd') as timestamp)"
	    print command

	    cur.execute(command)
	    timeline = cur.fetchall()
	    data = [[((datetime.datetime.strptime(i[0], '%Y-%m-%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[1]] for i in timeline];
	    print data
	    json_data = {"name": name, "data": data, "query": command}

	    return json_data


	def sql(self, cur, span, domain, host, client, startDate, endDate, numOption):
	    print "ok"

	    ["Returned Rows", "Total Generated Rows", "Query Processing Time", "Total Elapsed Time", "Number of Interrupts", "Number of Error Messages", "Number of Distinct Error Messages", "Total Table Bytes", "Total Temp Table Bytes", "Total Table Indices", "Total Temp Table Indices"]
	    options = ["sum(rows)", "sum(total_rows)", "avg(timetoprocess_ms)", "avg(elapsed_ms)", "sum(interrupts)", "count(error_msg)", "count(distinct error_msg)", "sum(table_index_bytes)", "sum(temp_index_bytes)", "sum(num_table_indexes)", "sum(num_temp_indexes)"]
	    selection = options[int(numOption)]

	    command = "SELECT time, " + selection + " from sql"
	    name = ""
	    command += " WHERE "
	    if span != "ALL":
	    	name += span + "."
	        command += "span = '" + span + "' and "
	    if domain != "ALL":
	    	name += domain + " "
	        command += "domain = '" + domain + "' and "
	    if host != "":
	    	name += host
	        command += "host LIKE '%" + host + "%' and "
	    if client != "":
	    	name += client
	        command += "client LIKE '%" + client + "%' and "
	    if int(numOption) in [5,6]:
	    	command += "table_type LIKE 'error_table' and " # should all the other queries exclude errors???
	    command += "cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp) between cast(from_unixtime(unix_timestamp('" + startDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) and cast(from_unixtime(unix_timestamp('" + endDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) "
	    command += "GROUP BY time ORDER BY cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp)"
	    print command

	    cur.execute(command)
	    timeline = cur.fetchall()

	    data = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[1]] for i in timeline];
	    print data
	    json_data = {"name": name, "data": data, "query": command}
	    return json_data

"""
below code thanks to: http://blog.kagesenshi.org/2011/10/simple-websocket-push-server-using.html
"""

"""
The actual socket created by the user. 
"""
class ClientSocket(WebSocketHandler):
	def open(self):
		ALL_SOCKETS.append(self) #add the socket to our list of current open sockets
		self.wanted_feeds = set() #So that we can add or remove as many feeds as we want
		#Right now you can't change which feeds are displayed on your main page
		#without going to the Settings page; so we can rely on socket closing to change this
		#that said, in the future we could change which feeds we read in by way of on_message and a
		#"REMOVE" message over the wire.
		print("Socket opened.")
	#This is not actually an on_close. This is close done by the server - keep it here for completeness.
	def close(self):
		ALL_SOCKETS.remove(self)
		print("Socket closed.")
	#This is the actual response to the client closing the socket.
	def on_close(self):
		ALL_SOCKETS.remove(self)
		print("On_close called, socket removed from feeds.")

	def on_message(self,message):
		#first check if we have a sensible message
		if message.startswith("FEED"):
			#if so, split it into chunks
			feeds = message.split() #handles the multi-space case for resiliency
			#call in for more data from feeds that actually exist right now
			#got all the feeds, now ask Spark for data
			for feed in feeds:
				#TODO: FETCH DATA FOR REALS, also make sure we write to the user whether this is timeseries or bar chart
				#for the latter, add a "data_type" member to the JSON object we send back

				#If we actually found that the feed was real, let it be updateable by Announcer:
				self.wanted_feeds.add(feed)
				#and then write to user:
				#self.write_message(json_data)
				#We may have sync issues here - think about this more.
			

"""
Creates handlers and options for our application.
"""
def make_application():
	handlers = [
		url(r"/socket/", ClientSocket),
		url(r"/",DashboardHandler),
		url(r"/dashboard/",DashboardHandler), # DEC pipeline
		url(r"/threadstats/",TSTHandler),
		url(r"/versionstats/",VERHandler),
		url(r"/sqlstats/",SQLHandler),
		url(r"/ImpalaQueries",ImpalaQueryHandler),
		url(r"/_make_query",QueryHandler),
		url(r"/_make_sql_query",SQLQueryHandler)
		]
	settings = {'static_path':os.getcwd() + "/static/",
		 'static_url_prefix':"/static/", "debug":True}
	foo = Application(handlers,**settings)
	return foo

"""
Runs the application.
"""
def main():
	app = make_application() #includes routes
	app.listen(8888)
	IOLoop.current().start()
##Python magic equivalent to including a main() method and MainClass in Java.
if __name__ == "__main__":
	main()
