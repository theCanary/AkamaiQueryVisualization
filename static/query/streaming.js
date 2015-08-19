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
	console.log(new_uri);
	return new WebSocket(new_uri);
}


// Based on http://stackoverflow.com/questions/12014412/highcharts-getting-y-value-in-one-series-based-on-x-value-from-another-series
function getPointFromIndex(xValue){
	var chart = $('#feed_main_chart').highcharts();
	var points=chart.series[0].data;
	var point=null;
	for(var i=0;i<points.length;i++){
	if(points[i].x==xValue) {
		console.log(points[i].x, xValue, "ok");
		point = points[i];
	}
	}
	return point;
}


// Add Point to graph
function draw_on_graph(data, seriesNum) {
    var chart = $('#feed_main_chart').highcharts();
    for (i = 0; i < data.length; i++) {
      console.log("received point at " + [data[i][0], data[i][1]]);
      var point = getPointFromIndex(data[i][0]);
      if (point == null) {
        console.log("adding point");
        newPoint = [data[i][0], data[i][1]];
        chart.series[seriesNum].addPoint(newPoint);
        if (seriesNum == 0) {
        	chart.scroller.series.addPoint(newPoint)
        }
      }
      else {
        console.log("updating point");
        var y = point.y;
        point.update(y += data[i][1]); //, false, true
      }
    }
}

//If we don't do this, often the browser will just leave the ws open forever.
// window.addEventListener("beforeunload", function(event) {
// 	ws.close();
// });
