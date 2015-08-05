import datetime

# In some cases you need to perform this additional check.
def check(array):
    if len(array) == 0:
        return [[]]
    else:
        return array

def dec(cur, span, domain, thread, tableName, ipAddress):
    cur.execute("invalidate metadata")
    cur.execute("REFRESH dec")

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
    	command += "thread_name LIKE '%" + thread + "%' and "
    if tableName != "":
    	name += tableName + " "
        command += "table_name = '" + tableName + "' and "
    if ipAddress != "":
    	name += ipAddress + " "
        command += "ip LIKE '" + ipAddress.replace('*', '%') + "' and "
    # command += "cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp) between cast(from_unixtime(unix_timestamp('" + startDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) and cast(from_unixtime(unix_timestamp('" + endDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) "
    command += "numrows > 0 "
    command += "GROUP BY time ORDER BY cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp)"
    print command

    cur.execute(command)
    timeline = cur.fetchall()
    timeline = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[1]] for i in timeline];
    print timeline
    json_data = {"data": timeline, "query": command, "name": name}
    return json_data

def tst(cur, span, domain, thread, numOption):
    cur.execute("invalidate metadata")
    cur.execute("REFRESH tst")
    
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
    # command += "cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp) between cast(from_unixtime(unix_timestamp('" + startDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) and cast(from_unixtime(unix_timestamp('" + endDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) "
    command += "ddc = 0 "
    command += "GROUP BY time ORDER BY cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp)"
    print command

    cur.execute(command)
    timeline = cur.fetchall()

    if int(numOption) < 3:
        data1 = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[1]] for i in timeline];
        data2 = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[2]] for i in timeline];
        data1 = check(data1)
        data2 = check(data2)
        json_data = {"name1": name + " " + tag[0], "data1": data1, "name2": name + " " +  tag[1], "data2": data2, "query": command}
    else:
        data = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[1]] for i in timeline];
        data = check(data)
        json_data = {"name": name, "data": data, "query": command}
	
    return json_data

def ver(cur, span, domain, multithreaded, ipAddress, aggtype, build):
    cur.execute("invalidate metadata")
    cur.execute("REFRESH ver")

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
    # command += "cast(from_unixtime(unix_timestamp(substr(starttime,1, 10), 'yyyy-MM-dd')) as timestamp) between cast(from_unixtime(unix_timestamp('" + startDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) and cast(from_unixtime(unix_timestamp('" + endDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) "
    command += "generation > 0 "
    # command += "GROUP BY starttime"
     # ORDER BY cast(from_unixtime(substr(starttime,1, 10), 'yyyy-MM-dd') as timestamp)"
    print command

    cur.execute(command)
    timeline = cur.fetchall()
    data = [[((datetime.datetime.strptime(i[0], '%Y-%m-%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[1]] for i in timeline];
    print data
    json_data = {"name": name, "data": data, "query": command}

    return json_data


def sql(cur, span, domain, host, client, numOption):
    cur.execute("invalidate metadata")
    cur.execute("REFRESH sql")

    ["Returned Rows", "Total Generated Rows", "Query Processing Time", "Total Elapsed Time", "Number of Interrupts", "Number of Error Messages", "Number of Distinct Error Messages", "Total Table Bytes", "Total Temp Table Bytes", "Total Table Indices", "Total Temp Table Indices"]
    options = ["sum(numrows)", "sum(total_rows)", "avg(timetoprocess_ms)", "avg(elapsed_ms)", "sum(interrupts)", "count(error_msg)", "count(distinct error_msg)", "sum(table_index_bytes)", "sum(temp_index_bytes)", "sum(num_table_indexes)", "sum(num_temp_indexes)"]
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
    # command += "cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp) between cast(from_unixtime(unix_timestamp('" + startDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) and cast(from_unixtime(unix_timestamp('" + endDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) "
    command += "ddc = 0 "
    command += "GROUP BY time ORDER BY cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp)"
    print command

    cur.execute(command)
    timeline = cur.fetchall()

    data = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[1]] for i in timeline];
    print data
    json_data = {"name": name, "data": data, "query": command}
    return json_data

def got(cur, span, domain, host, client, table):
    cur.execute("invalidate metadata")
    cur.execute("REFRESH got")
    print "hi"
    command = "SELECT table_name, count(*) from got"
    name = ""
    command += " WHERE "
    if span != "ALL":
    	name += span + "."
        command += "span = '" + span + "' and "
    if domain != "ALL":
    	name += domain + " "
        command += "domain = '" + domain + "' and "
    if host != "":
    	name += host+ " "
        command += "host LIKE '%" + host + "%' and "
    if client != "":
    	name += client+ " "
        command += "client LIKE '%" + client + "%' and "
    if table != "":
    	name += table + " "
        command += "table_name LIKE '%" + table + "%' and "
    # command += "cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp) between cast(from_unixtime(unix_timestamp('" + startDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) and cast(from_unixtime(unix_timestamp('" + endDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) "
    command += "ddc = 0 "
    command += "GROUP BY table_name ORDER BY -count(*) limit 20"
    print command

    cur.execute(command)
    timeline = cur.fetchall()

    # data = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[1]] for i in timeline];
    data = [[i[0], i[1]] for i in timeline];
    print data
    json_data = {"name": name, "data": data, "query": command}
    return json_data


def mrg(cur, span, domain, tableName, numOption):
    cur.execute("invalidate metadata")
    cur.execute("REFRESH mrg")
    #["Number of Rows Merged", "Number of Contributors"]
    options = ["sum(numrows)", "sum(contributors)"]
    selection = options[int(numOption)]

    command = "SELECT time, "+ selection + " from mrg"
    name = ""
    command += " WHERE "
    if span != "ALL":
        name += span + "."
        command += "span = '" + span + "' and "
    if domain != "ALL":
        name += domain + " "
        command += "domain = '" + domain + "' and "
    if tableName != "":
        name += tableName + " "
        command += "table_name LIKE '%" + tableName + "%' and "
    # command += "cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp) between cast(from_unixtime(unix_timestamp('" + startDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) and cast(from_unixtime(unix_timestamp('" + endDate + "', 'yyyy-MM-dd HH:mm')) as timestamp) "
    command += "ddc = 0 "
    command += "GROUP BY time ORDER BY cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp)"
    print command

    cur.execute(command)
    timeline = cur.fetchall()

    data = [[((datetime.datetime.strptime(i[0], '%Y/%m/%d:%H:%M:%S'))-datetime.datetime(1970,1,1)).total_seconds()*1000, i[1]] for i in timeline];
    print data
    json_data = {"name": name, "data": data, "query": command}
    return json_data

def flags(cur):
    cur.execute("invalidate metadata")
    cur.execute("REFRESH flags")
    command = """SELECT MIN(time), count(*), group_concat(CONCAT(cast(time as string), ":", roll_type)) from (select * from flags ORDER BY time) sortedFlags GROUP BY day ORDER BY day"""
    print command
    cur.execute(command)
    print "executed command"
    timeline = cur.fetchall()
    print "fetched", timeline
    data = [[i[0]*1000, i[1], i[2]] for i in timeline]
    json_data = {"name": 'flags', "data": data, "query": command}
    return json_data










