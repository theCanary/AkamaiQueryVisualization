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
    $('<p>NOTE: This field should be filled in, or the output may be nonsensical.</p><p><input type="text" id="tableNames" placeholder = "Table Name" size="12"></p>').appendTo('#option_inputs');
    $("<p><select id = 'option'><option>Number of Rows Merged</option> <option>Number of Contributors</option></select> </p>").appendTo('#option_inputs');

    //Set defaults
    $("option:contains('ALL')")[0]["selected"] = true; //span
    $("option:contains('ALL')")[1]["selected"] = true; //domain

    //Create and add buttons
    $('<p><input type="button" id="newGraph" value = "New Graph"><br></p>').appendTo('#button_div');
    $('<p><input type="button" id="addGraph" value = "Add Graph"><br></p>').appendTo('#button_div');

    // If you click the buttons, functions will run
    $('#newGraph').bind('click', submit_query);
    $('#addGraph').bind('click', submit_query_add);
});


/*
Initialize the page with graphs
*/
function generate_chart() {
  return {
    chart: {type: 'spline', zoomType: 'x'},
    title: {text: 'Table Merges over Time'},
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
    yAxis: { title: { text: 'Number of Rows'},
        min: 0,
        stackLabels: {
                  enabled: true,
                  style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
              }
    },
    navigator: { //TODO
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
    legend: {
        enabled: true,
    },
    turboThreshold: 0,
    // tooltip: {
    //     // headerFormat: '<b>{point.x: %b/%e/%Y}</b><br>', //TODO : this breaks when highstocks happens
    //     pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.0f}</b><br/>',//'{point.x: %b/%e/%Y}: {point.y:.0f}'
    //     valueDecimals: 0
    // },
    annotations: [{
            title: 'on point <br> drag&drop <br> disabled',
            linkedTo: 'high',
            anchorX: "middle",
            anchorY: "middle",
            allowDragY: false,
            allowDragX: false,
            shape: {
                type: 'circle',
                params: {
                    r: 40,
                    stroke: '#c55'
                }
            }
        },
        {
          x: 100,
          y: 200,
          title: 'drag me <br> verticaly',
          anchorX: "left",
          anchorY: "top",
          allowDragY: true,
          allowDragX: false,
          shape: {
              type: 'rect',
              params: {
                x: 0,
                y: 0,
                width: 55,
                height: 40
              }
          },
          events: {
              mouseover: function(e) {
                  console.log("MouseOver", e, this);  
              },
              mouseout: function(e) {
                  console.log("MouseOut", e, this); 
              },
              mousedown: function(e) {
                  console.log("MouseDown", e, this);  
              },
              mouseup: function(e) {
                  console.log("MouseUp", e, this);  
              },
              click: function(e) {
                  console.log("Click", e, this);  
              },
              dblclick: function(e) {
                  console.log("Double Click", e, this); 
              }
          }
        }],
    plotOptions: {
        connectNulls: true,
        spline: {
                  marker: {
                      enabled: true
                  }
              }
    },
    series: [
        {
            name: 'ghostinfo',
            id: 'dataSeries',
            tooltip: {pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.0f}</b><br/>'},
            data: [[1435748400000.0, 720345], [1435750500000.0, 0], [1435754400000.0, 725534], [1435754700000.0, 187716], [1435755300000.0, 96], [1435756200000.0, 187732], [1435756500000.0, 1377698], [1435757100000.0, 495134], [1435757400000.0, 0], [1435757700000.0, 365917], [1435758000000.0, 987824], [1435758300000.0, 530824], [1435758900000.0, 234631], [1435759200000.0, 648076], [1435759500000.0, 483679], [1435759800000.0, 739917], [1435760100000.0, 990891], [1435760400000.0, 524732], [1435760700000.0, 2190441], [1435761000000.0, 1561200], [1435761300000.0, 1302024], [1435761600000.0, 2907823], [1435761900000.0, 3554220], [1435762200000.0, 4137130], [1435762500000.0, 4510461], [1435762800000.0, 8759346], [1435763100000.0, 14324896], [1435763400000.0, 24043674], [1435763700000.0, 29521626], [1435764000000.0, 36025427], [1435764300000.0, 39076536], [1435764600000.0, 40316759], [1435764900000.0, 37830570], [1435765200000.0, 29190531], [1435765500000.0, 18259071], [1435765800000.0, 11045360], [1435766100000.0, 5579565], [1435766400000.0, 1936635], [1435766700000.0, 726212], [1435767000000.0, 46680]]
        }
    ]
  };
}

var initial_main_feed = generate_chart();

$(function () {
  //Draw the chart
  
  // var chart = new Highcharts.StockChart($.extend({},this.initial_main_feed)) TODO replace
  var series = initial_main_feed.series;
  $('#feed_main_chart').highcharts("StockChart", initial_main_feed);
  initial_main_feed.series = series;
  drawFlags()
})

var colorWheel = 0;
var submit_query = function(e) {
  var optionNum = ["Number of Rows Merged", "Number of Contributors"].indexOf($('#option').val());
  var args = {
    table: 'mrg',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    c: $('#tableNames').val(),
    option: optionNum.toString()
  };
  args = $.param(args);
  console.log(args);
  $.getJSON('/_make_query', args, function(data) {
        response = initial_main_feed;
        response.series = response.series.slice(0,1);
        response.series[0].name = data.name;
        response.series[0].data = data.data;
        response.series[0].color = Highcharts.getOptions().colors[colorWheel];
        
        colorWheel += 1;
        // var chart = $('#feed_main_chart').highcharts(); TODO this addresses a bug where StockChart rendering sets series to null
        var series = response.series;
        var chart = new Highcharts.StockChart(response);
        initial_main_feed.series = series;
        chart.title.attr({text: $('#option').val() + " over Time"});
        chart.yAxis[0].axisTitle.attr({text: $('#option').val()});
        drawFlags()
        // $('#feed_main_chart').prop('title', data.query); //TODO this was bad
  });
  return false;
};


// Add a new line to the current graph
var submit_query_add = function(e) {
  var optionNum = ["Number of Rows Merged", "Number of Contributors"].indexOf($('#option').val());
  var args = {
    table: 'mrg',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    c: $('#tableNames').val(),
    option: optionNum.toString()
  };
  args = $.param(args);
  $.getJSON('/_make_query', args, function(data) {
    response = initial_main_feed;
    response.series.push({name: data.name, data: data.data, color: Highcharts.getOptions().colors[colorWheel]})
    colorWheel += 1;
    // var chart = $('#feed_main_chart').highcharts("StockChart", response);
    // var chart = $('#feed_main_chart').highcharts()
    var series = response.series;
    var chart = new Highcharts.StockChart(response);
    initial_main_feed.series = series;
    chart.yAxis[0].axisTitle.attr({text: $('#option').val()});
    chart.title.attr({text: $('#option').val() + " over Time"});
    // $('#feed_main_chart').prop('title', data.query);
  });
  return false;
};

/*
Save graphs
*/
var num_sub_graphs = 0;

// Respond to a button click, add a graph to the bottom div
var save_graph = function(e) {
  $('<div class="row">'+
  '<div class="col-sm-4 col-md-4 main chart_container sub_1_chart_container">'+
  '<h3 class="page-header">Feed 1</h3>'+
  '<div class="y_axis" id="feed_1_y_axis"></div>'+
  '<div class="chart" id="feed_1_chart" float="left"></div>'+
  '</div>'+
  '<div class="col-sm-4 col-md-4 main chart_container sub_2_chart_container">'+
  '<h3 class="page-header">Feed 2</h3>'+
  '<div class="y_axis" id="feed_2_y_axis"></div>'+
  '<div class="chart" id="feed_2_chart" float="left"></div>'+
  '</div>'+
  '<div class="col-sm-4 col-md-4 main chart_container sub_3_chart_container">'+
  '<h3 class="page-header">Feed 3</h3>'+
  '<div class="y_axis" id="feed_3_y_axis"></div>'+
  '<div class="chart" id="feed_3_chart" float="left"></div>'+
  '</div>'+
  '</div>').appendTo('body');

  feed_chart = initial_main_feed;
  initial_main_feed = generate_chart();
  $('#feed_main_chart').highcharts(initial_main_feed);
  $('#feed_1_chart').highcharts(feed_chart);
};




