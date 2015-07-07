/* 
Create the Network, and Domain Selection dropdown menu

Copyright (c) 2013. All Rights reserved.
   If you use this script, please email me and let me know, thanks!
   Andrew Hedges, andrew(at)hedges(dot)name
*/

(function (window, document, undefined) {
  'use strict'

  function Narrower(inp, sel, disp, list) {
    this.inp  = inp
    this.sel  = sel
    this.disp = disp
    this.list = list
    this.last = '' // last value on which we narrowed
  }
  Narrower.prototype = {
    init : function () {
      this.update('')
      this.addEvents()
    },
    addEvents : function () {
      var self
      self = this
      this.inp.addEventListener('keyup', function (e) {
        if (this.value !== self.last) {
          self.last = this.value
          self.update(this.value)
        }
      })
      this.inp.focus()
    },
    update : function (str) {
      var ulist, rgxp
      // optimization
      if (0 === str.length) {
        ulist = this.list
      }
      else {
        ulist = []
        // create rgxp
        rgxp = new RegExp(str, 'i') // note: not Unicode-safe!
        // keep items that match
        for (var i = this.list.length - 1; i > -1; --i) {
          if (null !== this.list[i].match(rgxp)) {
            ulist.push(this.list[i])
          }
        }
      }
      this.updateSelect(ulist.sort())
      this.updateMatches(ulist.length)
    },
    updateSelect : function (arr) {
      var self, opts
      self = this
      this.sel.options.length = 0
      opts = this.buildOpts(arr)
      opts.forEach(function (opt, idx) {
        self.sel.options[idx] = opt
      })
    },
    buildOpts : function (arr) {
      var opts
      opts = []
      arr.forEach(function (val) {
        opts.push(new Option(val))
      })
      return opts
    },
    updateMatches : function (len) {
      this.disp.innerHTML = 1 === len ? '1 match' : len + ' matches'
    }
  }

  // initialization for span form
  var inp  = document.querySelector('#nrwr')
  var sel  = document.querySelector('#spanNames')
  var disp = document.querySelector('#spanMatches')
  var spanList = ['ALL', 'mobile', 'freeflow', 'csi', 'cmso', 'dna', 'akanote', 'iis', 'ffs', 'ddc', 'icecast', 'crypto', 'volta', 'mediac', 'essl', 'euc', 'ffessl', 'ingest', 'multi1', 'internal', 'ness', 'storage', 'mts', 'netmgmt', 'map', 'cobra', 'noffessl', 'mega', 'flash', 'odin', 'infra', 'srip', 'feo', 'c2s', 'netview'];
  // kick it off
  var nrwr = new Narrower(inp, sel, disp, spanList)
  nrwr.init()

  //same for domain form
  var inp2  = document.querySelector('#nrwr2')
  var sel2  = document.querySelector('#domainNames')
  var disp2 = document.querySelector('#domainMatches')
  var domainList = ['ALL', 'dev', 'mapnoccthree', 'mapnocctwo', 'pacmanb', 'mui', 'amstwo', 'portala', 'perf', 'prodb', 'static', 'portalrv', 'portalc', 'devbl', 'nmtc', 'cogs', 'amsfour', 'nocc-auto', 'svcperf', 'monster', 'ams', 'amscmp', 'nmt', 'prod', 'amsstagethree', 'resolve', 'nmtb', 'amsstagefour', 'nocc', 'dashboard', 'perfbl', 'mapnocc', 'ump', 'proda', 'pacman', 'amsstage', 'nmtd', 'mapnoccfour', 'regionview', 'mapnoccfive', 'amsthree', 'prodc', 'portalb', 'estats', 'amsstagetwo', 'nie']
  var nrwr2 = new Narrower(inp2, sel2, disp2, domainList)
  nrwr2.init()

}(this, this.document))


/*
Add in all the options and the default settings
*/
$(function () {

    // Add table and IP input boxes
    $('<p><input type="button" id="CPU_RSS_threads" value = "Graph"><br></p>').appendTo('#other');
    $('<p><input type="datetime-local" id="startDate" placeholder = "Start Date" size="12" > - Start Date</p>').appendTo('#option_inputs');
    $('<p><input type="datetime-local" id="endDate" placeholder = "End Date" size="12" > - End Date</p>').appendTo('#option_inputs');

    //Set defaults
    $("option:contains('ALL')")[0]["selected"] = true; //span
    $("option:contains('ALL')")[1]["selected"] = true; //domain
    //Start and end dates
    Date.prototype.today = function () { 
      return (this.getFullYear() + "-"  + (((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) + "-"  + ((this.getDate() < 10)?"0":"") + this.getDate());
    }
    Date.prototype.timeNow = function () {
       return "T" + ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes();
    }
    var newDate = new Date();
    var datetime = newDate.today() + newDate.timeNow();
    $("#endDate").val(datetime)
    var prevDate = new Date(new Date(datetime) - (60*60*24*365*4*1000)).toJSON().substring(0,16) //edit the string to make it the right format
    $("#startDate").val(prevDate);

    // If you click the buttons, functions will run
    // $('#pageFaults').bind('click', submit_query(0));
    // $('#contextSwitches').bind('click', submit_query(1));
    // $('#IOblocks').bind('click', submit_query(2));
    // $('#CPU_RSS_threads').bind('click', submit_D3_query);
});


/*
Initialize the page with graphs
*/
var initial_sub_feed = {
  chart: {type: 'area', zoomType: 'xy'},
  title: {text: 'Thread Statistics over Time'},
  legend: {enabled: true},
  xAxis: {type: 'datetime',
      dateTimeLabelFormats: { // don't display the dummy year
          month: '%e. %b',
          year: '%b'
      },
      title: {text: 'Date'},minRange: 1
  },
  yAxis: { title: { text: 'Page Faults'},
      min: 0,
  },
  legend: {
      align: 'right',
      x: -20,
      verticalAlign: 'top',
      y: 25,
      floating: true,
      backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
      borderColor: '#CCC',
      borderWidth: 1,
      shadow: false
  },
  tooltip: {
      headerFormat: '<b>{series.name}</b><br>',
      pointFormat: '{point.x:%e - %b - %Y}: {point.y:.0f}'
  },
  plotOptions: {
      area: { stacking: 'normal', lineColor: '#666666', lineWidth: 1,
          marker: { lineWidth: 1, lineColor: '#666666' }
      }
  },
  series: [{
      name: 'Minor',
      data: [[1432897800000.0, 2909], [1432899000000.0, 713], [1432903800000.0, 670], [1432905600000.0, 321], [1432906800000.0, 1517], [1432908900000.0, 1147]]
  },
  {
      name: "Major",
      data: [[1432897800000.0, 0], [1432899000000.0, 0], [1432903800000.0, 0], [1432905600000.0, 0], [1432906800000.0, 0], [1432908900000.0, 0]]
  }]
};

$(function () {
  //Add buttons
  $('<p><input type="button" id="pageFaults" value = "Page Faults"><br></p>').appendTo('#feed_3_chart');
  $('<p><input type="button" id="contextSwitches" value = "Context Switches" ><br></p>').appendTo('#feed_3_chart');
  $('<p><input type="button" id="IOblocks" value = "I/O Blocks"><br></p>').appendTo('#feed_3_chart');
  $('#feed_1_chart').highcharts(initial_sub_feed);
  $('#feed_2_chart').highcharts(initial_sub_feed);
})

/*
Draw the D3 code for the 3D graph
*/
var dataset;

// Initialize the data. TEMPORARILY TURNED OFF
d3.json("/static/query/tst.json", function(nations) {
  initializeD3Graph(nations);
});

function initializeD3Graph(nations) {

  /*
  Make the 3D graph with Thread Stats
  Thank you to http://bost.ocks.org/mike/nations/ for the code
  */
  // Various accessors that specify the four dimensions of data to visualize.
  function x(d) { return d.CPU_Time; }
  function y(d) { return d.RSS_Memory; }
  function radius(d) { return d.numSources; }
  function color(d) { return d.color; }
  function key(d) { return d.name; }

  // Chart dimensions.
  var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5},
      width = 650 - margin.right,
      height = 400 - margin.top - margin.bottom;

  // Various scales. These domains make assumptions of data, naturally.
  var xScale = d3.scale.linear().domain([0, 3e9]).range([0, width]), //3923196000
      yScale = d3.scale.linear().domain([0, 40e6]).range([height, 0]), //1923992480
      radiusScale = d3.scale.sqrt().domain([0, 30]).range([0, 30]),
      colorScale = d3.scale.category10();

  // The x & y axes.
  var formatValue = d3.format(".2s");
  var xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(12).tickFormat(d3.format("s")), //",d"
      yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(12).tickFormat(d3.format("s"));

  var zoom = true;
  // Create the SVG container and set the origin.
  var svg = d3.select("#feed_main_chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .on("mousedown", function(d) {
        redrawAxis();
        // var p = d3.mouse(svg[0][0]);
        // downx = xScale.invert(p[0]);
        // downscalex = xScale;
      })
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add the x-axis.
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // for resizing axis (courtesy of http://bl.ocks.org/rmarimon/1179647)
  function redrawAxis() {
    var X = 3e9; var Y = 40e6;
    if (zoom) {
      X = 20e6; Y = 20e6;
    }
    xScale.domain([0, X]);
    svg.select(".x.axis").transition().duration(100).call(xAxis);
    yScale.domain([0, Y]);
    svg.select(".y.axis").transition().duration(100).call(yAxis);

    zoom = !zoom;
    console.log("redrawing");

  }

  // Add the y-axis.
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  // Add an x-axis label.
  svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height - 6)
      .text("CPU_Time (milliseconds)");

  // Add a y-axis label.
  svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("RSS Memory (KB)");

  // Add the year label; the value is set on transition.
  var label = svg.append("text")
      .attr("class", "year label")
      .attr("text-anchor", "end")
      .attr("y", 24)
      .attr("x", width)
      .text((new Date(1432891800000)).toString().substring(4, 25));

  dataset = nations;

  // A bisector since many nation's data is sparsely-defined.
  var bisect = d3.bisector(function(d) { return d[0]; });

  // Add a dot per nation. Initialize the data at 1432891800000, and set the colors.
  var dot = svg.append("g")
      .attr("class", "dots")
    .selectAll(".dot")
      .data(interpolateData(1432891800000))
    .enter().append("circle")
      .attr("class", "dot")
      .style("fill", function(d) { return colorScale(color(d)); })
      .call(position)
      .sort(order);

  // Add a title.
  dot.append("title")
      .text(function(d) { return d.name; });

  // Add an overlay for the year label.
  var box = label.node().getBBox();

  var overlay = svg.append("rect")
        .attr("class", "overlay")
        .attr("x", box.x)
        .attr("y", box.y)
        .attr("width", box.width)
        .attr("height", box.height)
        .on("mouseover", enableInteraction);

  // Start a transition that interpolates the data based on year.
  svg.transition()
      .duration(60000)
      .ease("linear")
      .tween("year", tweenYear);
      // .each("end", enableInteraction);

  // Positions the dots based on data.
  function position(dot) {

    dot .attr("cx", function(d) { return xScale(x(d)); })
        .attr("cy", function(d) { return yScale(y(d)); })
        .attr("r", function(d) { return radiusScale(radius(d)); });
  }

  // Defines a sort order so that the smallest dots are drawn on top.
  function order(a, b) {
    return radius(b) - radius(a);
  }

  // After the transition finishes, you can mouseover to change the year.
  function enableInteraction() {
    var yearScale = d3.scale.linear()
        .domain([1432891800000, 1432910400000])
        .range([box.x + 10, box.x + box.width - 10])
        .clamp(true);

    // Cancel the current transition, if any.
    svg.transition().duration(0);

    overlay
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
        .on("touchmove", mousemove);

    function mouseover() {
      label.classed("active", true);
    }

    function mouseout() {
      label.classed("active", false);
    }

    function mousemove() {
      displayYear(yearScale.invert(d3.mouse(this)[0]));
    }
  }

  // Tweens the entire chart by first tweening the year, and then the data.
  // For the interpolated data, the dots and label are redrawn.
  function tweenYear() {
    var year = d3.interpolateNumber(1432891800000, 1432910400000);
    return function(t) { displayYear(year(t)); };
  }

  // Updates the display to show the specified year.
  function displayYear(year) {
    dot.data(interpolateData(year), key).call(position).sort(order);
    label.text((new Date(year)).toString().substring(4, 25)); //Math.round(year)
  }

  // Interpolates the dataset for the given (fractional) year.
  function interpolateData(year) {
    return nations.map(function(d) {
      return {
        name: d.name,
        color: d.color,
        CPU_Time: interpolateValues(d.CPU_Time, year),
        numSources: interpolateValues(d.numSources, year),
        RSS_Memory: interpolateValues(d.RSS_Memory, year)
      };
    });
  }

  // Finds (and possibly interpolates) the value for the specified year.
  function interpolateValues(values, year) {
    var i = bisect.left(values, year, 0, values.length - 1),
        a = values[i];
    if (i > 0) {
      var b = values[i - 1],
          t = (year - a[0]) / (b[0] - a[0]);
      return a[1] * (1 - t) + b[1] * t;
    }
    return a[1];
  }
}

/*
Functions that redraw graphs
*/
var submit_D3_query = function(e) {
  var args = {
    table: 'tst_CPU_RSS',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    c: $('#startDate').val().replace('T', ' '),
    d: $('#endDate').val().replace('T', ' ')
  };
  args = $.param(args);
  $.getJSON('/_make_query', args, function(data) {
      console.log(data);
      // Update the d3 graph
      // response = initial_sub_feed;
      // response.series[0].data = data.data1;
      // response.series[1].data = data.data2;
      // var chart = $('#feed_1_chart').highcharts();
      // var chart = new Highcharts.Chart(response);
  });
  return false;
}

var submit_query = function(numOption) {
  var args = {
    table: 'tst',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    option: numOption,
    f: $('#startDate').val().replace('T', ' '),
    g: $('#endDate').val().replace('T', ' ')
  };
  args = $.param(args);
  $.getJSON('/_make_query', args, function(data) {
        console.log(data.data1, data.data2);
        response = initial_sub_feed;
        response.series[0].data = data.data1;
        response.series[1].data = data.data2;
        var chart = $('#feed_1_chart').highcharts();
        var chart = new Highcharts.Chart(response);
  });
  return false;
};
