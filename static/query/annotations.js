/*
This has functions that will be used in all pipelines.
Software used: Impyla, Impala, Hive, Highcharts.
Author: Ashley Wang
*/

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


// Add aggset rolls to the graph
var drawFlags = function (e) {
  var args = {
    table: 'flags'
    // a: $('#ipAddress').val()
    // b: 
  };
  args = $.param(args);
  $.getJSON('/_make_query', args, function(data) {
      
      points = data.data;
      console.log(points);
      var chart = $('#feed_main_chart').highcharts();
      chart.addSeries(
        {
          type: 'flags',
          name: 'Events',
          id: "flagSeries",
          tooltip: {pointFormat: '{point.text}'},
          events: {click: function(event) {
            point = event.point.data;
            data = point.split(", ");
            var timeline = [];
            for (i=0;i<data.length;i++) {
              var roll = data[i];
              var rollSplit = roll.split(":");
              timeline.push({x: parseInt(rollSplit[0])*1000, text: rollSplit[1]});
            }
            console.log(timeline);
            var chart = $('#feed_main_chart').highcharts();
            var a = new Date(event.point.x);
            chart.addSeries({data: timeline, type: 'flags', onSeries:'dataSeries', name: a.getMonth() + '/' + a.getDate() + '/' + a.getFullYear()});
            }
          },
          data: [],
          onSeries:'dataSeries',
          shape: 'flag'
        });
      var flagSeries = chart.get("flagSeries");
      for (i = 0; i < points.length; i++) {
        flagSeries.addPoint({x: points[i][0], text: points[i][1] + " agg rolls", data: points[i][2]}, false);
      }
     chart.redraw();
  });
  return false;
}
