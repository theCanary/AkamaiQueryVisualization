/** This script contains functions that are too generic to be put into other places. **/ 
/* Below code is for inserting into the list of alerts, which we assume to be sorted because it's sorted in Python by either the DB or by sortedcontainers.
Credit to: http://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
This function returns the location of the array element which is immediately less than where our "new" element should be (i.e. the value to the left),
so that we can splice to insert it after. This means we return -1 for a 0-length array, so we can insert at position 0.
This is done by a quicksort-style algorithm.
*/
function location_of(element, arr, comparator, start, end) {
	if (arr.length == 0){
		return -1;
	}

	if (!start){
		start = 0;
	}

	if(!end) {
		end = arr.length;
	}

	var pivot = (start + end) >> 1; //equivalent to finding the midpoint
	var c = compare_alerts(element,arr[pivot]);
	if (end - start <= 1) {
		return c == -1 ? pivot -1 : pivot; //if we've reached the single element array case, return whether you should put it before or after this one.	
	}

	switch(c) {
		case -1: return location_of(element, arr, comparator, start, pivot);
		case 0: return pivot; //Make SURE IDs are unique!
		case 1: return location_of(element,arr,comparator,pivot,end);
	}
}
