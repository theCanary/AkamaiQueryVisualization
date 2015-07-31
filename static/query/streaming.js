/*
This allows streaming to occur on all pages with graphs.
Software used: Impyla, Impala, Hive, Highcharts.
Author: Ashley Wang
*/


/*
Opens a websocket to the specified relative path so that we don't have to specify any hardcoded URLs.
This function mirrors the action of href tags: if relative_path starts with /, it will be treated as a path starting
from the host; otherwise, it will be appended to the current path.
This function will also mirror the request type (WSS if HTTPS, WS if HTTP) */
function open_websocket(relative_path) {
	var new_uri;
	if (location.protocol == "https:") {
		new_uri = "wss:";
	} else { //could this be dangerous?
		new_uri = "ws:";
	}
	new_uri += "//" + location.host;
	if (relative_path.startsWith("/")) {
		new_uri += relative_path;
	} else {
		if (pathname.endsWith("/")) { //NOTE: all my URLs will hit this, but we write both kinds for completeness
			new_uri += loc.pathname + relative_path; 
		} else {
			new_uri += loc.pathname + "/" + relative_path;
		}
	}
	return new WebSocket(new_uri);
}

var ws = open_websocket("/socket/");	
//TODO: Send a message so that we only listen to stuff we care about! Otherwise we get in trouble when many users are connected
//This ws onmessage declaration handles all our data types.
ws.onmessage = function(event) {
	//TODO CHANGE THIS TO HIGHCHARTS
	var res_data = JSON.parse(event.data); //messages are objects, not pure JSON
	
	// console.log(res_data);
	// response = generate_chart();
	data = [res_data.data];
    console.log("Streaming data input received : " + data);
    var chart = $('#feed_main_chart').highcharts();
    for (i = 0; i < data.length; i++) {
    	console.log(data[i])
    	console.log("adding point at " + data[i][0]);
    	chart.series[0].addPoint([data[i][0], data[i][1]], true, false);
    }
}

//If we don't do this, often the browser will just leave the ws open forever.
window.addEventListener("beforeunload", function(event) {
	ws.close();
});

// var graphs_present = $(".chart").length > 0; //NOTE: Only open sockets if we have something to do with them. Update this boolean if more use cases arise. 
// if (graphs_present) {
	
// }