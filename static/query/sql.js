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

  // //same for host form
  // var inp3  = document.querySelector('#nrwr3')
  // var sel3  = document.querySelector('#hostNames')
  // var disp3 = document.querySelector('#hostMatches')
  // var threadList = ['ALL', 'decoder', 'encoder', 'comm', 'merger', 'gcollect', 'sql', 'listener', 'main', 'gcollect01', 'decoder06', 'merger04', 'sql01', 'decoder04', 'merger06', 'listener01', 'encoder01', 'merger02', 'comm02', 'decoder02', 'merger03', 'decoder01', 'main01', 'merger01', 'decoder03', 'comm01', 'encoder02', 'merger05', 'decoder05']
  // var nrwr3 = new Narrower(inp3, sel3, disp3, threadList)
  // nrwr3.init()

  // //same for client form
  // var inp3  = document.querySelector('#nrwr4')
  // var sel3  = document.querySelector('#clientNames')
  // var disp3 = document.querySelector('#clientMatches')
  // var threadList = ['ALL', 'decoder', 'encoder', 'comm', 'merger', 'gcollect', 'sql', 'listener', 'main', 'gcollect01', 'decoder06', 'merger04', 'sql01', 'decoder04', 'merger06', 'listener01', 'encoder01', 'merger02', 'comm02', 'decoder02', 'merger03', 'decoder01', 'main01', 'merger01', 'decoder03', 'comm01', 'encoder02', 'merger05', 'decoder05']
  // var nrwr3 = new Narrower(inp3, sel3, disp3, threadList)
  // nrwr3.init()

}(this, this.document))


/*
Add in all the options and the default settings
*/
$(function () {
    // Add query and time inputs
    $('<p><input type="text" id="host" placeholder = "Host name" size="12" ></p>').appendTo('#other');
    $('<p><input type="text" id="client" placeholder = "Client" size="12" ></p>').appendTo('#other');
    $("<p><select id = 'option'><option>Returned Rows</option><option>Total Generated Rows</option>" +
      "<option>Query Processing Time</option> <option>Total Elapsed Time</option> <option>Number of Interrupts</option>" +
      "<option>Number of Error Messages</option><option>Number of Distinct Error Messages</option>" +
      "<option>Total Table Bytes</option> <option>Total Temp Table Bytes</option> <option>Total Table Indices</option> " +
      "<option>Total Temp Table Indices</option>  </select></p>").appendTo('#option_inputs');
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


    //Create and add buttons
    $('<p><input type="button" id="newGraph" value = "New Graph"><br></p>').appendTo('#button_div');
    $('<p><input type="button" id="addGraph" value = "Add Graph"><br></p>').appendTo('#button_div');
    //experimental, delete later:
    $('<p><input type="button" id="sqlQuery" value = "Make SQL Query"><br></p>').appendTo('#button_div');
    $('#sqlQuery').bind('click', sqlQuery);
    
    // If you click the buttons, functions will run
    $('#newGraph').bind('click', submit_query);
    $('#addGraph').bind('click', submit_query_add);
});


/*
Initialize the page with graphs
*/
var initial_main_feed = {
  chart: {type: 'column', zoomType: 'x'},
  title: {text: 'Number of Error Messages over Time'},
  subtitle: {text: 'Click and drag to zoom in'},
  xAxis: {type: 'datetime',
      dateTimeLabelFormats: { // don't display the dummy year
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
  legend: {
      align: 'right',
      x: -20,
      y: -20,
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
      spline: {
                marker: {
                    enabled: true
                }
            }
  },
  series: [
      {
          name: 'Total',
          data: [[1435692600000.0, 1], [1435731600000.0, 1], [1435743300000.0, 2], [1435747200000.0, 1], [1435747500000.0, 3], [1435747800000.0, 3], [1435748100000.0, 1], [1435748700000.0, 1], [1435749000000.0, 3], [1435749300000.0, 8], [1435749600000.0, 5], [1435749900000.0, 9], [1435750200000.0, 13], [1435750500000.0, 13], [1435750800000.0, 10], [1435751100000.0, 15], [1435751400000.0, 14], [1435751700000.0, 15], [1435752000000.0, 9], [1435752300000.0, 9], [1435752600000.0, 13], [1435752900000.0, 13], [1435753200000.0, 13], [1435753500000.0, 10], [1435753800000.0, 11], [1435754100000.0, 11], [1435754400000.0, 14], [1435754700000.0, 6], [1435755000000.0, 16], [1435755300000.0, 15], [1435755600000.0, 23], [1435755900000.0, 13], [1435756200000.0, 14], [1435756500000.0, 11], [1435756800000.0, 15], [1435757100000.0, 8], [1435757400000.0, 14], [1435757700000.0, 27], [1435758000000.0, 8], [1435758300000.0, 11], [1435758600000.0, 10], [1435758900000.0, 12], [1435759200000.0, 12], [1435759500000.0, 11], [1435759800000.0, 21], [1435760100000.0, 14], [1435760400000.0, 7], [1435760700000.0, 8], [1435761000000.0, 14], [1435761300000.0, 16], [1435761600000.0, 10], [1435761900000.0, 10], [1435762200000.0, 8], [1435762500000.0, 17], [1435762800000.0, 10], [1435763100000.0, 8], [1435763400000.0, 4], [1435763700000.0, 11], [1435764000000.0, 7], [1435764600000.0, 6], [1435764900000.0, 3], [1435765200000.0, 1], [1435765500000.0, 2]]
      }
  ]
};

$(function () {

  // Add menu options to change the graph to different types dynamically
  Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push({separator: true},
    {text: 'area',
    onclick: function () {
        a = $('#feed_main_chart').highcharts();
        for (i = 0; i < a.series.length; i++) {a.series[i].update({type: 'area'})};
    }},
    {text: 'line',
    onclick: function () {
        a = $('#feed_main_chart').highcharts();
        for (i = 0; i < a.series.length; i++) {a.series[i].update({type: 'line'})};
    }},
    {text: 'bar',
    onclick: function () {
        a = $('#feed_main_chart').highcharts();
        for (i = 0; i < a.series.length; i++) {a.series[i].update({type: 'bar'})};
    }}
  );

  //Add buttons
  $('#feed_main_chart').highcharts(initial_main_feed);
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
    e: $('#startDate').val().replace('T', ' '),
    f: $('#endDate').val().replace('T', ' '),
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
        var chart = $('#feed_main_chart').highcharts();
        var chart = new Highcharts.Chart(response);
        chart.title.attr({text: $('#option').val() + " over Time"});
        unit = "";
        if ($('#option').val().includes("Time")){
          unit += " (ms)"
        }
        chart.yAxis[0].axisTitle.attr({text: $('#option').val() + unit});
        $('#queryStatement').text(data.query);
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
    e: $('#startDate').val().replace('T', ' '),
    f: $('#endDate').val().replace('T', ' '),
    option: optionNum.toString()
  };
  args = $.param(args);
  $.getJSON('/_make_query', args, function(data) {
    response = initial_main_feed;
    response.series.push({name: data.name, data: data.data, color: Highcharts.getOptions().colors[colorWheel]})
    
    colorWheel += 1;
    var chart = $('#feed_main_chart').highcharts();
    var chart = new Highcharts.Chart(response);
    chart.title.attr({text: $('#option').val() + " over Time"});
    chart.yAxis[0].axisTitle.attr({text: $('#option').val()});
    $('#queryStatement').text(data.query);
  });
  return false;
};

// Add a new line to the current graph
var sqlQuery = function(e) {
  console.log("Got to sqlQuery");
  var args = {
    query: $('#host').val(),
  };
  args = $.param(args);
  $.getJSON('/_make_sql_query', args, function(data) {
    console.log(data)
  });
  return false;
};
