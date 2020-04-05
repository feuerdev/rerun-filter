/**
 * This script hides all streams which title includes any Words in the blocked_words array.
 */
const blocked_words = ["rerun", "rebroadcast"];

/**
 * Intervals
 */
const
	INTERVAL_FAST = 200, //200ms
	INTERVAL_SLOW = 2000; //2s

const
	ELEMENT_FOLLOWING = ".live-channel-card",
	ELEMENT_MAINPAGE = ".shelf-card__impression-wrapper";

class Rerun {
	static sid: number = 0;
	id: number;
	title: string;
	element: HTMLElement;

	constructor(id, title, element) {
		this.id = id;
		this.title = title;
		this.element = element;
		Rerun.sid++;
	}
}

/**
 * Singleton Filter instance
 */
class Filter {
	
	static INSTANCE: Filter = null;

	static getInstance(): Filter {
		if (this.INSTANCE == null) {
			console.log("New instance created");
			return new Filter();
		}
		console.log("old instance returned");
		return this.INSTANCE;
	}

	private timer: number;
	private timeSearched: number = 0;
	private timerSlowedDown = false;

	private hiddenElements: Rerun[] = [];

	constructor() {
		this.timer = setInterval(() => this.searchRerun(), INTERVAL_FAST);
	}

	searchRerun() {
		console.log("Searching for reruns");
		let streams: NodeListOf<HTMLElement>;
		if ("/" === location.pathname) {
			streams = document.querySelectorAll(ELEMENT_MAINPAGE);
		} else {
			streams = document.querySelectorAll(ELEMENT_FOLLOWING);
		}
		if (streams) {
			streams.forEach((stream) => {
				const inner = stream.innerHTML;
				for (let blocked of blocked_words) {
					if (inner.toLowerCase().includes(blocked)) {
						this.hideRerun(stream);
						break;
					}
				}
			});
		}

		//Slow down timer after 5 seconds
		if (this.timeSearched > 5000 && !this.timerSlowedDown) {
			console.log("Slowing down timer");
			this.timerSlowedDown = true;
			clearInterval(this.timer)
			this.timer = setInterval(() => this.searchRerun(), INTERVAL_SLOW);


		}
		this.timeSearched += INTERVAL_FAST;
	}

	/**
 	* Removes a rerun div
 	* @param {div} stream 
 	*/
	hideRerun(stream: HTMLElement) {
		if (stream.id === "") {
			stream.id = Rerun.sid.toString();
			let rerun = new Rerun(Rerun.sid, stream.querySelector("h3").innerText, stream);
			this.hiddenElements.push(rerun);
			stream.querySelector("h3");
			stream.style.transition = "opacity " + 1 + "s ease";
			stream.style.opacity = "0";
			setTimeout(() => {
				stream.parentNode.parentNode.removeChild(stream.parentElement);
			}, 1000);
			console.log("Hiding Rerun! : " + stream.querySelector("h3").innerText);
			
			//Sends info to background
			chrome.runtime.sendMessage({message: this.hiddenElements});
		}
	}
	
	clearReruns() {
		this.hiddenElements = [];
	}
}

console.log("New instance requested");
let filter = Filter.getInstance();

//Receives info from background
chrome.runtime.onMessage.addListener(function(request, sender) {
	if(request === "onNavigate") {
		Filter.getInstance().clearReruns();
	}
});