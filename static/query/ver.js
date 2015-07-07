/*
This populates the page versionstats.html
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

}(this, this.document))

/*

*/
$(function () {
    // Add table and IP input box
    $('<p><input type="checkbox" id ="multithreaded" > Multithreaded?<br></p>').appendTo('#other');
    $('<p><input type="text" id="ipAddress" placeholder = "IP Address" size="12" ></p>').appendTo('#other');
    $("<p>Aggset Type: <select id = 'aggtype'><option>ALL</option><option>tla</option><option>tla/sql</option><option>sql</option> </select> </p>").appendTo('#other');
    $("<p>Build Version: <select id = 'build'><option>ALL</option><option> 6.6.1</option></select> </p>").appendTo('#other');

    // Add start and end date input boxes
    $('<p><input type="datetime-local" id="startDate" placeholder = "Start Date" size="12" > - Start Date</p>').appendTo('#option_inputs');
    $('<p><input type="datetime-local" id="endDate" placeholder = "End Date" size="12" > - End Date</p>').appendTo('#option_inputs');

    // Set defaults for span and domain
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
    var prevDate = new Date(new Date(datetime) - (60*60*24*1000*365)).toJSON().substring(0,16) //edit the string to make it the right format
    $("#startDate").val(prevDate);
    
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
var initial_main_feed = {
    chart: {
        type: 'scatter',
        zoomType: 'x'
    },
    title: {
        text: 'Generation Interval over process Start Time'
    },
    subtitle: {
        text: '(Click and drag to zoom in)'
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
    xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
            month: '%e. %b',
            year: '%b'
        },
        title: {
            text: 'Date'
        },
        minRange: 1
    },
    yAxis: {
        title: {
            text: 'Generation Interval (seconds)'
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
        name: 'All',
        data: [[1432897634000.0, 120], [1431982864000.0, 60], [1432889516000.0, 240], [1432895906000.0, 240], [1431982755000.0, 60], [1432855655000.0, 60], [1432895906000.0, 240], [1432316641000.0, 60], [1432901164000.0, 240], [1431982819000.0, 60], [1431982819000.0, 60], [1431982819000.0, 60], [1432825155000.0, 120], [1432899443000.0, 120], [1432519342000.0, 120], [1431982647000.0, 60], [1432905739000.0, 120], [1431982884000.0, 120], [1432890149000.0, 120], [1432897660000.0, 300], [1431982882000.0, 60], [1432834175000.0, 120], [1432763507000.0, 60], [1432765153000.0, 60], [1432899472000.0, 120], [1432895881000.0, 120], [1432897654000.0, 120], [1432854945000.0, 120], [1432778508000.0, 120], [1432837457000.0, 240], [1432837457000.0, 240], [1431982688000.0, 240], [1432521141000.0, 120], [1432853151000.0, 240], [1432901245000.0, 300], [1432904467000.0, 120], [1432908052000.0, 120], [1431982607000.0, 120], [1432903076000.0, 120], [1432904879000.0, 300], [1431982678000.0, 60], [1431982789000.0, 60], [1432897712000.0, 120], [1431982852000.0, 60], [1432761535000.0, 60], [1432830564000.0, 120], [1432839806000.0, 240], [1432903067000.0, 120], [1432905240000.0, 240], [1432825814000.0, 240], [1432899461000.0, 300], [1432316612000.0, 60], [1432897655000.0, 120], [1432826938000.0, 120], [1432047444000.0, 60], [1431982726000.0, 60], [1432322024000.0, 240], [1432845922000.0, 240], [1432848809000.0, 60], [1431982660000.0, 60], [1431982807000.0, 60], [1432851301000.0, 120], [1432897633000.0, 120], [1432833387000.0, 240], [1431982731000.0, 60], [1432318427000.0, 60], [1431982780000.0, 60], [1432833387000.0, 240], [1432895834000.0, 120], [1432895906000.0, 240], [1432901263000.0, 300], [1432899441000.0, 120], [1431982645000.0, 60], [1432897970000.0, 120], [1431982627000.0, 60], [1431982663000.0, 120], [1432899539000.0, 120], [1432847006000.0, 120], [1432856083000.0, 120], [1432895849000.0, 120], [1431982819000.0, 60], [1432904279000.0, 240], [1432904279000.0, 240], [1431982884000.0, 120], [1432897632000.0, 120], [1432905002000.0, 240], [1432849515000.0, 120], [1432850251000.0, 120], [1431982815000.0, 60], [1432856718000.0, 240], [1432895846000.0, 120], [1432832376000.0, 240], [1431982599000.0, 60], [1432854259000.0, 300], [1432897654000.0, 120], [1432778508000.0, 120], [1431982930000.0, 60], [1432825164000.0, 120], [1432825190000.0, 120], [1432705567000.0, 60], [1432834138000.0, 240], [1432584619000.0, 120], [1431982609000.0, 60], [1432901238000.0, 60], [1432318422000.0, 240], [1432318422000.0, 240], [1432848845000.0, 240], [1432895881000.0, 120], [1432318422000.0, 240], [1432899539000.0, 120], [1431982762000.0, 60], [1431982789000.0, 60], [1432522975000.0, 120], [1431982736000.0, 60], [1431982755000.0, 60], [1431982884000.0, 120], [1432895861000.0, 120], [1432748083000.0, 120], [1432833000000.0, 240], [1432891428000.0, 120], [1432826979000.0, 120], [1432827397000.0, 240], [1432848841000.0, 120], [1432849552000.0, 120], [1432895859000.0, 120], [1432853113000.0, 120], [1432895921000.0, 120], [1432896990000.0, 120], [1432827397000.0, 240], [1432828729000.0, 240], [1432848841000.0, 120], [1432848841000.0, 120], [1432871093000.0, 120], [1432848835000.0, 240], [1432828775000.0, 120], [1432852343000.0, 120], [1432901238000.0, 60], [1431982687000.0, 60], [1432407273000.0, 120], [1432832393000.0, 120], [1431982597000.0, 60], [1431982756000.0, 60], [1431982860000.0, 60], [1432730176000.0, 120], [1432847029000.0, 60], [1432828787000.0, 120], [1432901308000.0, 120], [1432842253000.0, 240], [1432897637000.0, 240], [1432899448000.0, 120], [1432839806000.0, 240], [1432905017000.0, 240], [1431982703000.0, 120], [1432763387000.0, 60], [1432905017000.0, 240], [1432553184000.0, 120], [1432897637000.0, 240], [1432555724000.0, 60], [1432318461000.0, 60], [1432857131000.0, 240], [1432901245000.0, 300], [1431982916000.0, 60], [1432574639000.0, 120], [1432855655000.0, 60], [1432180161000.0, 60], [1432832353000.0, 120], [1432893634000.0, 60], [1432897655000.0, 120], [1432899472000.0, 120], [1432830540000.0, 240], [1432849527000.0, 120], [1432853151000.0, 240], [1432893634000.0, 60], [1431982610000.0, 120], [1432895833000.0, 120], [1432887970000.0, 120], [1432847006000.0, 120], [1432903064000.0, 120], [1432903064000.0, 120], [1432521141000.0, 120], [1432705904000.0, 120], [1432851299000.0, 240], [1432853112000.0, 120], [1432825164000.0, 120], [1432849804000.0, 240], [1432318422000.0, 240], [1432314829000.0, 60], [1432318427000.0, 60], [1432832374000.0, 240], [1432903495000.0, 240], [1431982764000.0, 60], [1432852476000.0, 120], [1432899439000.0, 120], [1432828764000.0, 120], [1432899492000.0, 120], [1432905739000.0, 120], [1432831985000.0, 240], [1432897635000.0, 120], [1432891217000.0, 120], [1432903067000.0, 120], [1432899539000.0, 120], [1432828729000.0, 240], [1432897353000.0, 240], [1432904864000.0, 120], [1432670635000.0, 60], [1432831984000.0, 240], [1432897643000.0, 120], [1432905176000.0, 240], [1432905176000.0, 240], [1432907930000.0, 120], [1432831984000.0, 240], [1432841085000.0, 120], [1432906510000.0, 240], [1432831984000.0, 240], [1432889413000.0, 120], [1432903076000.0, 300], [1431982757000.0, 60], [1432903060000.0, 120], [1432908592000.0, 120], [1431982743000.0, 60], [1432909249000.0, 120], [1432909274000.0, 120], [1432889413000.0, 120], [1432895830000.0, 120], [1432895830000.0, 120], [1432895830000.0, 120], [1432316641000.0, 60], [1431982721000.0, 60], [1432853093000.0, 120], [1432901239000.0, 120], [1432905212000.0, 240], [1432908978000.0, 120], [1432830748000.0, 120], [1432834169000.0, 120], [1432907799000.0, 240], [1432849516000.0, 120], [1432851300000.0, 120], [1432899463000.0, 120], [1432856713000.0, 120], [1432853110000.0, 120], [1432830572000.0, 120], [1432903076000.0, 120], [1432905044000.0, 120], [1432834168000.0, 120], [1432900129000.0, 240], [1432905721000.0, 240], [1432905278000.0, 120], [1431982657000.0, 60], [1431982657000.0, 60], [1432314829000.0, 60], [1432903067000.0, 120], [1432832346000.0, 120], [1432848853000.0, 240], [1432668823000.0, 60], [1432842488000.0, 240], [1431982689000.0, 240], [1431982738000.0, 60], [1432826979000.0, 120], [1431982807000.0, 60], [1432737977000.0, 60], [1432842019000.0, 60], [1432853116000.0, 120], [1432899443000.0, 120], [1432872539000.0, 60], [1432856713000.0, 120], [1432830556000.0, 120], [1432849550000.0, 120], [1431982706000.0, 120], [1432831985000.0, 120], [1432904759000.0, 240], [1432826979000.0, 120], [1432766980000.0, 60], [1431982688000.0, 240], [1432819942000.0, 120], [1432830592000.0, 120], [1432853112000.0, 120], [1432899470000.0, 120], [1432830592000.0, 120], [1432895846000.0, 120], [1432771786000.0, 240], [1432895839000.0, 120], [1432901239000.0, 120], [1432905002000.0, 240], [1432705567000.0, 60], [1432047444000.0, 60], [1432856001000.0, 120], [1432901289000.0, 120], [1431982666000.0, 60], [1432831984000.0, 240], [1431982585000.0, 60], [1431982882000.0, 60], [1432320222000.0, 240], [1432833387000.0, 240], [1432873979000.0, 120], [1431982703000.0, 120], [1432761916000.0, 120], [1432906510000.0, 240], [1431982729000.0, 60], [1432906510000.0, 240], [1432895881000.0, 120], [1432905002000.0, 240], [1432761916000.0, 120], [1431982593000.0, 240], [1431982684000.0, 60], [1432906648000.0, 120], [1432895865000.0, 120], [1432834169000.0, 120], [1432899469000.0, 240], [1432905759000.0, 120], [1431982609000.0, 60], [1432849535000.0, 120], [1432826965000.0, 120], [1432157123000.0, 120], [1432157123000.0, 120], [1431982729000.0, 60], [1432854941000.0, 120], [1431982729000.0, 60], [1431982898000.0, 60], [1432904919000.0, 120], [1432839806000.0, 240], [1432856713000.0, 120], [1432863812000.0, 120], [1431982627000.0, 60], [1432831984000.0, 240], [1432853191000.0, 240], [1431982610000.0, 120], [1432853191000.0, 240], [1432437850000.0, 120], [1432890149000.0, 120], [1432849595000.0, 300], [1432853112000.0, 120], [1432848841000.0, 120], [1432830546000.0, 240], [1432826938000.0, 120], [1432845922000.0, 240], [1432828787000.0, 120], [1432314829000.0, 60], [1432849558000.0, 120], [1432885222000.0, 120], [1431982877000.0, 60], [1431982705000.0, 60], [1432852447000.0, 120], [1432849516000.0, 120], [1432853156000.0, 120], [1431982884000.0, 120], [1432826979000.0, 120], [1432848828000.0, 120], [1432853146000.0, 300], [1432737977000.0, 60], [1432853146000.0, 300], [1432854923000.0, 120], [1432901264000.0, 120], [1432901264000.0, 120], [1432854259000.0, 120], [1432831985000.0, 120], [1431982824000.0, 60], [1432897637000.0, 240], [1432895845000.0, 120], [1432895861000.0, 120], [1432899461000.0, 120], [1432825155000.0, 120], [1432063179000.0, 60], [1431982723000.0, 60], [1432875512000.0, 120], [1432834168000.0, 120], [1432834168000.0, 120], [1432901664000.0, 120], [1432901285000.0, 120], [1432895841000.0, 120], [1431982599000.0, 60], [1432895839000.0, 120], [1431982762000.0, 60], [1432832367000.0, 120], [1432845242000.0, 240], [1431982607000.0, 120], [1431982743000.0, 60], [1431982729000.0, 60], [1432825242000.0, 120], [1432897654000.0, 120], [1431982607000.0, 120], [1431982729000.0, 60], [1432895857000.0, 120], [1431982789000.0, 60], [1432766593000.0, 240], [1432895869000.0, 300], [1432856001000.0, 120], [1432526543000.0, 240], [1431982869000.0, 60], [1432844779000.0, 240], [1432895838000.0, 60], [1432895838000.0, 60], [1432895838000.0, 60], [1432825142000.0, 120], [1432901240000.0, 120], [1432893932000.0, 120], [1432901240000.0, 120], [1431982869000.0, 60], [1431982898000.0, 60], [1432895847000.0, 300], [1432897644000.0, 120], [1431982869000.0, 60], [1431982869000.0, 60], [1432850631000.0, 120], [1432907419000.0, 240], [1432895847000.0, 240], [1432851321000.0, 120], [1432905247000.0, 240], [1431982721000.0, 60], [1432826959000.0, 240], [1432872054000.0, 60], [1432843431000.0, 120], [1432899466000.0, 120], [1431982687000.0, 60], [1432828757000.0, 120], [1431982764000.0, 60], [1431982663000.0, 60], [1432832374000.0, 240], [1432898871000.0, 120], [1432906510000.0, 240], [1432569609000.0, 60], [1432830570000.0, 120], [1432500374000.0, 120], [1432839806000.0, 240], [1432899492000.0, 120], [1432833387000.0, 240], [1431982872000.0, 60], [1432895834000.0, 120], [1432897616000.0, 60], [1432428299000.0, 120], [1432895834000.0, 120], [1432901244000.0, 120], [1432830586000.0, 120], [1432904513000.0, 120], [1432843395000.0, 120], [1432897668000.0, 120], [1431982593000.0, 240], [1432825322000.0, 240], [1432553184000.0, 120], [1432316612000.0, 60], [1432316612000.0, 60], [1432316612000.0, 60], [1432901231000.0, 120], [1432899466000.0, 120]]
        // marker: {radius: 3}
    },
    // {
    //     name: '120s',
    //     data: [[1431907200000.0, 13], [1432080000000.0, 2], [1432339200000.0, 1], [1432425600000.0, 3], [1432512000000.0, 8], [1432684800000.0, 5], [1432771200000.0, 86], [1432857600000.0, 105]]
    //     // marker: {radius: 4}
    // },
    // {
    //     name: '240s',
    //     data: [[1431907200000.0, 5], [1432252800000.0, 6], [1432512000000.0, 1], [1432684800000.0, 1], [1432771200000.0, 48], [1432857600000.0, 33]]
    //     // marker: {radius: 5}
    // },
    // {
    //     name: '300s',
    //     data: [[1432771200000.0, 4], [1432857600000.0, 9]]
    //     // marker: {radius: 6}
    // }
    ]
};

$(function () {
    // Add menu options to change the graph to different types dynamically
    Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push({separator: true},
      {text: 'scatter plot',
      onclick: function () {
          a = $('#feed_main_chart').highcharts();
          for (i = 0; i < a.series.length; i++) {a.series[i].update({type: 'scatter'})};
      }}
      // {text: 'line',
      // onclick: function () {
      //     a = $('#feed_main_chart').highcharts();
      //     for (i = 0; i < a.series.length; i++) {a.series[i].update({type: 'line'})};
      // }},
      // {text: 'bar',
      // onclick: function () {
      //     a = $('#feed_main_chart').highcharts();
      //     for (i = 0; i < a.series.length; i++) {a.series[i].update({type: 'bar'})};
      // }}
    );

    // Create the main graph
    $('#feed_main_chart').highcharts(initial_main_feed);
});


/*
Functions that deal with button clicks
*/

var colorWheel = 0;

// Make a new graph
var submit_query = function(e) {
  var args = {
    table: 'ver',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    c: $('#multithreaded').is(':checked'),
    d: $('#ipAddress').val(),
    e: $('#aggtype').val(),
    f: $('#build').val(),
    g: $('#startDate').val().replace('T', ' '),
    h: $('#endDate').val().replace('T', ' ')
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
        var chart = $('#feed_main_chart').highcharts();
        var chart = new Highcharts.Chart(response);
        $('#queryStatement').text(data.query);
  });
  return false;
};

// Add a new line to the current graph
var submit_query_add = function(e) {
  var args = {
    table: 'ver',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    c: $('#multithreaded').is(':checked'),
    d: $('#ipAddress').val(),
    e: $('#aggtype').val(),
    f: $('#build').val(),
    g: $('#startDate').val().replace('T', ' '),
    h: $('#endDate').val().replace('T', ' ')
  };
  args = $.param(args);
  $.getJSON('/_make_query', args, function(data) {
        response = initial_main_feed;
        response.series.push({name: data.name, data: data.data, color: Highcharts.getOptions().colors[colorWheel]})
        colorWheel += 1;
        var chart = $('#feed_main_chart').highcharts();
        var chart = new Highcharts.Chart(response);
        $('#queryStatement').text(data.query);
  });
  return false;
};
