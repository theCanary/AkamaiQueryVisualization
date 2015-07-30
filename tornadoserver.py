"""
Sets up a basic Tornado server application that serves a single page
for graphs, and a JSON object containing graph data, for tests.
"""
# impor tsys
# sys.paths.append
from tornado.ioloop import IOLoop
from tornado.web import RequestHandler, Application, url, StaticFileHandler
from tornado.websocket import WebSocketHandler, WebSocketClosedError
from tornado import gen
from impala.dbapi import connect
from impala.util import as_pandas
import json
import os
import random
import requests
import datetime
import html # from ashwang, should be files in same directory
import query # from ashwang, should be files in same directory
import sortedcontainers #for fake data. TODO: remove when we have a real DB!
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
host_machine_ip_address = '198.18.55.222'

"""
Handler that carries any variables we want to toss in multiple templates at once.
"""
class BaseQuery2Handler(RequestHandler):
	executor = ThreadPoolExecutor(max_workers=50) #this pool is shared between all requesthandlers. TODO: make max_workers a parameter

"""
Home page, describes what's going on.
"""
class HomeHandler(BaseQuery2Handler):
	def get(self):
		self.render("index.html")

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
Renders SQL and GOT information.
"""
class SQLHandler(BaseQuery2Handler):
	def get(self):
		self.render("sqlstats.html")

"""
Renders MRG information.
"""
class MRGHandler(RequestHandler):
	def get(self):
		self.render("mergestats.html")

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
Table Generator!!! 
This should take in a SQL Query (with or without the ;) and return html code for 
an html table.
"""
class TableGeneratorHandler(BaseQuery2Handler):
	@query_database(use_thread=True)
	def get(self):
	    conn = connect(host = host_machine_ip_address, port=21050)
	    cur = conn.cursor()
	    command = self.get_argument('query')
	    if "drop" in command.lower():
	    	return
	    cur.execute(command.encode('ascii','ignore').replace(";", ""))
	    data = cur.fetchall()
	    print data
	    tempDict = {}
	    for x in data:
	    	tempDict[x[0]] = x[1]

	    code = html.prettyTable(tempDict)
	    json_data = {"data": data, "code": code, "query": command}
	    self.write(json_data)

	def post(self):
		pass


"""
SQL QUERIES!!! 
This should take in a fully formed SQL Query (with the ; as well, or not, it don't matter) and return an array or text 
that can be graphed or presented as a table.
"""
class SQLQueryHandler(BaseQuery2Handler):
	@query_database(use_thread=True)
	def get(self):
	    conn = connect(host = host_machine_ip_address, port=21050)
	    cur = conn.cursor()
	    command = self.get_argument('query')
	    if "drop" in command.lower():
	    	return
	    cur.execute(command.encode('ascii','ignore').replace(";", ""))
	    data = cur.fetchall()
	    print data
	    code = html.prettyDatabase(data)
	    json_data = {"data": data, "code": code, "query": command}
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
	    print table

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
		    # startDate = self.get_argument('f')
		    # endDate = self.get_argument('g')
		    json_data = query.dec(cur, span, domain, threadName, tableName, ipAddress)
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
		    option = self.get_argument('option')
		    json_data = query.tst(cur, span, domain, thread, option)
	    elif table == 'ver': # Set in ver.js
		    span = self.get_argument('a')
		    domain = self.get_argument('b')
		    multithreaded = self.get_argument('c')
		    ipAddress = self.get_argument('d')
		    aggtype = self.get_argument('e')
		    build = self.get_argument('f')
		    json_data = query.ver(cur, span, domain, multithreaded, ipAddress, aggtype, build)
	    elif table == 'sql': # Set in sql.js
		    span = self.get_argument('a')
		    domain = self.get_argument('b')
		    host = self.get_argument('c')
		    client = self.get_argument('d')
		    option = self.get_argument('option')
		    json_data = query.sql(cur, span, domain, host, client, option)
	    elif table == 'got': # Set in sql.js as well since GOT is so similar to SQL
		    span = self.get_argument('a')
		    domain = self.get_argument('b')
		    host = self.get_argument('c')
		    client = self.get_argument('d')
		    table = self.get_argument('e')
		    json_data = query.got(cur, span, domain, host, client, table)
	    elif table == 'mrg': # Set in mrg.js
		    span = self.get_argument('a')
		    domain = self.get_argument('b')
		    tableName = self.get_argument('c')
		    option = self.get_argument('option')
		    json_data = query.mrg(cur, span, domain, tableName, option)
	    elif table == 'flags': # Set in annotations.js
		    json_data = query.flags(cur)

	    self.write(json_data)

	def post(self):
	    pass


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


class Announcer(BaseQuery2Handler):
	"""
	This is what writes to the client sockets every time it receives an event. Ideally, our SparkSQL would
	run on a cron task of some sort that pings those servers and then shoots here, which would then fire off
	data to all the client sockets.
	"""
	def prepare(self):
		"""
		Since this socket requires JSON, this function catches all incoming requests and if they're JSON type,
		puts then in self.json_args.
		"""
		if self.request.headers.get("Content-Type").startswith("application/json"):
			#If no content-type is specified, this will crash with a 503
			self.json_args = json.loads(self.request.body.decode("utf-8"))
		else:
			self.json_args = None

	def post(self):
		"""
		When data is passed in to here via POST, it is then broadcast to all clients.
		In the future, data about the specific feed will be used to decide which users
		should get it, possibly via globals.
		"""
		##Ensure that json_data has a feed_name on it. This will let us check whether
		#we should push something to a socket or not.

		json_data = self.json_args
		json_type = json_data["type"]
		print "Announcer received input"
		print json_data["data"]
		if json_type.startswith("alerts"):
			if json_type == "alerts_add":
				all_alerts.update(json_data["data"])
			elif json_type == "alerts_remove":
				all_alerts.remove(json_data["data"][0]) #only 1 in remove requests
		for socket in ALL_SOCKETS:
			#if json_data["feed_name"] in socket.wanted_feeds:
			#TODO: Make sure we actually pass this in...
			try:
				socket.write_message(json_data)
			except WebSocketClosedError:
				##if one of our sockets is closed, but still in the list
				##remove it from our list
				ALL_SOCKETS.remove(socket)
		self.write("Success")	

"""
Creates handlers and options for our application.
"""
def make_application():
	handlers = [
		url(r"/socket/", ClientSocket), # TODO
		url(r"/pushdata/",Announcer), #TODO
		url(r"/",DashboardHandler), #HomeHandler
		url(r"/home/",DashboardHandler), # DEC pipeline
		url(r"/dashboard/",DashboardHandler), # DEC pipeline
		url(r"/threadstats/",TSTHandler),
		url(r"/versionstats/",VERHandler),
		url(r"/sqlstats/",SQLHandler),
		url(r"/mergestats/",MRGHandler),
		url(r"/ImpalaQueries/",ImpalaQueryHandler),
		url(r"/_make_query",QueryHandler),
		url(r"/_make_table_query",TableGeneratorHandler),
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
	app.listen(80)
	IOLoop.current().start()
##Python magic equivalent to including a main() method and MainClass in Java.
if __name__ == "__main__":
	main()
