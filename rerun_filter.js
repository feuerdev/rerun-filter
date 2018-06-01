/**
 * This script hides all streams which title includes any Words in the blocked_words array.
 */
let blocked_words = ["rerun","Rerun", "RERUN", "REBROADCAST", "Rebroadcast"];

/*
 * Fast Interval which gets used at the beginning to hide streams fast.
 */
var fastTimer;

/*
 * Slow interval which gets used after the fast interval to check if new reruns have been added.
 */
var slowTimer;

/**
 * Fast interval
 */
let checkIntervalFast = 100;

/**
 * Slow interval
 */
let checkIntervalSlow = 10000;

/**
 * Find all Divs with the class "live-channel-card", which inner html contains a blocked word.
 */
function findReruns() {
	console.log("Trying to hide reruns");
	let streams = document.querySelectorAll('.live-channel-card');
	streams.forEach(function(stream) {
		switchTimer();
		const inner = stream.innerHTML;
		let filter = false;
		blocked_words.forEach(function(blocked) {
			if(!filter) {
				if(inner.includes(blocked)) {
					filter = true;
					hideRerun(stream);
				}
			}
		});		
	});
};

/**
 * Removes a rerun div
 * @param {div} stream 
 */
function hideRerun(stream) {
	console.log("Found a Rerun! Hiding Stream!");
	stream.parentNode.removeChild(stream);	
}

/**
 * Switches the timer from a fast to slow interval rate.
 */
function switchTimer() {
	if(fastTimer) {
		clearInterval(fastTimer);
		setInterval(findReruns, checkIntervalSlow);
		fastTimer = null;
	}	
}

//Start the Interval.
console.log("Rerunfilter checking in...");
fastTimer = setInterval(findReruns, checkIntervalFast);


