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

  //same for thread form
  var inp3  = document.querySelector('#nrwr3')
  var sel3  = document.querySelector('#threadNames')
  var disp3 = document.querySelector('#threadMatches')
  var threadList = ['ALL', 'decoder', 'encoder', 'comm', 'merger', 'gcollect', 'sql', 'listener', 'main', 'gcollect01', 'decoder06', 'merger04', 'sql01', 'decoder04', 'merger06', 'listener01', 'encoder01', 'merger02', 'comm02', 'decoder02', 'merger03', 'decoder01', 'main01', 'merger01', 'decoder03', 'comm01', 'encoder02', 'merger05', 'decoder05']
  var nrwr3 = new Narrower(inp3, sel3, disp3, threadList)
  nrwr3.init()

}(this, this.document))


/*
Add in all the options and the default settings
*/
$(function () {

    // Add query and time inputs
    $("<p><select id = 'option'><option>Page Faults</option> <option>Context Switches</option> <option>Input/Output Blocks</option> <option>CPU Time</option> <option>RSS Memory</option> </select> </p>").appendTo('#option_inputs');
    $('<p><input type="datetime-local" id="startDate" placeholder = "Start Date" size="12" > - Start Date</p>').appendTo('#option_inputs');
    $('<p><input type="datetime-local" id="endDate" placeholder = "End Date" size="12" > - End Date</p>').appendTo('#option_inputs');

    //Set defaults
    $("option:contains('ALL')")[0]["selected"] = true; //span
    $("option:contains('ALL')")[1]["selected"] = true; //domain
    $("option:contains('ALL')")[2]["selected"] = true; //thread
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
    var prevDate = new Date(new Date(datetime) - (60*60*24*30*4*1000)).toJSON().substring(0,16) //edit the string to make it the right format
    $("#startDate").val(prevDate);


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
    title: {text: 'Thread CPU Time over Time'},
    subtitle: {text: 'Click and drag to zoom in'},
    xAxis: {type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
            month: '%e. %b',
            year: '%b'
        },
        title: {text: 'Date'},minRange: 1
    },
    yAxis: { title: { text: 'CPU Time'},
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
    series: [ //['listener', 'main', 'gcollect', 'comm', 'decoder', 'merger', 'sql', 'encoder']
        // {name: 'listener', data: [[1432891800000.0, 0, 1432891800000.0, 0], [1432896300000.0, 0, 1432896300000.0, 0], [1432896900000.0, 91, 1432896900000.0, 0], [1432897200000.0, 8, 1432897200000.0, 0], [1432897800000.0, 0, 1432897800000.0, 0], [1432898100000.0, 0, 1432898100000.0, 0], [1432898400000.0, 0, 1432898400000.0, 0], [1432898700000.0, 0, 1432898700000.0, 0], [1432899000000.0, 0, 1432899000000.0, 0], [1432899300000.0, 0, 1432899300000.0, 0], [1432899600000.0, 0, 1432899600000.0, 0], [1432899900000.0, 0, 1432899900000.0, 0], [1432900200000.0, 0, 1432900200000.0, 0], [1432900500000.0, 0, 1432900500000.0, 0], [1432900800000.0, 0, 1432900800000.0, 0], [1432901100000.0, 101, 1432901100000.0, 0], [1432901400000.0, 0, 1432901400000.0, 0], [1432901700000.0, 0, 1432901700000.0, 0], [1432902000000.0, 0, 1432902000000.0, 0], [1432902300000.0, 0, 1432902300000.0, 0], [1432902600000.0, 0, 1432902600000.0, 0], [1432902900000.0, 0, 1432902900000.0, 0], [1432903200000.0, 93, 1432903200000.0, 0], [1432903500000.0, 0, 1432903500000.0, 0], [1432903800000.0, 0, 1432903800000.0, 0], [1432904100000.0, 81, 1432904100000.0, 0], [1432904400000.0, 0, 1432904400000.0, 0], [1432904700000.0, 0, 1432904700000.0, 0], [1432905000000.0, 0, 1432905000000.0, 0], [1432905300000.0, 4, 1432905300000.0, 0], [1432905600000.0, 0, 1432905600000.0, 0], [1432905900000.0, 0, 1432905900000.0, 0], [1432906200000.0, 0, 1432906200000.0, 0], [1432906500000.0, 0, 1432906500000.0, 0], [1432906800000.0, 0, 1432906800000.0, 0], [1432907100000.0, 0, 1432907100000.0, 0], [1432907400000.0, 0, 1432907400000.0, 0], [1432907700000.0, 89, 1432907700000.0, 0], [1432908000000.0, 4, 1432908000000.0, 0], [1432908300000.0, 90, 1432908300000.0, 0], [1432908600000.0, 4, 1432908600000.0, 0], [1432908900000.0, 0, 1432908900000.0, 0], [1432909200000.0, 0, 1432909200000.0, 0], [1432909500000.0, 0, 1432909500000.0, 0], [1432909800000.0, 0, 1432909800000.0, 0], [1432910100000.0, 0, 1432910100000.0, 0], [1432910400000.0, 0, 1432910400000.0, 0]]},
        // {name: 'main', data: [[1432891800000.0, 119, 1432891800000.0, 0], [1432896300000.0, 256, 1432896300000.0, 0], [1432896900000.0, 546655, 1432896900000.0, 0], [1432897200000.0, 348408, 1432897200000.0, 0], [1432897800000.0, 151, 1432897800000.0, 0], [1432898100000.0, 1311, 1432898100000.0, 0], [1432898400000.0, 3342, 1432898400000.0, 3], [1432898700000.0, 725, 1432898700000.0, 0], [1432899000000.0, 768, 1432899000000.0, 1], [1432899300000.0, 694, 1432899300000.0, 0], [1432899600000.0, 121, 1432899600000.0, 0], [1432899900000.0, 3, 1432899900000.0, 0], [1432900200000.0, 4342, 1432900200000.0, 1], [1432900500000.0, 2, 1432900500000.0, 0], [1432900800000.0, 141, 1432900800000.0, 0], [1432901100000.0, 303005, 1432901100000.0, 0], [1432901400000.0, 1222, 1432901400000.0, 0], [1432901700000.0, 39, 1432901700000.0, 0], [1432902000000.0, 452, 1432902000000.0, 0], [1432902300000.0, 244, 1432902300000.0, 0], [1432902600000.0, 174, 1432902600000.0, 0], [1432902900000.0, 145, 1432902900000.0, 0], [1432903200000.0, 248227, 1432903200000.0, 0], [1432903500000.0, 2809, 1432903500000.0, 0], [1432903800000.0, 73663, 1432903800000.0, 0], [1432904100000.0, 405755, 1432904100000.0, 0], [1432904400000.0, 196, 1432904400000.0, 0], [1432904700000.0, 78022, 1432904700000.0, 0], [1432905000000.0, 469, 1432905000000.0, 0], [1432905300000.0, 149252, 1432905300000.0, 0], [1432905600000.0, 48550, 1432905600000.0, 0], [1432905900000.0, 1160, 1432905900000.0, 0], [1432906200000.0, 699, 1432906200000.0, 0], [1432906500000.0, 6623, 1432906500000.0, 1], [1432906800000.0, 74317, 1432906800000.0, 0], [1432907100000.0, 22723, 1432907100000.0, 0], [1432907400000.0, 17956, 1432907400000.0, 0], [1432907700000.0, 264278, 1432907700000.0, 0], [1432908000000.0, 173042, 1432908000000.0, 0], [1432908300000.0, 380029, 1432908300000.0, 2], [1432908600000.0, 12581, 1432908600000.0, 0], [1432908900000.0, 9092, 1432908900000.0, 0], [1432909200000.0, 220, 1432909200000.0, 0], [1432909500000.0, 873, 1432909500000.0, 0], [1432909800000.0, 61, 1432909800000.0, 0], [1432910100000.0, 1246, 1432910100000.0, 0], [1432910400000.0, 2499, 1432910400000.0, 0]]},
        // {name: 'gcollect', data: [[1432891800000.0, 0, 1432891800000.0, 0], [1432896300000.0, 0, 1432896300000.0, 0], [1432896900000.0, 44, 1432896900000.0, 0], [1432897200000.0, 4, 1432897200000.0, 0], [1432897800000.0, 0, 1432897800000.0, 0], [1432898100000.0, 0, 1432898100000.0, 0], [1432898400000.0, 0, 1432898400000.0, 0], [1432898700000.0, 0, 1432898700000.0, 0], [1432899000000.0, 0, 1432899000000.0, 0], [1432899300000.0, 0, 1432899300000.0, 0], [1432899600000.0, 0, 1432899600000.0, 0], [1432899900000.0, 0, 1432899900000.0, 0], [1432900200000.0, 0, 1432900200000.0, 0], [1432900500000.0, 0, 1432900500000.0, 0], [1432900800000.0, 0, 1432900800000.0, 0], [1432901100000.0, 21, 1432901100000.0, 0], [1432901400000.0, 0, 1432901400000.0, 0], [1432901700000.0, 0, 1432901700000.0, 0], [1432902000000.0, 0, 1432902000000.0, 0], [1432902300000.0, 0, 1432902300000.0, 0], [1432902600000.0, 0, 1432902600000.0, 0], [1432902900000.0, 1, 1432902900000.0, 0], [1432903200000.0, 34, 1432903200000.0, 0], [1432903500000.0, 0, 1432903500000.0, 0], [1432903800000.0, 0, 1432903800000.0, 0], [1432904100000.0, 38, 1432904100000.0, 0], [1432904400000.0, 0, 1432904400000.0, 0], [1432904700000.0, 0, 1432904700000.0, 0], [1432905000000.0, 0, 1432905000000.0, 0], [1432905300000.0, 1, 1432905300000.0, 0], [1432905600000.0, 0, 1432905600000.0, 0], [1432905900000.0, 0, 1432905900000.0, 0], [1432906200000.0, 0, 1432906200000.0, 0], [1432906500000.0, 0, 1432906500000.0, 0], [1432906800000.0, 0, 1432906800000.0, 0], [1432907100000.0, 0, 1432907100000.0, 0], [1432907400000.0, 0, 1432907400000.0, 0], [1432907700000.0, 23, 1432907700000.0, 0], [1432908000000.0, 1, 1432908000000.0, 0], [1432908300000.0, 35, 1432908300000.0, 0], [1432908600000.0, 0, 1432908600000.0, 0], [1432908900000.0, 2, 1432908900000.0, 0], [1432909200000.0, 0, 1432909200000.0, 0], [1432909500000.0, 0, 1432909500000.0, 0], [1432909800000.0, 0, 1432909800000.0, 0], [1432910100000.0, 0, 1432910100000.0, 0], [1432910400000.0, 0, 1432910400000.0, 0]]},
        // {name: 'comm', data: [[1432891800000.0, 98, 1432891800000.0, 0], [1432896300000.0, 528, 1432896300000.0, 0], [1432896900000.0, 328385, 1432896900000.0, 0], [1432897200000.0, 178313, 1432897200000.0, 0], [1432897800000.0, 1487, 1432897800000.0, 0], [1432898100000.0, 2106, 1432898100000.0, 0], [1432898400000.0, 4463, 1432898400000.0, 0], [1432898700000.0, 8625, 1432898700000.0, 0], [1432899000000.0, 4673, 1432899000000.0, 0], [1432899300000.0, 572, 1432899300000.0, 0], [1432899600000.0, 3441, 1432899600000.0, 0], [1432899900000.0, 64, 1432899900000.0, 0], [1432900200000.0, 348, 1432900200000.0, 0], [1432900500000.0, 1295, 1432900500000.0, 0], [1432900800000.0, 2667, 1432900800000.0, 0], [1432901100000.0, 150527, 1432901100000.0, 0], [1432901400000.0, 1939, 1432901400000.0, 0], [1432901700000.0, 981, 1432901700000.0, 0], [1432902000000.0, 3586, 1432902000000.0, 0], [1432902300000.0, 766, 1432902300000.0, 0], [1432902600000.0, 266, 1432902600000.0, 0], [1432902900000.0, 1791, 1432902900000.0, 0], [1432903200000.0, 176212, 1432903200000.0, 0], [1432903500000.0, 8261, 1432903500000.0, 0], [1432903800000.0, 25733, 1432903800000.0, 0], [1432904100000.0, 192919, 1432904100000.0, 0], [1432904400000.0, 3669, 1432904400000.0, 0], [1432904700000.0, 24283, 1432904700000.0, 0], [1432905000000.0, 1120, 1432905000000.0, 0], [1432905300000.0, 102701, 1432905300000.0, 0], [1432905600000.0, 30643, 1432905600000.0, 0], [1432905900000.0, 7384, 1432905900000.0, 0], [1432906200000.0, 4752, 1432906200000.0, 0], [1432906500000.0, 21243, 1432906500000.0, 0], [1432906800000.0, 21605, 1432906800000.0, 0], [1432907100000.0, 57312, 1432907100000.0, 0], [1432907400000.0, 26639, 1432907400000.0, 0], [1432907700000.0, 143284, 1432907700000.0, 0], [1432908000000.0, 415172, 1432908000000.0, 0], [1432908300000.0, 207725, 1432908300000.0, 0], [1432908600000.0, 31550, 1432908600000.0, 0], [1432908900000.0, 26626, 1432908900000.0, 0], [1432909200000.0, 3431, 1432909200000.0, 0], [1432909500000.0, 2087, 1432909500000.0, 0], [1432909800000.0, 2633, 1432909800000.0, 0], [1432910100000.0, 149, 1432910100000.0, 0], [1432910400000.0, 4042, 1432910400000.0, 0]]},
        // {name: 'decoder', data: [[1432891800000.0, 268, 1432891800000.0, 0], [1432896300000.0, 38, 1432896300000.0, 0], [1432896900000.0, 775391, 1432896900000.0, 0], [1432897200000.0, 965416, 1432897200000.0, 0], [1432897800000.0, 3609, 1432897800000.0, 0], [1432898100000.0, 4570, 1432898100000.0, 0], [1432898400000.0, 1905, 1432898400000.0, 0], [1432898700000.0, 3054, 1432898700000.0, 0], [1432899000000.0, 4432, 1432899000000.0, 0], [1432899300000.0, 1283, 1432899300000.0, 0], [1432899600000.0, 1428, 1432899600000.0, 0], [1432899900000.0, 2141, 1432899900000.0, 0], [1432900200000.0, 604, 1432900200000.0, 0], [1432900500000.0, 243, 1432900500000.0, 0], [1432900800000.0, 196, 1432900800000.0, 0], [1432901100000.0, 561550, 1432901100000.0, 0], [1432901400000.0, 397, 1432901400000.0, 0], [1432901700000.0, 427, 1432901700000.0, 0], [1432902000000.0, 809, 1432902000000.0, 0], [1432902300000.0, 308, 1432902300000.0, 0], [1432902600000.0, 2095, 1432902600000.0, 0], [1432902900000.0, 423, 1432902900000.0, 0], [1432903200000.0, 758964, 1432903200000.0, 0], [1432903500000.0, 2519, 1432903500000.0, 0], [1432903800000.0, 51953, 1432903800000.0, 0], [1432904100000.0, 598020, 1432904100000.0, 0], [1432904400000.0, 1832, 1432904400000.0, 0], [1432904700000.0, 30185, 1432904700000.0, 0], [1432905000000.0, 615, 1432905000000.0, 0], [1432905300000.0, 414911, 1432905300000.0, 0], [1432905600000.0, 114107, 1432905600000.0, 0], [1432905900000.0, 8180, 1432905900000.0, 0], [1432906200000.0, 3180, 1432906200000.0, 0], [1432906500000.0, 34914, 1432906500000.0, 0], [1432906800000.0, 10953, 1432906800000.0, 0], [1432907100000.0, 75932, 1432907100000.0, 0], [1432907400000.0, 41271, 1432907400000.0, 0], [1432907700000.0, 990665, 1432907700000.0, 0], [1432908000000.0, 472651, 1432908000000.0, 0], [1432908300000.0, 676596, 1432908300000.0, 0], [1432908600000.0, 115723, 1432908600000.0, 0], [1432908900000.0, 137168, 1432908900000.0, 0], [1432909200000.0, 804, 1432909200000.0, 0], [1432909500000.0, 2828, 1432909500000.0, 0], [1432909800000.0, 4381, 1432909800000.0, 0], [1432910100000.0, 238, 1432910100000.0, 0], [1432910400000.0, 366, 1432910400000.0, 0]]},
        // {name: 'merger', data: [[1432891800000.0, 0, 1432891800000.0, 0], [1432896300000.0, 33, 1432896300000.0, 0], [1432896900000.0, 376869, 1432896900000.0, 0], [1432897200000.0, 611329, 1432897200000.0, 0], [1432897800000.0, 390, 1432897800000.0, 0], [1432898100000.0, 14690, 1432898100000.0, 0], [1432898400000.0, 53640, 1432898400000.0, 0], [1432898700000.0, 68766, 1432898700000.0, 0], [1432899000000.0, 2079, 1432899000000.0, 0], [1432899300000.0, 173, 1432899300000.0, 0], [1432899600000.0, 16079, 1432899600000.0, 0], [1432899900000.0, 445, 1432899900000.0, 0], [1432900200000.0, 3940, 1432900200000.0, 0], [1432900500000.0, 0, 1432900500000.0, 0], [1432900800000.0, 0, 1432900800000.0, 0], [1432901100000.0, 8132, 1432901100000.0, 0], [1432901400000.0, 12479, 1432901400000.0, 0], [1432901700000.0, 16706, 1432901700000.0, 0], [1432902000000.0, 658, 1432902000000.0, 0], [1432902300000.0, 0, 1432902300000.0, 0], [1432902600000.0, 334, 1432902600000.0, 0], [1432902900000.0, 116732, 1432902900000.0, 0], [1432903200000.0, 6758, 1432903200000.0, 0], [1432903500000.0, 1625, 1432903500000.0, 0], [1432903800000.0, 95514, 1432903800000.0, 0], [1432904100000.0, 60887, 1432904100000.0, 0], [1432904400000.0, 44707, 1432904400000.0, 0], [1432904700000.0, 29057, 1432904700000.0, 0], [1432905000000.0, 343, 1432905000000.0, 0], [1432905300000.0, 724292, 1432905300000.0, 0], [1432905600000.0, 254545, 1432905600000.0, 0], [1432905900000.0, 4124, 1432905900000.0, 0], [1432906200000.0, 77761, 1432906200000.0, 0], [1432906500000.0, 4813, 1432906500000.0, 1], [1432906800000.0, 60506, 1432906800000.0, 0], [1432907100000.0, 37745, 1432907100000.0, 0], [1432907400000.0, 256042, 1432907400000.0, 0], [1432907700000.0, 20330, 1432907700000.0, 0], [1432908000000.0, 330573, 1432908000000.0, 0], [1432908300000.0, 45508, 1432908300000.0, 0], [1432908600000.0, 326275, 1432908600000.0, 0], [1432908900000.0, 94453, 1432908900000.0, 0], [1432909200000.0, 7839, 1432909200000.0, 0], [1432909500000.0, 89709, 1432909500000.0, 0], [1432909800000.0, 12161, 1432909800000.0, 0], [1432910100000.0, 50, 1432910100000.0, 0], [1432910400000.0, 120349, 1432910400000.0, 0]]},
        // {name: 'sql', data: [[1432891800000.0, 680, 1432891800000.0, 0], [1432896300000.0, 0, 1432896300000.0, 0], [1432896900000.0, 3789, 1432896900000.0, 0], [1432897200000.0, 0, 1432897200000.0, 0], [1432897800000.0, 1244, 1432897800000.0, 0], [1432898100000.0, 229329, 1432898100000.0, 0], [1432898400000.0, 24505, 1432898400000.0, 0], [1432898700000.0, 11154, 1432898700000.0, 0], [1432899000000.0, 1819, 1432899000000.0, 0], [1432899300000.0, 3642, 1432899300000.0, 0], [1432899600000.0, 163, 1432899600000.0, 0], [1432899900000.0, 1183, 1432899900000.0, 0], [1432900200000.0, 92371, 1432900200000.0, 0], [1432900500000.0, 32, 1432900500000.0, 0], [1432900800000.0, 0, 1432900800000.0, 0], [1432901100000.0, 5506, 1432901100000.0, 0], [1432901400000.0, 192, 1432901400000.0, 0], [1432901700000.0, 920, 1432901700000.0, 0], [1432902000000.0, 2943, 1432902000000.0, 0], [1432902300000.0, 1274, 1432902300000.0, 0], [1432902600000.0, 1878, 1432902600000.0, 0], [1432902900000.0, 574, 1432902900000.0, 0], [1432903200000.0, 500795, 1432903200000.0, 0], [1432903500000.0, 1488, 1432903500000.0, 0], [1432903800000.0, 5735, 1432903800000.0, 0], [1432904100000.0, 2904, 1432904100000.0, 0], [1432904400000.0, 26533, 1432904400000.0, 0], [1432904700000.0, 0, 1432904700000.0, 0], [1432905000000.0, 1047, 1432905000000.0, 0], [1432905300000.0, 1489220, 1432905300000.0, 0], [1432905600000.0, 491698, 1432905600000.0, 0], [1432905900000.0, 2090, 1432905900000.0, 0], [1432906200000.0, 104779, 1432906200000.0, 0], [1432906500000.0, 106489, 1432906500000.0, 0], [1432906800000.0, 53816, 1432906800000.0, 0], [1432907100000.0, 202167, 1432907100000.0, 0], [1432907400000.0, 113161, 1432907400000.0, 0], [1432907700000.0, 35522, 1432907700000.0, 0], [1432908000000.0, 1074512, 1432908000000.0, 0], [1432908300000.0, 44802, 1432908300000.0, 0], [1432908600000.0, 165476, 1432908600000.0, 0], [1432908900000.0, 39141, 1432908900000.0, 0], [1432909200000.0, 785, 1432909200000.0, 0], [1432909500000.0, 350014, 1432909500000.0, 0], [1432909800000.0, 6076, 1432909800000.0, 0], [1432910100000.0, 725, 1432910100000.0, 0], [1432910400000.0, 0, 1432910400000.0, 0]]},
        // {name: 'encoder', data: [[1432891800000.0, 0, 1432891800000.0, 0], [1432896300000.0, 0, 1432896300000.0, 0], [1432896900000.0, 83, 1432896900000.0, 0], [1432897200000.0, 1011, 1432897200000.0, 0], [1432897800000.0, 0, 1432897800000.0, 0], [1432898100000.0, 1, 1432898100000.0, 0], [1432898400000.0, 0, 1432898400000.0, 0], [1432898700000.0, 8, 1432898700000.0, 0], [1432899000000.0, 0, 1432899000000.0, 0], [1432899300000.0, 0, 1432899300000.0, 0], [1432899600000.0, 25, 1432899600000.0, 0], [1432899900000.0, 0, 1432899900000.0, 0], [1432900200000.0, 0, 1432900200000.0, 0], [1432900500000.0, 26, 1432900500000.0, 0], [1432900800000.0, 0, 1432900800000.0, 0], [1432901100000.0, 79, 1432901100000.0, 0], [1432901400000.0, 0, 1432901400000.0, 0], [1432901700000.0, 0, 1432901700000.0, 0], [1432902000000.0, 0, 1432902000000.0, 0], [1432902300000.0, 0, 1432902300000.0, 0], [1432902600000.0, 0, 1432902600000.0, 0], [1432902900000.0, 0, 1432902900000.0, 0], [1432903200000.0, 107, 1432903200000.0, 0], [1432903500000.0, 0, 1432903500000.0, 0], [1432903800000.0, 0, 1432903800000.0, 0], [1432904100000.0, 1168, 1432904100000.0, 0], [1432904400000.0, 0, 1432904400000.0, 0], [1432904700000.0, 0, 1432904700000.0, 0], [1432905000000.0, 0, 1432905000000.0, 0], [1432905300000.0, 80, 1432905300000.0, 0], [1432905600000.0, 239, 1432905600000.0, 0], [1432905900000.0, 0, 1432905900000.0, 0], [1432906200000.0, 201, 1432906200000.0, 0], [1432906500000.0, 12, 1432906500000.0, 0], [1432906800000.0, 250, 1432906800000.0, 0], [1432907100000.0, 120, 1432907100000.0, 0], [1432907400000.0, 72, 1432907400000.0, 0], [1432907700000.0, 112, 1432907700000.0, 0], [1432908000000.0, 108, 1432908000000.0, 0], [1432908300000.0, 87, 1432908300000.0, 0], [1432908600000.0, 2, 1432908600000.0, 0], [1432908900000.0, 0, 1432908900000.0, 0], [1432909200000.0, 0, 1432909200000.0, 0], [1432909500000.0, 13, 1432909500000.0, 0], [1432909800000.0, 0, 1432909800000.0, 0], [1432910100000.0, 0, 1432910100000.0, 0], [1432910400000.0, 1, 1432910400000.0, 0]]}
        // {
        //     name: 'decoder (Minor)',
        //     data: [[1269667168000.0, 70], [1269674668000.0, 275], [1269686968000.0, 290], [1269688168000.0, 93], [1269689068000.0, 4383], [1269689368000.0, 3340], [1269689668000.0, 2071], [1269689968000.0, 17125], [1269690268000.0, 3028], [1269690568000.0, 1572670], [1269690868000.0, 649], [1269691168000.0, 17810], [1269691468000.0, 290], [1269691768000.0, 998], [1269692368000.0, 315], [1269692668000.0, 338152], [1269692968000.0, 768243], [1269693268000.0, 66505], [1269693568000.0, 6940], [1269693868000.0, 5769], [1269694168000.0, 2550], [1269694468000.0, 876], [1269694768000.0, 5154], [1269695068000.0, 217435], [1269695368000.0, 699039], [1269695668000.0, 700077], [1269695968000.0, 520777], [1269696268000.0, 1942727], [1269696568000.0, 10866], [1269696868000.0, 6288], [1269697168000.0, 2586], [1269697468000.0, 80005], [1269697768000.0, 9135], [1269698068000.0, 16035], [1269698368000.0, 9037], [1269698668000.0, 684794], [1269698968000.0, 1947801], [1269699268000.0, 203171], [1269699568000.0, 12662], [1269699868000.0, 133362], [1269700168000.0, 5361], [1269700468000.0, 973], [1269700768000.0, 4439], [1269701068000.0, 2406], [1269701368000.0, 43064], [1269701668000.0, 134], [1432891800000.0, 268], [1432896300000.0, 38], [1432896900000.0, 775391], [1432897200000.0, 965416], [1432897800000.0, 3609], [1432898100000.0, 4570], [1432898400000.0, 1905], [1432898700000.0, 3054], [1432899000000.0, 4432], [1432899300000.0, 1283], [1432899600000.0, 1428], [1432899900000.0, 2141], [1432900200000.0, 604], [1432900500000.0, 243], [1432900800000.0, 196], [1432901100000.0, 561550], [1432901400000.0, 397], [1432901700000.0, 427], [1432902000000.0, 809], [1432902300000.0, 308], [1432902600000.0, 2095], [1432902900000.0, 423], [1432903200000.0, 758964], [1432903500000.0, 2519], [1432903800000.0, 51953], [1432904100000.0, 598020], [1432904400000.0, 1832], [1432904700000.0, 30185], [1432905000000.0, 615], [1432905300000.0, 414911], [1432905600000.0, 114107], [1432905900000.0, 8180], [1432906200000.0, 3180], [1432906500000.0, 34914], [1432906800000.0, 10953], [1432907100000.0, 75932], [1432907400000.0, 41271], [1432907700000.0, 990665], [1432908000000.0, 472651], [1432908300000.0, 676596], [1432908600000.0, 115723], [1432908900000.0, 137168], [1432909200000.0, 804], [1432909500000.0, 2828], [1432909800000.0, 4381], [1432910100000.0, 238], [1432910400000.0, 366]]
        // },
        // {
        //     name: "decoder (Major)",
        //     data: [[1269667168000.0, 0], [1269674668000.0, 0], [1269686968000.0, 0], [1269688168000.0, 0], [1269689068000.0, 0], [1269689368000.0, 0], [1269689668000.0, 0], [1269689968000.0, 0], [1269690268000.0, 0], [1269690568000.0, 0], [1269690868000.0, 0], [1269691168000.0, 0], [1269691468000.0, 0], [1269691768000.0, 0], [1269692368000.0, 0], [1269692668000.0, 0], [1269692968000.0, 0], [1269693268000.0, 0], [1269693568000.0, 0], [1269693868000.0, 0], [1269694168000.0, 0], [1269694468000.0, 0], [1269694768000.0, 0], [1269695068000.0, 15], [1269695368000.0, 0], [1269695668000.0, 0], [1269695968000.0, 0], [1269696268000.0, 0], [1269696568000.0, 0], [1269696868000.0, 0], [1269697168000.0, 0], [1269697468000.0, 0], [1269697768000.0, 0], [1269698068000.0, 0], [1269698368000.0, 0], [1269698668000.0, 0], [1269698968000.0, 0], [1269699268000.0, 0], [1269699568000.0, 0], [1269699868000.0, 0], [1269700168000.0, 0], [1269700468000.0, 0], [1269700768000.0, 0], [1269701068000.0, 0], [1269701368000.0, 0], [1269701668000.0, 0], [1432891800000.0, 0], [1432896300000.0, 0], [1432896900000.0, 0], [1432897200000.0, 0], [1432897800000.0, 0], [1432898100000.0, 0], [1432898400000.0, 0], [1432898700000.0, 0], [1432899000000.0, 0], [1432899300000.0, 0], [1432899600000.0, 0], [1432899900000.0, 0], [1432900200000.0, 0], [1432900500000.0, 0], [1432900800000.0, 0], [1432901100000.0, 0], [1432901400000.0, 0], [1432901700000.0, 0], [1432902000000.0, 0], [1432902300000.0, 0], [1432902600000.0, 0], [1432902900000.0, 0], [1432903200000.0, 0], [1432903500000.0, 0], [1432903800000.0, 0], [1432904100000.0, 0], [1432904400000.0, 0], [1432904700000.0, 0], [1432905000000.0, 0], [1432905300000.0, 0], [1432905600000.0, 0], [1432905900000.0, 0], [1432906200000.0, 0], [1432906500000.0, 0], [1432906800000.0, 0], [1432907100000.0, 0], [1432907400000.0, 0], [1432907700000.0, 0], [1432908000000.0, 0], [1432908300000.0, 0], [1432908600000.0, 0], [1432908900000.0, 0], [1432909200000.0, 0], [1432909500000.0, 0], [1432909800000.0, 0], [1432910100000.0, 0], [1432910400000.0, 0]]
        // }
        {
            name: 'Average CPU Time',
            data: [[1432891800000.0, 19225500.0], [1432896300000.0, 22039600.0], [1432896900000.0, 33764375.0], [1432897200000.0, 23594650.0], [1432897800000.0, 11229750.0], [1432898100000.0, 20486525.0], [1432898400000.0, 26107650.0], [1432898700000.0, 12664625.0], [1432899000000.0, 11427966.666666666], [1432899300000.0, 22590550.0], [1432899600000.0, 7551266.666666667], [1432899900000.0, 19726100.0], [1432900200000.0, 25350550.0], [1432900500000.0, 2367950.0], [1432900800000.0, 1283150.0], [1432901100000.0, 7035250.0], [1432901400000.0, 19546833.333333332], [1432901700000.0, 12058600.0], [1432902000000.0, 8158066.666666667], [1432902300000.0, 13335050.0], [1432902600000.0, 12544966.666666666], [1432902900000.0, 9381500.0], [1432903200000.0, 28693750.0], [1432903500000.0, 12962350.0], [1432903800000.0, 10338875.0], [1432904100000.0, 9550700.0], [1432904400000.0, 32151950.0], [1432904700000.0, 15003350.0], [1432905000000.0, 5916400.0], [1432905300000.0, 15540937.5], [1432905600000.0, 16500005.555555556], [1432905900000.0, 14063858.333333334], [1432906200000.0, 15930614.285714285], [1432906500000.0, 17366730.0], [1432906800000.0, 21593137.5], [1432907100000.0, 26221887.5], [1432907400000.0, 20833316.666666668], [1432907700000.0, 20377666.666666668], [1432908000000.0, 13048296.666666666], [1432908300000.0, 17409785.0], [1432908600000.0, 18024260.714285713], [1432908900000.0, 15834842.105263159], [1432909200000.0, 14424266.666666666], [1432909500000.0, 20340910.0], [1432909800000.0, 13166975.0], [1432910100000.0, 26352450.0], [1432910400000.0, 13955100.0]]
        }
    ]
  };
}

var initial_main_feed = generate_chart();

$(function () {
  //Draw the chart
  $('#feed_main_chart').highcharts(initial_main_feed);
})

var colorWheel = 0;
var submit_query = function(e) {
  var optionNum = ["Page Faults", "Context Switches", "Input/Output Blocks", "CPU Time", "RSS Memory"].indexOf($('#option').val());
  var args = {
    table: 'tst',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    c: $('#threadNames').val()[0],
    d: $('#startDate').val().replace('T', ' '),
    e: $('#endDate').val().replace('T', ' '),
    option: optionNum.toString()
  };
  args = $.param(args);
  console.log(args);
  $.getJSON('/_make_query', args, function(data) {
        response = initial_main_feed;
        if (optionNum < 3) {
          response.series[0].name = data.name1;
          response.series[0].data = data.data1;
          response.series[0].color = Highcharts.getOptions().colors[colorWheel];
          if (response.series.length > 2) { //Go from more than 2 lines to 2 lines
            response.series = response.series.slice(0,2);
            response.series[1].name = data.name2;
            response.series[1].data = data.data2;
            response.series[1].color = Highcharts.getOptions().colors[colorWheel];
          } else { // Go from one line to two lines
            response.series.push({name: data.name2, data: data.data2, color: Highcharts.getOptions().colors[colorWheel]})
          }
          
        } else {
          response.series = response.series.slice(0,1);
          response.series[0].name = data.name;
          response.series[0].data = data.data;
          response.series[0].color = Highcharts.getOptions().colors[colorWheel];
        }
        
        colorWheel += 1;
        var chart = $('#feed_main_chart').highcharts();
        var chart = new Highcharts.Chart(response);
        chart.title.attr({text: 'Thread' + $('#option').val() + " over Time"});
        chart.yAxis[0].axisTitle.attr({text: $('#option').val()});
        $('#feed_main_chart').prop('title', data.query);
  });
  return false;
};


// Add a new line to the current graph
var submit_query_add = function(e) {
  var optionNum = ["Page Faults", "Context Switches", "Input/Output Blocks", "CPU Time", "RSS Memory"].indexOf($('#option').val());
  var args = {
    table: 'tst',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    c: $('#threadNames').val()[0],
    d: $('#startDate').val().replace('T', ' '),
    e: $('#endDate').val().replace('T', ' '),
    option: optionNum.toString()//["Page Faults", "Context Switches", "Input/Output Blocks", "CPU Time", "RSS Memory"].indexOf($('#option').val()).toString()
  };
  args = $.param(args);
  $.getJSON('/_make_query', args, function(data) {
    response = initial_main_feed;
    if (optionNum < 3) {
      response.series.push({name: data.name1, data: data.data1, color: Highcharts.getOptions().colors[colorWheel]},
                          {name: data.name2, data: data.data2, color: Highcharts.getOptions().colors[colorWheel]})
    } else {
      response.series.push({name: data.name, data: data.data, color: Highcharts.getOptions().colors[colorWheel]})
    }
    colorWheel += 1;
    var chart = $('#feed_main_chart').highcharts();
    var chart = new Highcharts.Chart(response);
    chart.yAxis[0].axisTitle.attr({text: $('#option').val()});
    chart.title.attr({text: 'Thread' + $('#option').val() + " over Time"});
    $('#feed_main_chart').prop('title', data.query);
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




