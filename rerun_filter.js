/**
 * This script hides all streams which title includes any Words in the blocked_words array.
 */
let blocked_words = ["rerun","Rerun", "RERUN", "REBROADCAST", "Rebroadcast"];

/*
 * This timer is used to determine wether the streams have been loaded yet.
 */
var timer;

/**
 * Time in milliseconds after which to stop checking if the streams have loaded. To prevent running indefinitely if no streams are online.
 */
let maxLoadTime = 10000;

/**
 * Time in milliseconds after which to check if streams have been loaded.
 */
let checkInterval = 500;

/**
 * Hide all divs with class ".stream.item" which title element contains a blocked word.
 */
function hideReruns() {
	let streams = $(".stream.item");
	streams.each(function() {
		let stream = $(this);
		let titleElement = stream.find("p.title");
		let title = titleElement.text();
		let filter = false;
		blocked_words.forEach(function(blocked) {
			if(!filter) {
				if(title.includes(blocked)) {
					filter = true;
					console.log("Hiding Stream: "+ title);
					stream.hide();
				}
			}
		});		
	});
};

/*
 * Runs the hideReruns method if streams have been loaded.
 */
function checkLoadingStatus() {
	if(maxLoadTime > 0) {
		console.log("Checking if streams are loaded");
		if($(".stream.item").length > 0) {
			console.log("Streams are loaded");
			clearInterval(timer);
			hideReruns();
		} else {
			maxLoadTime -= checkInterval;
		}
	} else {
		console.log("Max load time exceeded.");
		clearInterval(timer);
	}
}

//Start the timer.
console.log("Rerunfilter checking in...");
timer = setInterval(checkLoadingStatus, checkInterval);


