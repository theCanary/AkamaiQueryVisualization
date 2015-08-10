# This is a test file to show that it is possible to push data to an open websocket by POSTing to a websocket.

import requests
import random
import json
import sys
import sortedcontainers
from datetime import datetime
import time

#This file only has the actual data generation functions so we can play with them.
GLOBAL_COUNTER = 1432924245 #for testing what rickshaw does w/limited space
ALERT_COUNTER = 15926 # for removing/adding alerts on the fly
STEP_SIZE = 10 #how far we go each "step" in our graph update
##Boundary values for random data:
MIN_INT = 5
MAX_INT = 40
all_alerts = sortedcontainers.SortedListWithKey(key=lambda x: x["score"])
#set up stuff we need for random generation
distribution = {200: 80, 304: 1, 404: 4, 206: 1, 301: 1, 400: 1, 403: 1, 401: 1, 405: 1, 411: 1, 500: 3, 502: 1, 503: 1, 504: 1, 000: 2} 
dist_array = [] #holds up the actual distribution for picking random indices
for key in distribution.keys():
	dist_array.extend([key] * distribution[key])
#add random alert titles
alert_fields = [("Response turnaround time","line"),("HTTP status code","bar"),("Request Error","bar"),("Request Content-Type","bar"),("SSL overhead time - forward","line"),("DNS lookup time - forward","line"),("Forward turnaround time","line"),("TCP max smooth round trip during connection","line")]
#can probably do more if we care for it
pipe_names = ["FF1","FF2","FF3","ESSL","geo_ghost"]
real_data = [] #store real data here!
#CONFIG VARIABLE
CONFIG = {}

breakpoints = [{"start":1432924249,"end":1432924257}]
def create_line_chart_data(feed_name="",stop_counter=False,field_name=""):
	data = {"data":[], "type": "feed_main_chart"}

	headers = {"Content-Type":"application/json"}
	i = 1
	while True:
		i += 1
		data['data'] = [1435589700000.0 + i*100000000, random.randint(5,1e10)]
		print data
		r = requests.post("https://query2logs.default.abattery.appbattery.nss1.tn.akamai.com/pushdata/",headers=headers,data=json.dumps(data), verify=False)
		time.sleep(2)

	# r = requests.post("http://"+CONFIG["server_address"]+":"+CONFIG["server_port"]+"/pushdata/",headers=headers,data=json.dumps(data))	
	# r = requests.post("http://198.18.55.216:8888/pushdata/",headers=headers,data=json.dumps(data))

create_line_chart_data();
