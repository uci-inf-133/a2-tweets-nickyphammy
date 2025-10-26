function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;

	// Count all tweet types
	let completedCount = 0;
	let liveCount = 0;
	let achievementCount = 0;
	let miscellaneousCount = 0;
	let writtenCount = 0;

	tweet_array.forEach(function(tweet) {
		if (tweet.source === 'completed_event') {
			completedCount++;
			if (tweet.written) {
				writtenCount++;
			}
		} 
		else if (tweet.source === 'live_event') {
			liveCount++;
		} 
		else if (tweet.source === 'achievement') {
			achievementCount++;
		} 
		else {
			miscellaneousCount++;
		}
	});

	// Calculate percentages
	const total = tweet_array.length;
	const completedPct = ((completedCount / total) * 100).toFixed(2);
	const livePct = ((liveCount / total) * 100).toFixed(2);
	const achievementPct = ((achievementCount / total) * 100).toFixed(2);
	const miscellaneousPct = ((miscellaneousCount / total) * 100).toFixed(2);
	const writtenPct = completedCount > 0 ? ((writtenCount / completedCount) * 100).toFixed(2) : '0.00';

	// Update completed events
	const completedElements = document.getElementsByClassName('completedEvents');
	for (let i = 0; i < completedElements.length; i++) {
		completedElements[i].innerText = completedCount;
	}

	const completedPctElements = document.getElementsByClassName('completedEventsPct');
	for (let i = 0; i < completedPctElements.length; i++) {
		completedPctElements[i].innerText = completedPct + '%';
	}

	// Update live events
	const liveElements = document.getElementsByClassName('liveEvents');
	for (let i = 0; i < liveElements.length; i++) {
		liveElements[i].innerText = liveCount;
	}

	const livePctElements = document.getElementsByClassName('liveEventsPct');
	for (let i = 0; i < livePctElements.length; i++) {
		livePctElements[i].innerText = livePct + '%';
	}

	// Update achievements
	const achievementElements = document.getElementsByClassName('achievements');
	for (let i = 0; i < achievementElements.length; i++) {
		achievementElements[i].innerText = achievementCount;
	}

	const achievementPctElements = document.getElementsByClassName('achievementsPct');
	for (let i = 0; i < achievementPctElements.length; i++) {
		achievementPctElements[i].innerText = achievementPct + '%';
	}

	// Update miscellaneous
	const miscElements = document.getElementsByClassName('miscellaneous');
	for (let i = 0; i < miscElements.length; i++) {
		miscElements[i].innerText = miscellaneousCount;
	}

	const miscPctElements = document.getElementsByClassName('miscellaneousPct');
	for (let i = 0; i < miscPctElements.length; i++) {
		miscPctElements[i].innerText = miscellaneousPct + '%';
	}

	// Update written tweets
	const writtenElements = document.getElementsByClassName('written');
	for (let i = 0; i < writtenElements.length; i++) {
		writtenElements[i].innerText = writtenCount;
	}

	const writtenPctElements = document.getElementsByClassName('writtenPct');
	for (let i = 0; i < writtenPctElements.length; i++) {
		writtenPctElements[i].innerText = writtenPct + '%';
	}

	// Update first and last dates
	if (tweet_array.length > 0) {
		const firstDate = tweet_array[tweet_array.length - 1].time;
		const lastDate = tweet_array[0].time;

		document.getElementById('firstDate').innerText = firstDate.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});

		document.getElementById('lastDate').innerText = lastDate.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});