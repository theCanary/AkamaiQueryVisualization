/*
This populates the page dashboard.html
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
  var spanList = ['ALL', 'akanote', 'euc', 'freeflow', 'essl', 'mobile', 'ffs', 'ddc', 'ffessl', 'iis', 'dna', 'volta', 'mediac', 'cmso', 'csi', 'icecast', 'mega', 'internal', 'feo', 'c2s', 'netmgmt', 'rum', 'odin', 'storage', 'cobra', 'ingest', 'srip', 'multi1', 'ness', 'netview', 'noffessl', 'dart', 'flash', 'map', 'mts', 'infra'];
  // kick it off
  var nrwr = new Narrower(inp, sel, disp, spanList)
  nrwr.init()

  //same for domain form
  var inp2  = document.querySelector('#nrwr2')
  var sel2  = document.querySelector('#domainNames')
  var disp2 = document.querySelector('#domainMatches')
  var domainList = ['ALL', 'amsstagethree', 'nocc-auto', 'portalc', 'cogs', 'nmtc', 'static', 'mapnocctwo', 'ams', 'mapnoccthree', 'nmt', 'amstwo', 'portala', 'pacmanb', 'prodb', 'prod', 'resolve', 'devbl', 'amscmp', 'monster', 'svcperf', 'amsfour', 'mui', 'perf', 'dev', 'amsstagefour', 'mapnocc', 'perfbl', 'nmtd', 'ump', 'dashboard', 'nmtb', 'proda', 'estats', 'portalb', 'mapnoccfive', 'amsstagetwo', 'nocc', 'amsstage', 'regionview', 'amsthree', 'prodc', 'pacman', 'mapnoccfour']
  var nrwr2 = new Narrower(inp2, sel2, disp2, domainList)
  nrwr2.init()

  //same for thread form
  var inp3  = document.querySelector('#nrwr3')
  var sel3  = document.querySelector('#threadNames')
  var disp3 = document.querySelector('#threadMatches')
  var threadList = ['ALL', 'decoder', 'main', 'decoder06', 'decoder04', 'decoder02', 'decoder01', 'main01', 'decoder03', 'decoder05']
  var nrwr3 = new Narrower(inp3, sel3, disp3, threadList)
  nrwr3.init()

}(this, this.document))

/*

*/
$(function () {
    // Add table and IP input box
    $('<p><input type="text" id="tableNames" placeholder = "Table Name" size="12"></p>').appendTo('#other');
    $('<p><input type="text" id="ipAddress" placeholder = "IP Address" size="12" ></p>').appendTo('#other');

    // Set defaults for span and domain and thread
    $("option:contains('ALL')")[0]["selected"] = true; //span
    $("option:contains('ALL')")[1]["selected"] = true; //domain
    $("option:contains('ALL')")[2]["selected"] = true; //thread
    
    //Create and add buttons
    $('<p><input type="button" id="newGraph" value = "New Graph"><br></p>').appendTo('#button_div');
    $('<p><input type="button" id="addGraph" value = "Add Graph"><br></p>').appendTo('#button_div');
    // If you click the button, this will run
    $('#newGraph').bind('click', submit_query);
    $('#addGraph').bind('click', submit_query_add);
});

/*
Initialize the page with graphs
*/
function generate_chart() {
  return {
    chart: {
        type: 'spline',
        zoomType: 'x'
    },
    title: {
        text: 'Aggset Size over Time'
    },
    legend: {
        enabled: true,
        // align: 'right',
        // x: -20,
        // verticalAlign: 'top',
        // y: 25,
        // floating: true,
        // backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
        // borderColor: '#CCC',
        // borderWidth: 1,
        // shadow: false
    },
    xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
            second: '%b %e',
            minute: '%b %e',
            hour: '%b %e',
            day: '%b %e',
            month: '%e. %b',
            year: '%b'
        },
        title: {
            text: 'Date'
        },
        ordinal: false, // TODO: essential for allowing highstocks to deal with incoming data (graph it correctly)
        minRange: 1
    },
    yAxis: {
        title: {
            text: 'Number of Rows'
        },
        labels: {
          formatter: function () {
              return Highcharts.numberFormat(this.value,0, ".", ",");
          }
        },
        stackLabels: {
            enabled: true,
            style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
        },
        min: 0
    },
    navigator: {
        enabled: true
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
                    for (i = 0; i < a.series.length; i++) {a.series[i].update({type: 'area'})};
                }},
                {text: 'Graph as Line Chart',
                onclick: function () {
                    a = $('#feed_main_chart').highcharts();
                    for (i = 0; i < a.series.length; i++) {a.series[i].update({type: 'line'})};
                }},
                {text: 'Graph as Bar Chart',
                onclick: function () {
                    a = $('#feed_main_chart').highcharts();
                    for (i = 0; i < a.series.length; i++) {a.series[i].update({type: 'bar'})};
                }}]
            }
        }
    },
    turboThreshold: 0, //TODO this allows the chart to keep over 1000 points.
    // tooltip: { //TODO DELETE THIS if you add flags
    //  formatter: function() {
    //    if "{series.type}" == 'flags':
    //      return '{point.text}';
    //    else:
     //          return '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.0f}</b><br/>';
    //     }
    //     // headerFormat: '<b>{series.name}</b><br>',
        // pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.0f}</b><br/>',//'{point.x: %b/%e/%Y}: {point.y:.0f}'
    //     valueDecimals: 0
    // },
    plotOptions: {
        spline: {
            marker: {
                enabled: true
            }
        }
    },
    series: [
        // {
        // name: 'freeflow.',
        // data: [
        //      [1432897200000.0, 242378244], [1432898100000.0, 294217299], [1432898700000.0, 414146527], [1432899900000.0, 211385957], [1432901400000.0, 254118775], [1432902000000.0, 410955918], [1432902300000.0, 256434576], [1432902900000.0, 214361825], [1432903200000.0, 492927248], [1432903800000.0, 227048355], [1432904400000.0, 316624818], [1432904700000.0, 164893251], [1432905300000.0, 362149794], [1432905600000.0, 310215100], [1432905900000.0, 438240595], [1432906200000.0, 520803813], [1432906500000.0, 569727619], [1432906800000.0, 239649112], [1432907100000.0, 685389091], [1432907400000.0, 238605276], [1432908300000.0, 806030902], [1432908600000.0, 1813254746], [1432908900000.0, 204751321], [1432909500000.0, 544558776], [1432909800000.0, 123293502]
        // ]
        // },
        {
        name: 'All',
        id: 'dataSeries',
        tooltip: {pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.0f}</b><br/>'},
        data: []
        }
    ]
  }
}

var initial_main_feed = generate_chart();

$(function () {
    // Create the main graph
    var series = initial_main_feed.series;
    $('#feed_main_chart').highcharts("StockChart", initial_main_feed);
    initial_main_feed.series = series;
    submit_query()
    drawFlags()
});


/*
Populate the sub rows with tables with the highest tables, ip's and aggsets
*/

$(function () {
    // Add options for the sub charts
    $('<p align="center"><input type="button" id="tableList" value = "Generate List : Largest Tables"><br></p>').appendTo('.sub_1_chart_container');
    $("<p align = 'center'>List the highest: <input type='number' min='0' value='10' id='tableNum'> </p>").appendTo('.sub_1_chart_container');
    $("<p align = 'center'>Over the course of: <select id = 'tableTime'><option>All Time</option><option>Past Day</option><option>Past Week</option><option>Past Month</option><option>Past Year</option></select> </p>").appendTo('.sub_1_chart_container');

    $('<p align="center"><input type="button" id="ipList" value = "Generate List : Highest Output IP Addresses"><br></p>').appendTo('.sub_2_chart_container');
    $("<p align = 'center'>List the highest: <input type='number' min='0' value='10' id='ipNum'> </p>").appendTo('.sub_2_chart_container');
    $("<p align = 'center'>Over the course of: <select id = 'ipTime'><option>All Time</option><option>Past Day</option><option>Past Week</option><option>Past Month</option><option>Past Year</option></select> </p>").appendTo('.sub_2_chart_container');

    $('<p align="center"><input type="button" id="aggsetList" value = "Generate List : Largest Aggsets"><br></p>').appendTo('.sub_3_chart_container');
    $("<p align = 'center'>List the highest: <input type='number' min='0' value='10' id='aggsetNum'> </p>").appendTo('.sub_3_chart_container');
    $("<p align = 'center'>Over the course of: <select id = 'aggsetTime'><option>All Time</option><option>Past Day</option><option>Past Week</option><option>Past Month</option><option>Past Year</option></select> </p>").appendTo('.sub_3_chart_container');

  // If you click the button, this will run
  $('#tableList').bind('click', make_table_1);
  $('#ipList').bind('click', make_table_2);
  $('#aggsetList').bind('click', make_table_3);
});

/*
Functions that deal with button clicks
*/

var colorWheel = 0;

// Make a new graph
var submit_query = function(e) {
  var args = {
    table: 'dec',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    c: $('#threadNames').val()[0],
    d: $('#tableNames').val(),
    e: $('#ipAddress').val()
  };
  args = $.param(args);
  $.getJSON('/_make_query', args, function(data) {
        response = initial_main_feed;
        response.series = response.series.slice(0,1);
        response.series[0].name = data.name;
        response.series[0].data = data.data;
        response.series[0].color = Highcharts.getOptions().colors[colorWheel];
        colorWheel += 1;
        console.log(data.data);
        var series = response.series;
        var chart = new Highcharts.StockChart(response);
        initial_main_feed.series = series;
  });
  return false;
};

// Add a new line to the current graph
var submit_query_add = function(e) {
  var args = {
    table: 'dec',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    c: $('#threadNames').val()[0],
    d: $('#tableNames').val(),
    e: $('#ipAddress').val()
  };
  args = $.param(args);
  $.getJSON('/_make_query', args, function(data) {
        response = initial_main_feed;
        response.series.push({name: data.name, data: data.data, color: Highcharts.getOptions().colors[colorWheel]})
        colorWheel += 1;
        var series = response.series;
        var chart = new Highcharts.StockChart(response);
        initial_main_feed.series = series;
  });
  return false;
};

// Add a table displaying the scoreboard for largest amounts of rows output


var make_table = function(column, chartNum, listLen, timeInterval) {
  $(".sub_" + chartNum + "_chart_container table").remove();
  var time = "cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp)"
  var SQLTime = {"All Time": "", "Past Day": "and " + time + " BETWEEN now() and now() - interval 1 day", "Past Week": "and " + time + " BETWEEN now() and now() - interval 1 week", "Past Month": "and " + time + " BETWEEN now() and now() - interval 1 week", "Past Year":"and " + time + " BETWEEN now() and now() - interval 1 year"};
  var timespan = SQLTime[timeInterval];
  var args = {
    query: "select " + column +", sum(numrows)/count(distinct time) n from dec WHERE numrows > 0 " + timespan + " group by " + column +" ORDER BY -n LIMIT " + listLen
  };
  console.log("select " + column +", sum(numrows)/count(distinct time) n from dec WHERE numrows > 0 " + timespan + " group by " + column +" ORDER BY -n LIMIT " + listLen);
  args = $.param(args);
  $.getJSON('/_make_table_query', args, function(data) {
        var table = data.code;
        $(table).appendTo('.sub_' + chartNum + '_chart_container');
  });
  return false;
};

var make_table_1 = function(e) {make_table("table_name", 1, $('#tableNum').val(), $('#tableTime').val())};
var make_table_2 = function(e) {make_table("ip", 2, $('#ipNum').val(), $('#ipTime').val())};
var make_table_3 = function(e) {make_table("CONCAT(span, '.', domain)", 3, $('#aggsetNum').val(), $('#aggsetTime').val())};



