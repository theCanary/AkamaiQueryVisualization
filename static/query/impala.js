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


$(function () {
  //Add buttons
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
