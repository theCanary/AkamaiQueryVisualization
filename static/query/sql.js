/*
This populates the page threadstats.html
Software used: Impyla, Impala, Hive
Author: Ashley Wang
*/

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
    // Add query and time inputs
    $('<p><input type="text" id="host" placeholder = "Host name" size="12" ></p>').appendTo('#other');
    $('<p><input type="text" id="client" placeholder = "Client" size="12" ></p>').appendTo('#other');
    $('<p>The following is only for the GOT pipeline: </p>').appendTo('#other');
    $('<p><input type="text" id="table" placeholder = "Table" size="12" ></p>').appendTo('#other');
    $("<p><select id = 'option'><option>Returned Rows</option><option>Total Generated Rows</option>" +
      "<option>Query Processing Time</option> <option>Total Elapsed Time</option> <option>Number of Interrupts</option>" +
      "<option>Number of Error Messages</option><option>Number of Distinct Error Messages</option>" +
      "<option>Total Table Bytes</option> <option>Total Temp Table Bytes</option> <option>Total Table Indices</option> " +
      "<option>Total Temp Table Indices</option>  </select></p>").appendTo('#option_inputs');

    //Set defaults
    $("option:contains('ALL')")[0]["selected"] = true; //span
    $("option:contains('ALL')")[1]["selected"] = true; //domain

    //Create and add buttons
    $('<p>Click these to graph query stats data from the SQL pipeline</p>').appendTo('#sql_button_div');
    $('<p><input type="button" id="newGraph" value = "New Graph"><br></p>').appendTo('#sql_button_div');
    $('<p><input type="button" id="addGraph" value = "Add Graph"><br></p>').appendTo('#sql_button_div');
    
    $('<p>Click to graph table data from the GOT pipeline, showing the top tables with the largest amount of queries.</p>').appendTo('#got_button_div');
    $('<p><input type="button" id="newGraphGOT" value = "New Graph"><br></p>').appendTo('#got_button_div');
    // $('<p><input type="button" id="addGraphGOT" value = "Add Graph"><br></p>').appendTo('#got_button_div');

    // If you click the buttons, functions will run
    $('#newGraph').bind('click', submit_query);
    $('#addGraph').bind('click', submit_query_add);
    $('#newGraphGOT').bind('click', submit_query_GOT);
    // $('#addGraphGOT').bind('click', submit_query_add_GOT);
});


/*
Initialize the page with graphs
*/
function generate_chart() {
  return {
    chart: {type: 'column', zoomType: 'x'},
    title: {text: 'Number of Error Messages over Time'},
    ordinal: false,
    xAxis: {type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
            second: '%b %e',
            minute: '%b %e',
            hour: '%b %e',
            day: '%b %e',
            month: '%e. %b',
            year: '%b'
        },
        title: {text: 'Date'},minRange: 1
    },
    yAxis: { title: { text: 'Number of Error Messages'},
        min: 0,
        stackLabels: {
                  enabled: true,
                  style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
              }
    },
    exporting: {
        buttons: {
            contextButton: {
                menuItems: [{
                    text: 'Print Chart',
                    onclick: function () {
                        this.exportChart();
                    },
                    separator: false
                },
                {
                    text: 'Export to PNG',
                    onclick: function () {
                        this.exportChart();
                    },
                    separator: false
                },
                {separator: true},
                {text: 'Graph as Area Chart',
                onclick: function () {
                    a = $('#feed_main_chart').highcharts();
                    for (i = 0; i < a.series.length; i++) {if (a.series[i].type != 'flags') {a.series[i].update({type: 'area'})}};
                }},
                {text: 'Graph as Line Chart',
                onclick: function () {
                    a = $('#feed_main_chart').highcharts();
                    for (i = 0; i < a.series.length; i++) {if (a.series[i].type != 'flags') {a.series[i].update({type: 'line'})}};
                }},
                {text: 'Graph as Bar Chart',
                onclick: function () {
                    a = $('#feed_main_chart').highcharts();
                    for (i = 0; i < a.series.length; i++) {if (a.series[i].type != 'flags') {a.series[i].update({type: 'bar'})}};
                }},
                {text: 'Graph as Scatter Plot',
                onclick: function () {
                    a = $('#feed_main_chart').highcharts();
                    for (i = 0; i < a.series.length; i++) {if (a.series[i].type != 'flags') {a.series[i].update({type: 'scatter'})}};
                }}]
            }
        }
    },
    navigator: {
        enabled: true
    },
    legend: {
        enabled: true
    },
    turboThreshold: 0,
    plotOptions: {
        spline: {
                  marker: {
                      enabled: true
                  }
              }
    },
    series: [
        {
            name: 'q1emulator',
            id: 'dataSeries',
            tooltip: {pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.0f}</b><br/>'},
            data: [[1435603200000.0, 3780], [1435611300000.0, 12819], [1435625100000.0, 2948], [1435640400000.0, 17088], [1435665300000.0, 5836], [1435671000000.0, 17088], [1435683900000.0, 8544], [1435686300000.0, 5892], [1435686600000.0, 3777], [1435686900000.0, 4008], [1435687500000.0, 12813], [1435689000000.0, 14644], [1435690200000.0, 17084], [1435691100000.0, 12813], [1435691700000.0, 24940], [1435692600000.0, 7913], [1435693200000.0, 12813], [1435693500000.0, 3780], [1435694100000.0, 4292], [1435694400000.0, 17080], [1435694700000.0, 43515], [1435695600000.0, 54897], [1435698300000.0, 3523], [1435699200000.0, 3747], [1435699500000.0, 3747], [1435700100000.0, 12769], [1435700700000.0, 3908], [1435701000000.0, 3416], [1435701900000.0, 12813], [1435703700000.0, 5040], [1435704000000.0, 7856], [1435707900000.0, 7280], [1435708800000.0, 95432], [1435710000000.0, 17084], [1435710900000.0, 21360], [1435711800000.0, 17088], [1435713900000.0, 7126], [1435719000000.0, 20865], [1435720800000.0, 12816], [1435721400000.0, 17088], [1435721700000.0, 17088], [1435722900000.0, 3816], [1435723500000.0, 2547], [1435725000000.0, 4596], [1435725900000.0, 437708], [1435726200000.0, 16775], [1435726500000.0, 22932], [1435727100000.0, 17088], [1435728000000.0, 2520], [1435728300000.0, 5000], [1435728600000.0, 7280], [1435729500000.0, 3488], [1435729800000.0, 3488], [1435731300000.0, 4972], [1435731600000.0, 5892], [1435732800000.0, 3116], [1435736100000.0, 17084], [1435736400000.0, 3476], [1435737300000.0, 3076], [1435737600000.0, 3780], [1435737900000.0, 3780], [1435738800000.0, 5040], [1435739400000.0, 12810], [1435739700000.0, 8540], [1435740000000.0, 528756], [1435740300000.0, 17076], [1435740600000.0, 3928], [1435741500000.0, 17080], [1435741800000.0, 24185], [1435742100000.0, 12344], [1435742400000.0, 4292], [1435742700000.0, 18621], [1435743000000.0, 20588], [1435743300000.0, 273131], [1435743600000.0, 4292], [1435744200000.0, 21350], [1435744500000.0, 45435], [1435744800000.0, 13042], [1435745100000.0, 39790], [1435745400000.0, 18185], [1435745700000.0, 21774], [1435746000000.0, 546962], [1435746300000.0, 55771], [1435746600000.0, 74172], [1435746900000.0, 51007], [1435747200000.0, 113430], [1435747500000.0, 802510], [1435747800000.0, 1049353], [1435748100000.0, 342157], [1435748400000.0, 693402], [1435748700000.0, 6379800], [1435749000000.0, 7445967], [1435749300000.0, 3508236], [1435749600000.0, 9032690], [1435749900000.0, 11855194], [1435750200000.0, 11971297], [1435750500000.0, 20998706], [1435750800000.0, 26267080], [1435751100000.0, 19495636], [1435751400000.0, 16850666], [1435751700000.0, 25563946], [1435752000000.0, 16715715], [1435752300000.0, 25168807], [1435752600000.0, 24288604], [1435752900000.0, 27371056], [1435753200000.0, 19795483], [1435753500000.0, 27784445], [1435753800000.0, 22434174], [1435754100000.0, 32998979], [1435754400000.0, 18280124], [1435754700000.0, 29344211], [1435755000000.0, 26461752], [1435755300000.0, 21594567], [1435755600000.0, 17138878], [1435755900000.0, 24123149], [1435756200000.0, 15352119], [1435756500000.0, 24076616], [1435756800000.0, 24307374], [1435757100000.0, 25679599], [1435757400000.0, 23665909], [1435757700000.0, 30511828], [1435758000000.0, 21810108], [1435758300000.0, 22930255], [1435758600000.0, 18707795], [1435758900000.0, 28220464], [1435759200000.0, 26968181], [1435759500000.0, 26933680], [1435759800000.0, 16916373], [1435760100000.0, 21352609], [1435760400000.0, 15378886], [1435760700000.0, 24395740], [1435761000000.0, 26262340], [1435761300000.0, 29133666], [1435761600000.0, 28699575], [1435761900000.0, 30018267], [1435762200000.0, 16427358], [1435762500000.0, 18109086], [1435762800000.0, 18710701], [1435763100000.0, 25363496], [1435763400000.0, 15154065], [1435763700000.0, 22628355], [1435764000000.0, 7627908], [1435764300000.0, 6132212], [1435764600000.0, 2938616], [1435764900000.0, 3720679], [1435765200000.0, 1213086], [1435765500000.0, 1194003], [1435765800000.0, 333744], [1435766100000.0, 10904], [1435766400000.0, 61526]]
        }
    ]
  }
}

var initial_main_feed = generate_chart();

// For the GOT pipeline

function generate_got_chart() {
  return {
    chart: {type: 'column', zoomType: 'x'},
    title: {text: 'Number of SQL Queries including Table'},
    xAxis: {type: 'categories', categories: []},
    yAxis: { title: { text: 'Number of SQL Queries'},
        min: 0,
        stackLabels: {
                  enabled: true,
                  style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
              }
    },
    exporting: {
        buttons: {
            contextButton: {
                menuItems: [{
                    text: 'Print Chart',
                    onclick: function () {
                        this.exportChart();
                    },
                    separator: false
                },
                {
                    text: 'Export to PNG',
                    onclick: function () {
                        this.exportChart();
                    },
                    separator: false
                },
                {separator: true},
                {text: 'Graph as Area Chart',
                onclick: function () {
                    a = $('#feed_main_chart').highcharts();
                    for (i = 0; i < a.series.length; i++) {if (a.series[i].type != 'flags') {a.series[i].update({type: 'area'})}};
                }},
                {text: 'Graph as Line Chart',
                onclick: function () {
                    a = $('#feed_main_chart').highcharts();
                    for (i = 0; i < a.series.length; i++) {if (a.series[i].type != 'flags') {a.series[i].update({type: 'line'})}};
                }},
                {text: 'Graph as Bar Chart',
                onclick: function () {
                    a = $('#feed_main_chart').highcharts();
                    for (i = 0; i < a.series.length; i++) {if (a.series[i].type != 'flags') {a.series[i].update({type: 'bar'})}};
                }},
                {text: 'Graph as Scatter Plot',
                onclick: function () {
                    a = $('#feed_main_chart').highcharts();
                    for (i = 0; i < a.series.length; i++) {if (a.series[i].type != 'flags') {a.series[i].update({type: 'scatter'})}};
                }}]
            }
        }
    },
    navigator: {
        enabled: false,
    },
    legend: {
        enabled: true
    },
    tooltip: {
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.0f}</b><br/>',//'{point.x: %b/%e/%Y}: {point.y:.0f}'
        valueDecimals: 0
    },
    plotOptions: {
        spline: {
                  marker: {
                      enabled: true
                  }
              }
    },
    series: []
  }
}

var got_main_feed = generate_got_chart();

$(function () {
  //Add buttons
  var series = initial_main_feed.series;
  $('#feed_main_chart').highcharts("StockChart", initial_main_feed);
  initial_main_feed.series = series;
  drawFlags()
})

var colorWheel = 1;
var submit_query = function(e) {
  var optionNum = ["Returned Rows", "Total Generated Rows", "Query Processing Time", "Total Elapsed Time", "Number of Interrupts", "Number of Error Messages", "Number of Distinct Error Messages", "Total Table Bytes", "Total Temp Table Bytes", "Total Table Indices", "Total Temp Table Indices"].indexOf($('#option').val());
  var args = {
    table: 'sql',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    c: $('#host').val(),
    d: $('#client').val(),
    option: optionNum.toString()
  };
  args = $.param(args);
  console.log(args);
  $.getJSON('/_make_query', args, function(data) {
    response = initial_main_feed;
    console.log(data);
    response.series = response.series.slice(0,1);
    response.series[0].name = data.name;
    response.series[0].data = data.data;
    response.series[0].color = Highcharts.getOptions().colors[colorWheel];
    
    colorWheel += 1;
    var series = response.series;
    var chart = new Highcharts.StockChart(response);
    initial_main_feed.series = series;
    chart.title.attr({text: $('#option').val() + " over Time"});
    unit = "";
    if ($('#option').val().includes("Time")){
      unit += " (ms)"
    }
    chart.yAxis[0].axisTitle.attr({text: $('#option').val() + unit});
    drawFlags()
  });
  return false;
};


// Add a new line to the current graph
var submit_query_add = function(e) {
  var optionNum = ["Returned Rows", "Total Generated Rows", "Query Processing Time", "Total Elapsed Time", "Number of Interrupts", "Number of Error Messages", "Number of Distinct Error Messages", "Total Table Bytes", "Total Temp Table Bytes", "Total Table Indices", "Total Temp Table Indices"].indexOf($('#option').val());
  var args = {
    table: 'sql',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    c: $('#host').val().replace('*', '%'),
    d: $('#client').val().replace('*', '%'),
    option: optionNum.toString()
  };
  args = $.param(args);
  $.getJSON('/_make_query', args, function(data) {
    response = initial_main_feed;
    response.series.push({name: data.name, data: data.data, color: Highcharts.getOptions().colors[colorWheel]})
    
    colorWheel += 1;
    var series = response.series;
    var chart = new Highcharts.StockChart(response);
    initial_main_feed.series = series;
    chart.title.attr({text: $('#option').val() + " over Time"});
        unit = "";
        if ($('#option').val().includes("Time")){
          unit += " (ms)"
        }
        chart.yAxis[0].axisTitle.attr({text: $('#option').val() + unit});
  });
  return false;
};

var submit_query_GOT = function(e) {
  var args = {
    table: 'got',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    c: $('#host').val().replace('*', '%'),
    d: $('#client').val().replace('*', '%'),
    e: $('#table').val().replace('*', '%')
  };
  args = $.param(args);
  console.log("GOT console");
  $.getJSON('/_make_query', args, function(data) {

    // Process the data
    categories = []
    series = []
    for (var n = 0; n< data.data.length; n++) {
      var obj = data.data[n];
      categories.push(obj[0]);
      series.push(obj[1]);
    }
    response = got_main_feed;
    response.xAxis.categories = categories;
    if (response.series.length > 0){
      response.series = response.series.slice(0,1);
      response.series[0].name = data.name;
      response.series[0].data = series;
      response.series[0].color = Highcharts.getOptions().colors[colorWheel];
    }
    else {
      response.series.push({name: data.name, data: series, color: Highcharts.getOptions().colors[colorWheel]})
    }
    colorWheel += 1;
    var series = response.series;
    response.series = series;
    $('#feed_main_chart').highcharts(response) //Due to the nature of this graph, we don't use the navigator bar
    got_main_feed.series = series;
    drawFlags()
  });
  return false;
};
