/** This script handles networking functions like websockets. **/

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
		if (pathname.endsWith("/")) { //nOTE: all my URLs will hit this, but we write both kinds for completeness
			new_uri += loc.pathname + relative_path; 
		} else {
			new_uri += loc.pathname + "/" + relative_path;
		}
	}
	return new WebSocket(new_uri);
}

//fetch alerts using AJAX and create display
function get_initial_alerts(alert_display,display_top) {
	$.ajax({
		method:"get",
		url:"/alerts/",
		dataType:"json",
		success: function(responseData) {
			create_initial_alert_display(responseData.data,alert_display,display_top);
		},
		error: function(request, statust, error) {
			console.error("Trouble getting alerts because of: " + error);
			$(".remove_on_data").remove();
			display_top.append("<p>Could not get the current alerts. Please refresh and try again.</p>");
		}
	});
}

/*
Function for creating a graph based on response data. Abstracted away such that the below onmessage function doesn't look like a disaster.
container is the jquery object where we will put the graph, data is the data array received through JSON, chart_type is currently either
"line" or "bar".
*/
function graph_create(container,data,chart_type) {
		var chart_width = container.width() - 40;
		//NOTE: This may be called before $(document).ready(), so recalculate anyway
		//to avoid potential concurrency pitfalls - division+round is probably
		//faster than looking up the height anyway!
		var chart_height = Math.round(chart_width / HEIGHT_CONST);
		var color;
		switch(chart_type) {
			case "line":
				color = "steelblue";	
				break;
			case "bar":
				color = new Rickshaw.Color.Palette( {scheme: 'httpStatus'} ); 
				break;
			default:
				console.error("Chart type " + chart_type + " is not supported");
				return null;
		}
		return create_chart(chart_type,chart_width,chart_height,data,container,color);
}	

/* Below are global-scope functions to set up data fetching, including setting up the main websocket for the page.
We must be careful with the ws and ensure it closes when we close a tab because otherwise we have an open socket that doesn't transfer. We also have to re-create web sockets at each new page... 
TODO: Reconsider refactoring site into a single-page application perhaps?
*/
var display_top = $(".display_top_alerts").length > 0;
//remember - 0 means false, everything else is true, so we take advantage of this nad jQuery's collections 
var alert_display = $(".alerts_container"); //two layers so we only execute JSON when we really need to, and reduce code repetition.
var feeds = {}; //create this so we can store references to all the graph objects...
if(alert_display.length) {
	get_initial_alerts(alert_display,display_top);
}
var ws = open_websocket("/socket/");	
//TODO: Replace the below with stuff not specific to our fake data generator
//This ws onmessage declaration handles all our data types.
ws.onmessage = function(event) {
	var res_data = JSON.parse(event.data); //messages are objects, not pure JSON
	var json_type = res_data.type.split("_");
	var data_type = json_type[0];
	switch(data_type) {
		case "alert":
			var alerts_data = res_data.data;
			var operation_type = json_type[1];
			if (operation_type == "add"){
				$(alert_display).find(".remove_on_data").remove();
				//insert them individually; means it's easier to keep the alerts array sorted
				for (var i=0; i < alerts_data.length; i++) {
					//NOTE: you can o $($(".foo")) and still have it work!
					insert_alert(alerts_data[i],alert_display,display_top);
				}
			}else if (operation_type == "remove") {
				for (var j=0; j < alerts_data.length; j++) {
					pop_alert(alerts_data[j],alert_display,display_top);
				}
			}
			break;
		case "graph":
			var feed_name = res_data.feed_name;
			//IF no feed_name is given, assume this is the main container
			//this is by design to make it loose.
			if (feed_name == "") {
				feed_name = "main";
			}
			var field_name = res_data.field_name;
			var chart_type = json_type[1]; //these are always graph_stuff
			//MAKE SURE THIS DATA FORMAT STAYS THAT WAY!
			var container = $("."+feed_name+"_chart_container");
			//we need the actual graph object to update things.
			var feed_to_update = feeds[feed_name];
			if (feed_to_update  == undefined) {
				//we don't have a graph yet, so create it.
				//DON'T assign feed_to_update to this. We need to create a new reference in feeds.
				feeds[feed_name] = graph_create(container,res_data.data,chart_type);
				$(container).find(".remove_on_data").remove();
				//NOTE: remember empty strings are "falsy"
				if (field_name) {
					var header = $(container).find(".page-header");
					header.html(field_name);
					header.fadeIn();
				}
			} else {
				update_chart(chart_type,feeds[feed_name],res_data.data,container); //TODO: Figure out breakpoints
			}
			break;
		default:
			console.error("Data type " + data_type + " is not supported.");
			break;
	}
};

//If we don't do this, often the browser will just leave the ws open forever.
window.addEventListener("beforeunload", function(event) {
	ws.close();
});
