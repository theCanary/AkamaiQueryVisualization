/*
This populates the page impalaQuery.html
Software used: Impyla, Impala, Hive
Author: Ashley Wang
*/


/*
Add in all the options and the default settings
*/
$(function () {
    // Add query and time inputs
    $('<p><textarea rows="12" cols="50" id="query_text" placeholder = "SELECT * from tst where majorpf > 0;" style = "width:100%; size:15px;" ></textarea></p>').appendTo('#SQL_Query_Console');
    $('<p><input type="button" id="make_query" value = "Execute"><br></p>').appendTo('#SQL_Query_Console');
    $('#make_query').bind('click', sqlQuery);
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
  series: [
      {
          name: 'Total',
          data: [[1435692600000.0, 1], [1435731600000.0, 1], [1435743300000.0, 2], [1435747200000.0, 1], [1435747500000.0, 3], [1435747800000.0, 3], [1435748100000.0, 1], [1435748700000.0, 1], [1435749000000.0, 3], [1435749300000.0, 8], [1435749600000.0, 5], [1435749900000.0, 9], [1435750200000.0, 13], [1435750500000.0, 13], [1435750800000.0, 10], [1435751100000.0, 15], [1435751400000.0, 14], [1435751700000.0, 15], [1435752000000.0, 9], [1435752300000.0, 9], [1435752600000.0, 13], [1435752900000.0, 13], [1435753200000.0, 13], [1435753500000.0, 10], [1435753800000.0, 11], [1435754100000.0, 11], [1435754400000.0, 14], [1435754700000.0, 6], [1435755000000.0, 16], [1435755300000.0, 15], [1435755600000.0, 23], [1435755900000.0, 13], [1435756200000.0, 14], [1435756500000.0, 11], [1435756800000.0, 15], [1435757100000.0, 8], [1435757400000.0, 14], [1435757700000.0, 27], [1435758000000.0, 8], [1435758300000.0, 11], [1435758600000.0, 10], [1435758900000.0, 12], [1435759200000.0, 12], [1435759500000.0, 11], [1435759800000.0, 21], [1435760100000.0, 14], [1435760400000.0, 7], [1435760700000.0, 8], [1435761000000.0, 14], [1435761300000.0, 16], [1435761600000.0, 10], [1435761900000.0, 10], [1435762200000.0, 8], [1435762500000.0, 17], [1435762800000.0, 10], [1435763100000.0, 8], [1435763400000.0, 4], [1435763700000.0, 11], [1435764000000.0, 7], [1435764600000.0, 6], [1435764900000.0, 3], [1435765200000.0, 1], [1435765500000.0, 2]]
      }
  ]
};

$(function () {
  //Add buttons
  $('#feed_main_chart').highcharts(initial_main_feed);
})

// Add a new line to the current graph
var sqlQuery = function(e) {
  $("#feed_main_chart table").remove();
  $(".highcharts-container").remove();
  var args = {
    query: $('#query_text').val(),
  };
  args = $.param(args);
  $.getJSON('/_make_sql_query', args, function(data) {
    console.log(data)
    $(data.code).appendTo('#feed_main_chart');
  });
  return false;
};
