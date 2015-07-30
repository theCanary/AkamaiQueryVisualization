/**
Miscellaneous d3.js and Rickshaw graphing functions, born out of the initial graphing prototype for LightHouse.
**/

/*
Scaling constants for getting the maximum number of points on a graph to look nice
at a particular scale. Derived empirically, used such that we can change resolutions
for graphs in development without making them look strange or re-calculating what a good
number of maximum points to display would be.
*/
var max_points_constants = {line:0.18518518518519,bar:0.09259259259259};

/*
Constant for the ratio of width to height for a chart.
*/
HEIGHT_CONST = 2.25;

/*
General function for creating a chart. Can be extended to more than line or bar chart if we ever
decide to use those - ideally the function that takes the data from the server shouldn't
have to bother with graphing details.
All parameters here are documented in the functions for graphing line and bar charts; however,
note that "color" here can either be a palette or just a single color, depending on the graph type.
In order for the chart to display properly, elem must be a parent element (graph container),
and contain ".graph" and ".y_axis" elements so that we can render the graph properly.
*/
function create_chart(type,width,height,initial_data,elem,color,breakpoints) {
	var graph;
	//do chart type-specific stuff first, then do generic stuff
	//render here - don't delegate responsibility to websocket code for display!
	var chart_elem = $(elem).find(".chart")[0];
	var y_axis_elem = $(elem).find(".y_axis")[0];
	if (type == "line") {
		graph = line_chart(width,height,initial_data,chart_elem,color);
	} else if (type == "bar") {
		graph = stacked_bar_chart(width,height,initial_data,chart_elem,color);
	} else {
		console.error("Graph type " + type + " not supported!");
		return null;
	}
	var hoverDetails = add_hover_to_graph(graph,anomaly_formatter(breakpoints,"X value in anomaly range<br>"));
	graph.hoverDetails = hoverDetails; //IMPORTANT!! Make sure we attach these here such that we can update later when we /do/ have breakpoints!
	var y_axis = create_chart_y_axis(graph,y_axis_elem);
	graph.render();
	//There's probably a cleaner way to write this case; but the anomaly indicators MUST be drawn AFTER
	//rendering the graph!
	if (type == "line" && breakpoints) {
		draw_anomaly_indicators_line_graph($(elem).find("svg"),initial_data,breakpoints,width,height);
	}
	//make sure we do the hack to have the hoverDetails aligned properly
	$(elem).find(".chart svg").css("left",-(width / 10));
	return graph;
}

/*
Draws a line chart with a specified width and height, at element elem,
with Rickshaw color in var color, initialized with data of the format:

[ {x: numeric, y: numeric},
	{x: numeric, y: numeric},
	(...)
]

This function returns the Rickshaw graph created so that other
functions can modify it later. 
Breakpoints are included such that we can initialize with anomaly breakpoints.
If no breakpoints are provided, we just draw data as-is.*/ 
function line_chart(width, height, initial_data, elem, color) {
	var graph = new Rickshaw.Graph( {
		element: elem,
		width: width,
		height: height,
		renderer: 'line',
		series: [{
			color: color,
			data: initial_data,
			name: "Original Data" //we don't care about this for our purposes.
		}]
	});
	return graph;
}

/**
Creates a stacked bar chart with a specified width and height, at element elem,
with Rickshaw color defined by palette (which must be a Rickshaw.Color.Palette),
and has data initial_data. The data format for initial_data is:

{
 time_unit: {category_1: value, category_2: value, (...) },
 time_unit_2: {category_1: value, category_2: value, (...) }
}

In this way, we group the counts for each bar at every time unit.
*/
function stacked_bar_chart(width,height,initial_data,elem,palette) {
	var usable_data = transformData(initial_data,palette);
	var graph = new Rickshaw.Graph({
		element: elem,
		width: width,
		height: height,
		renderer: 'bar', //in theory this can be changed to "area" without issue.
		series: usable_data,
	});
	graph.palette = palette; //for some reason they don't think to keep this. 
	return graph;
}


/*
Creates the Y axis of a graph with K, M, B, T in place of "thousand", "million", "billion", "trillion"
for easier readability. scale, if null, is default set to a linear scale.
elem should be where you want to place the y axis (usually an element called y_axis).
*/
function create_chart_y_axis(graph, elem, scale) { 
	var y_axis = new Rickshaw.Graph.Axis.Y( {
		graph: graph,
		orientation: 'left',
		tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
		element: elem,
		scale: scale ? scale : undefined
	});
	return y_axis;
}

//function create_log_scale
/**
Adds a hovering tooltip to a line chart, with a custom formatter. The formatter
must be provided by the user because different anomalies require different formatters.
**/
function add_hover_to_graph(graph, formatter) {
		var hoverDetails = new Rickshaw.Graph.HoverDetail( {
			graph: graph,
			formatter: formatter
		});
		return hoverDetails;
}

/**
Given a set of breakpoints, finds whether a particular point is an anomalous point, by its x coordinate.
**/
function is_point_anomaly(breakpoints, x) {
	var is_anomaly = breakpoints.some(
		function(element, index, array) {
			return x >= element.start && x <= element.end;
		}
	);
	return is_anomaly;
}

/**
Creates a formatter for any timeseries that automatically checks
for the "breakpoints" (i.e. start and end) of an anomaly. This is a function
closure because the formatter has to take exactly three arguments.
Anomaly_message is the message that you'd want to display along with the value of the chart on the
tooltip.
breakpoints is a list of objects with {'start':point, 'end':point}. The loop goes through each breakpoint,
and if our data point is within a pair of breakpoints, we label it anomalous. Otherwise, we don't.
This works for anything that has a timeseries component to it.
If there AREN'T any breakpoints, make sure we still format things correctly. 
*/
function anomaly_formatter(breakpoints, anomaly_message) {
	return function(series, x, y) {
		var date = '<span class="date">' + new Date(x*1000).toUTCString() + "</span>";
		var content = series.name + ":" + parseInt(y) + "<br>";
		//check if x is within at least one of our breakpoints
		//if it is, then label it as such
		if (breakpoints) {
			if (is_point_anomaly(breakpoints,x)) {
				content = content + anomaly_message;
			}
		}
		content = content + date;
		return content;
	};
}

/**
Drops the tail of a series. used to splice in the new head at the end, for live updates.
**/
function dropData(s) {
	s.forEach(function(item) {
		item.data.splice(0,1);
	});
	s.currentSize -= 1; //this may be unnecessary - keep it here for completeness.
}

/*
Generically updates a graph depending on its type by calling one of our specific functions
for doing so below here. 
*/
function update_chart(chart_type,graph,data,container,breakpoints) {
	if(!(chart_type in max_points_constants)) {
		console.error("should not be here. Chart type " + chart_type + " is not supported.");
		return null;
	}
	var max_points = Math.round(max_points_constants[chart_type] * container.width());
	switch(chart_type) {
		case "line":
			add_data_to_line_chart(graph,data,max_points);
			graph.update();
			if (breakpoints) {
				var selector = container.find("svg");
				draw_anomaly_indicators_line_graph(selector,graph.series[0].data,breakpoints,graph.width,graph.height);
			}
			break;
		case "bar":
			add_data_to_bar_chart(graph,data,max_points);
			graph.update();
			break;
		default:
			console.error("Chart type " + chart_type + " is not supported.");
			return null;
	}
}

/**
Takes a graph, as well as some arbitrary data (possibly passed in through JSoN),
and adds new data to its first series (which is assumed to be the one we care about!). 
Note that the new data must be properly formatted!
max_points is the maximum number of points we allow on the graph.
**/
function add_data_to_line_chart(graph, new_data, max_points) {
	var graph_data = graph.series[0].data;
	for (var i =0; i < new_data.length; i++ ) { 
		graph_data.push(new_data[i]);
		if (graph_data.length > max_points) {
			//if we have too much data, drop it
			//A generic version may be faster, but the delay right now is imperceptible.
			dropData(graph.series); //dropData actually drops stuff from an array/ of series, so this loop could be written differently.
		}
	}
}

/**
Adds data to a "stacked bar" chart. See here for an example of a stacked bar chart:
http://code.shutterstock.com/rickshaw/examples/status.html
This code should in theory also work with stacked area plots, but it has not been tested for them.
*/
function add_data_to_bar_chart(graph,new_data,max_points){
	var usable_data = transformData(new_data,graph.palette); //this gives us a series array
	for (var i = 0; i < usable_data.length; i++) {
		//for each of the series in usable data,
		var seriesName = usable_data[i].name;
		//match it to the correct series in the original graph,
		var otherSeries = findSeries(graph,seriesName);
		if(otherSeries == null) {
			//if we've never seen this type yet, add it to the graph
			otherSeries = {
				name: seriesName,
				data: [], //does this actually work?
				color: palette.color(seriesName)
			};
			graph.series.push(otherSeries);
		}
		//and now push to it
		Array.prototype.push.apply(otherSeries.data,usable_data[i].data);
		var diff_size = otherSeries.data.length - max_points;
		//and drop the data that there's too much of
		if (diff_size > 0) {
			//remove the first n, where n is the difference between max_points and what we get after adding new data

			otherSeries.data.splice(0,diff_size);
		}
	}
	//at this point the user should render. There may be other things they want to do,
	//such as call d3 to do other shape manipulations, so don't have them do stuff here.
}

/**
Given a graph, which has a list of series, finds the series with the correct name.
**/
function findSeries(graph,seriesName){
	var allSeries = graph.series;
	for (var i = 0; i < allSeries.length; i++) {
		if (allSeries[i].name == seriesName) { 
		//we defined these ourselves, there better be a match!
			return allSeries[i];
		}
	}
	console.warn("Could not find series by name: " + seriesName + "; adding it to the graph.");
	return null; //why are we here?
}

/*
This code takes as input the CSS selector of the SVG of the chart that we're trying to modify
(in this case, we want to make sure that d3 can actually fetch them right), as well as the data
along with breakpoints so we can label anomalies (see extract_anomaly_points for more details on this)
and will first remove all current anomaly indicators (right now, they're circles with red fill),
then fill in the svg with these. This is needed in the formatter because we will be constantly
updating the graph. Width and height are also included because we need to redo our graph scaling
on each new load.
**/
function draw_anomaly_indicators_line_graph(selector,data,breakpoints,width, height) {
	var vis = d3.select(selector);
	//these are time series to min and max X are just the edges of the current total series
	var xScale = d3.time.scale().domain([data[0].x,data[data.length-1].x]).range([0,width]);
	var y_bounds = find_y_boundaries(data);
	var yScale = d3.scale.linear().domain([0,y_bounds[1]]).range([height,0]);
	//ok, now we have scale properly set 
	//since the above functions are likely to be a little slow, remove the circles now that we're done re-computing
	var anomaly_points = extract_anomaly_points(data, breakpoints);
	vis.selectAll("circle.line").remove();
	//now for the "fun" d3 part (we only hold the value of this for debugging; we don't lose anything by doing so):
	var circles = vis.selectAll("circle.line")
		.data(anomaly_points)
		.enter()
		.append("svg:circle")
		.attr("class","line")
		.attr("cx", function(d) { return xScale(d.x); })
		.attr("cy", function(d) { return yScale(d.y); })
		.attr("r",3.5)
		.attr("fill","red");
}

/**
Given an array of data points, and an array of breakpoints, returns an array with only
the data points inside the breakpoints. This is used to create the anomaly indicators
for line charts.
**/
function extract_anomaly_points(data, breakpoints) {
	var anomaly_points = [];
	data.forEach(function(point) { 
		if (is_point_anomaly(breakpoints, point.x)) {
			anomaly_points.push(point);
		}
	});
	return anomaly_points;
}

/*
Finds min and max Y in a data set. We can't do this with some built-in function because of the fact
that our object format is specific.
*/
function find_y_boundaries(data) {
	var minY = Infinity;
	var maxY = -Infinity;
	data.forEach(function(item) { 
		if ( item.y < minY ) {
			minY = item.y;
		}
		if (item.y > maxY) {
			maxY = item.y;
		}
	});
	return [minY, maxY];
}

/**
Converts data from a (mostly) human-readable format which we pass in from JSON,
to a format that Rickshaw can eat.
Taken from http://code.shutterstock.com/rickshaw/examples/status.html
All credit to Shutterstock.
Adapted because the Shutterstock version had var palette in global scope,
and thus this was ignored from the function arguments.
*/
function transformData(d,palette) {
	var data = [];
	var statusCounts = {};

	Rickshaw.keys(d).sort().forEach( function(t) {
		Rickshaw.keys(d[t]).forEach( function(status) {
			statusCounts[status] = statusCounts[status] || [];
			statusCounts[status].push( { x: parseFloat(t), y: d[t][status] } );
		} );
	} );

	Rickshaw.keys(statusCounts).sort().forEach( function(status) {
		data.push( {
			name: status,
			data: statusCounts[status],
			color: palette.color(status)
		} );
	} );

	Rickshaw.Series.zeroFill(data);
	return data;
}

$(document).ready(function() {
	//Setting the chart container divs to have the correct height ratio using only CSS
	//is a nasty hack and may hurt us in the future. As such, I'm placing the responsibility
	//of this in this $(document).ready() function. Hopefully this does not accrue further
	//technical debt.
	$(".chart_container").each(function(index) {
		var corrected_width = $(this).width() - 40; //y-axis doesn't count
		var corrected_height = corrected_width / HEIGHT_CONST;
		//NOTE: we can't set chart_container to have this height becuase the SVG
		//is what needs the height...so make .chart and y_axis work that way.
		$(this).find(".chart").css("height",corrected_height);
		$(this).find(".y_axis").css("height",corrected_height);
		//NOTE: y-axis and the svg container interplay in a "special" way because of
		//the height constraints. While the -40 constant above still seems to work,
		//we run into other problems when scaling up the width of the y_axis component.
		//Therefore, we must set it to be 1/10th of the corrected width,
		//though this may not seem to make that much sense at first.
		$(this).find(".y_axis").css("width",corrected_width / 10);
		$(this).find(".chart").css("left",corrected_width / 10);
	});

});
