/** This script handles all alert-related functionality, including display, and auxiliary functions to make it work. **/
var MAX_ALERTS = 5; //Maximum number of alerts to be displayed on the dashboard. Modify this constant based on user experience.
var all_alerts = [];
var noData = "<p class='remove_on_data'>There are no alerts to display at this time.</p>";
/*
Compares two alerts. Used for keeping the array of all alerts sorted later on.
*/
function compare_alerts(a,b) { 
	var scoreA = a.score;
	var scoreB = b.score;
	if (scoreA < scoreB) {
		return 1; //put scoreA after scoreB;
	} else if (scoreA > scoreB) {
		return -1;
	} else {
		return 0;
	}
}

/*
Renders our HTML template for display by inserting the following parameters:
id - what is the ID of this alert, used for insertion and removal from the DOM
pipe - name of the pipe, displayed to the user
fieldname = name of the field that this alert is pertinent to, displayed to the user
score - what the score of the alert is; displayed to the user and used as a threshold for warning/exclamation
initial - whether this is the initial rendering (not hidden, no fade-in) or not (hidden so we can fade-in)
*/
function render_template(id,pipe,fieldname,score,initial){
	var IDstring = initial ? id : "collapse alert_msg " + id; //so we can have both classes without mangling formatting
	var icon_string = score > 0.5 ? "exclamation" : "warning";
	var templateHTML = '<div class="'+IDstring+'"><p><span class="alert_icon glyphicon glyphicon-'+icon_string+'-sign"></span> Pipeline <strong>'+pipe+'</strong> in <strong>'+fieldname+'</strong>. Score: '+score.toPrecision(2)+'. <a href="#">Go to live feed.</a></p></div>';
	//TODO: Replace the # with something that depends on the alert's type.
	return templateHTML;
}

/*
Takes as input the initial set of alerts from the database (which is assumed to be sorted!) and renders them to the page.
If "display_top" is true, renders only MAX_ALERTS number of alerts in this space.
alert_container is given so we can use this "widget" in multiple pages without having to worry about layout going weird. Make sure it's either
a valid CSS selector, or the element itself.
*/
function create_initial_alert_display(alerts,alert_container,display_top){
	//storing all alerts may seem excessive, but it supports in-place removal of alerts via websocket messages as well as in-place insertion
	//set up templating string that has slots marked for replace later on. There may be a more native way of doing this, but this is equivalent.
	var endOfLoop = display_top ? MAX_ALERTS : alerts.length -1; //take only top X if we only want those to render
	endOfLoop = Math.min(endOfLoop, alerts.length);
	if (endOfLoop === 0) {
		return false;
	}
	for (var i = 0; i < endOfLoop; i++) {
		var current_alert = alerts[i];
		//now template the HTML and render it
		var actual_render = render_template(current_alert.id,current_alert.pipe,current_alert.fieldname,current_alert.score,true);
		$(alert_container).append(actual_render);
		all_alerts.push(current_alert);
	}
	$(".remove_on_data").remove();
	return true;
}

/*
Takes as input an alert object and inserts it both into the alert container and the list of all alerts.
alert_container must be a valid CSS selector raw element or jQuery selector.
*/
function insert_alert(new_alert, alert_container,display_only_top) {
	//first find out where we're putting it
	//if all_alerts is empty we should be careful
	var loc = location_of(new_alert, all_alerts,compare_alerts);  //extra args handled automatically
	var insertBefore = false;
	var insertionID;
	if (loc > -1) {
		insertionID = all_alerts[loc].id;
	} else {
		if (all_alerts.length < 1) {
			insertionID = false;
		} else {
			insertBefore = true;
			insertionID = all_alerts[loc+1].id;
		}
	}
	//first add it to the array, then actually display the changes
	all_alerts.splice(loc + 1, 0, new_alert);
	//loc+1 because we add to an array index just to the right of something that we found
	var add_to_view = !display_only_top || (display_only_top && loc <= MAX_ALERTS);
	if(add_to_view) {
		var alert_DOM_before_new = insertionID ? $(alert_container).find("."+insertionID) : false;
		add_alert_to_display(new_alert,alert_container,insertBefore,alert_DOM_before_new);
		//if we got here, make sure we remove the last of the top, so we can shift in our new data
		//NOTE: we have to shift AFTER or otherwise find() can't get us what we want.
		var test = display_only_top && all_alerts.length > MAX_ALERTS;
		if (test) {
			remove_alert_from_display(all_alerts[MAX_ALERTS],alert_container);
		}
	}
}

/*
Takes as input an alert object and removes it from the alert container and from our list of all alerts.
alert_container must be a valid CSS selector raw element or jQuery selector.
Takes a boolean, display_only_top, as a parameter to tell whether we should remove it from display at all (because if it's not in the top X, we don't have to),
and once we remove it, if another element should be shifted in.
*/
function pop_alert(alert_container,alert_to_remove,display_only_top){
	//first, remove it from all_alerts, that happens either way
	//the location_of method, when it gets 0 (which is equality) will give you the exact location of an item.
	var remove_location = location_of(alert_to_remove,all_alerts,compare_alerts);
	all_alerts.splice(remove_location,1); //since this is done by iD, it'll work
	var remove_from_view = !display_only_top || (display_only_top && remove_location < MAX_ALERTS);
	//if the location is 4 when MAX_ALERTS is 5, we should care, but if >, we should just not remove from display since it won't even be on display.
	if (remove_from_view) {
		remove_alert_from_display(alert_to_remove,alert_container);
		if (display_only_top && all_alerts.length >= MAX_ALERTS) {
			//add in the next one (i.e. at index MAX_ALERTS-1, if any)
			add_alert_to_display(all_alerts[MAX_ALERTS-1],alert_container); //don't need location since we add it at the bottom
		}
	}
}

/*
Removes a particular alert from display, given an alert object and the container where alerts are to be displayed. Helper method for insert_alert and pop_alert.
alert_container ust be a valid CSS selector raw element or jQuery selector.
*/
function remove_alert_from_display(alert_to_remove,alert_container){
		var alert_ID = alert_to_remove.id;
		var removable_elem = $(alert_container).find("."+alert_ID); //should be fast, make sure this is scalable.
		$(removable_elem).fadeOut(); //cool animation for users, then remove for real
		$(removable_elem).remove();
		if(all_alerts.length < 1) {
			$(alert_container).append(noData);
		}
			
}

/*
Adds an alert at a specified location (selector or element) within the alert container. If no location is given, simply appends to the container.
Helper method for insert_alert and pop_alert. insertBefore is used to add elements to the top of the stack.
alert_container ust be a valid CSS selector raw element or jQuery selector.
*/
function add_alert_to_display(alert_to_add,alert_container,insertBefore,location_to_add){
	var alert_template = render_template(alert_to_add.id,alert_to_add.pipe,alert_to_add.fieldname,alert_to_add.score,false);
	var toFade;
	if(!location_to_add) {
		toFade = $(alert_template).appendTo($(alert_container));
	} else {
		if (!insertBefore) {
			toFade = $(alert_template).insertAfter(location_to_add);
		} else {
			toFade = $(alert_template).insertBefore(location_to_add);
		}
	}
	toFade.fadeIn();
}
