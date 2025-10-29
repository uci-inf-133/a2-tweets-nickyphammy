// Global variable to store written tweets
let writtenTweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	// Create Tweet objects and filter to only written tweets
	let tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// Filter to only include written tweets
	writtenTweets = tweet_array.filter(function(tweet) {
		return tweet.written;
	});
}

function updateTable(searchText) {
	// Get the table body element
	const tableBody = document.getElementById('tweetTable');

	// Clear the table
	tableBody.innerHTML = '';

	// If search text is empty, clear the table and update counts
	if (searchText === '') {
		document.getElementById('searchCount').innerText = '0';
		document.getElementById('searchText').innerText = '';
		return;
	}

	// Filter tweets that contain the search text (case-insensitive)
	const searchLower = searchText.toLowerCase();
	const filteredTweets = writtenTweets.filter(function(tweet) {
		return tweet.text.toLowerCase().includes(searchLower);
	});

	// Update the search count and text
	document.getElementById('searchCount').innerText = filteredTweets.length;
	document.getElementById('searchText').innerText = searchText;

	// Build all rows at once, then add to table (much more efficient than += in loop)
	let allRowsHtml = '';
	filteredTweets.forEach(function(tweet, index) {
		const rowHtml = tweet.getHTMLTableRow(index + 1);
		allRowsHtml += rowHtml;
	});
	tableBody.innerHTML = allRowsHtml;
}

function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	const searchBox = document.getElementById('textFilter');

	// Add event listener for input events (fires on every character change)
	searchBox.addEventListener('input', function(event) {
		const searchText = event.target.value;
		updateTable(searchText);
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});