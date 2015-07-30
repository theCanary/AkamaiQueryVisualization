/*
This allows annotations to be added to the graph.
Software used: Impyla, Impala, Hive, Highcharts.
Author: Ashley Wang
*/

// Make a new graph
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
