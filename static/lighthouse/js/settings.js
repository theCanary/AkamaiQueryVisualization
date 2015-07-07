$("#submit_settings").on("click", function() {
	//verify that Dig has an actual numeric value
	var dig_value = document.getElementById("dig_lines").value;
	if (!(jQuery.isNumeric(dig_value))) {
		//if it's not numeric, display a warning
		//TODO: Make this warning cooler
		alert("Digging " + dig_value + " lines around an anomaly is not supported. Please input a numeric value."); 
	}else{
		//TODO: Figure out what our "hard" limit on this should be. Maybe 1000 logs is too much? Maybe 10K?
		var form = $("#settings_form");
		var form_url = form.attr("action");
		$.post(form_url,form.serialize(),function(responseData) {
			$(".settings_toast").fadeIn();
			setTimeout(function() {
				$(".settings_toast").fadeOut()},(2*1000));
			});
	}
});
