import requests
import random
import json
import sys
import sortedcontainers
from datetime import datetime
import time


headers = {"Content-Type":"application/json", "Upgrade": "websocket",
    "Connection": "Upgrade"}
            
# print "Table: "
# table = raw_input()
# print "Data line:"
# print "Example: 0 2016/06/29:14:00:00 decoder01 fms_irnode_irleader 195.59.188.6 flash dev 961 6"
# datapoint = raw_input()

# table = "dec"
# datapoint = "0 2016/06/29:14:00:00 decoder01 fms_irnode_irleader 195.59.188.6 akanote dev 961 6"
# table = "tst"
# datapoint = "0 2015/06/29:11:40:00 sql01 mega portalrv 26000 24000 2000 12212572 0 0 0 48 46 1"
table = "mrg"
datapoint = "0 2015/08/01:16:00:00 ccare_cpcode_alert_thresholds mega amsfour 3866 12 2 0"

dataArray = datapoint.split(" ")
data = {"data":[], "textData": datapoint, "table": table}

if table == "dec":
	# 0 2015/06/29:14:00:00 decoder01 fms_irnode_irleader 195.59.188.6 flash dev 961 6
	timeText = dataArray[1]
	time = int(((datetime.strptime(timeText, '%Y/%m/%d:%H:%M:%S'))-datetime(1970,1,1)).total_seconds()*1000);
	data['thread'] = dataArray[2]
	data['tablename'] = dataArray[3]
	data['ip'] = dataArray[4]
	data['span'] = dataArray[5]
	data['domain'] = dataArray[6]
	rows = int(dataArray[7])
	# columns = dataArray[8]

	data['data'] = [time, rows]
	# print data

if table == "tst":
	# datapoint = "0 2015/05/29:11:40:00 sql01 mega portalrv 26000 24000 2000 12212572 0 0 0 48 46 1"
	timeText = dataArray[1]
	time = int(((datetime.strptime(timeText, '%Y/%m/%d:%H:%M:%S'))-datetime(1970,1,1)).total_seconds()*1000);
	data['thread'] = dataArray[2]
	data['span'] = dataArray[3]
	data['domain'] = dataArray[4]
	cpu = int(dataArray[5])
	usertime = int(dataArray[6])
	systime = int(dataArray[7])
	rss = int(dataArray[8])
	minorpf = int(dataArray[9])
	majorpf = int(dataArray[10])
	inputBlk = int(dataArray[11])
	outputBlk = int(dataArray[12])
	vcs = int(dataArray[13])
	ics = int(dataArray[14])

	# options = ["sum(minorpf), sum(majorpf)", "sum(vcs), sum(ics)", "sum(input), sum(output)", "avg(cpu)", "avg(rss)"]
	data['data'] = [[time, minorpf, majorpf], [time, vcs, ics], [time, inputBlk, outputBlk], [time, cpu], [time, rss]]

if table == "mrg":
	# 0 2015/07/01:16:00:00 ccare_cpcode_alert_thresholds mega amsfour 3866 12 2 0
	timeText = dataArray[1]
	time = int(((datetime.strptime(timeText, '%Y/%m/%d:%H:%M:%S'))-datetime(1970,1,1)).total_seconds()*1000);
	data['tablename'] = dataArray[2]
	data['span'] = dataArray[3]
	data['domain'] = dataArray[4]
	numrows = int(dataArray[5])
	# numcolumns = int(dataArray[6])
	contributors = int(dataArray[7])
	elapsed_ms = int(dataArray[8])

	# options = ["sum(numrows)", "sum(contributors)", "avg(elapsed_ms)"]
	data['data'] = [[time, numrows], [time, contributors], [time, elapsed_ms]]

r = requests.post("http://198.18.55.222:80/pushdata/",headers=headers,data=json.dumps(data))

