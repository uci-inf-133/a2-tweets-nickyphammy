function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// Count activities by type
	const activityCounts = {};
	const completedTweets = tweet_array.filter(tweet => tweet.source === 'completed_event');

	completedTweets.forEach(function(tweet) {
		const activity = tweet.activityType;
		if (activity !== 'unknown') {
			activityCounts[activity] = (activityCounts[activity] || 0) + 1;
		}
	});

	// Convert to array and sort by count
	const activityArray = Object.keys(activityCounts).map(key => ({
		activity: key,
		count: activityCounts[key]
	})).sort((a, b) => b.count - a.count);

	// Update spans with top 3 activities
	document.getElementById('numberActivities').innerText = activityArray.length;
	if (activityArray.length >= 3) {
		document.getElementById('firstMost').innerText = activityArray[0].activity;
		document.getElementById('secondMost').innerText = activityArray[1].activity;
		document.getElementById('thirdMost').innerText = activityArray[2].activity;
	}

	// Create visualization 1: Activity type counts
	activity_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "A graph of the number of Tweets containing each type of activity.",
		"data": {
			"values": activityArray
		},
		"mark": "bar",
		"encoding": {
			"x": {
				"field": "activity",
				"type": "nominal",
				"title": "Activity Type",
				"sort": "-y"
			},
			"y": {
				"field": "count",
				"type": "quantitative",
				"title": "Number of Tweets"
			}
		}
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	// Get top 3 activities
	const top3Activities = activityArray.slice(0, 3).map(a => a.activity);

	// Create data for distance visualizations (top 3 activities only)
	const distanceData = [];
	completedTweets.forEach(function(tweet) {
		if (top3Activities.includes(tweet.activityType) && tweet.distance > 0) {
			const dayOfWeek = tweet.time.toLocaleDateString('en-US', { weekday: 'long' });
			distanceData.push({
				activity: tweet.activityType,
				distance: tweet.distance,
				day: dayOfWeek
			});
		}
	});

	// Calculate statistics for longest/shortest and weekday/weekend
	const activityStats = {};
	top3Activities.forEach(activity => {
		const distances = distanceData.filter(d => d.activity === activity).map(d => d.distance);
		if (distances.length > 0) {
			const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
			activityStats[activity] = avg;
		}
	});

	// Find longest and shortest activities
	const sortedActivities = Object.entries(activityStats).sort((a, b) => b[1] - a[1]);
	if (sortedActivities.length >= 2) {
		document.getElementById('longestActivityType').innerText = sortedActivities[0][0];
		document.getElementById('shortestActivityType').innerText = sortedActivities[sortedActivities.length - 1][0];
	}

	// Calculate weekday vs weekend averages
	const weekendDays = ['Saturday', 'Sunday'];
	const weekdayDistances = distanceData.filter(d => !weekendDays.includes(d.day)).map(d => d.distance);
	const weekendDistances = distanceData.filter(d => weekendDays.includes(d.day)).map(d => d.distance);

	const weekdayAvg = weekdayDistances.length > 0 ? weekdayDistances.reduce((a, b) => a + b, 0) / weekdayDistances.length : 0;
	const weekendAvg = weekendDistances.length > 0 ? weekendDistances.reduce((a, b) => a + b, 0) / weekendDistances.length : 0;

	document.getElementById('weekdayOrWeekendLonger').innerText = weekdayAvg > weekendAvg ? 'weekdays' : 'weekends';

	// Visualization 2: Distance by day of week (scatter plot)
	const distance_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Distance by day of week for top 3 activities",
		"data": {
			"values": distanceData
		},
		"mark": "point",
		"encoding": {
			"x": {
				"field": "day",
				"type": "nominal",
				"title": "Day of Week",
				"sort": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
			},
			"y": {
				"field": "distance",
				"type": "quantitative",
				"title": "Distance (miles)"
			},
			"color": {
				"field": "activity",
				"type": "nominal",
				"title": "Activity Type"
			}
		}
	};
	vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});

	// Visualization 3: Distance by day of week (aggregated mean)
	const distance_vis_aggregated_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Average distance by day of week for top 3 activities",
		"data": {
			"values": distanceData
		},
		"mark": "bar",
		"encoding": {
			"x": {
				"field": "day",
				"type": "nominal",
				"title": "Day of Week",
				"sort": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
			},
			"y": {
				"aggregate": "mean",
				"field": "distance",
				"type": "quantitative",
				"title": "Average Distance (miles)"
			},
			"color": {
				"field": "activity",
				"type": "nominal",
				"title": "Activity Type"
			},
			"xOffset": {"field": "activity"}
		}
	};
	vegaEmbed('#distanceVisAggregated', distance_vis_aggregated_spec, {actions:false});

	// Initially hide the aggregated visualization
	document.getElementById('distanceVisAggregated').style.display = 'none';

	// Toggle button functionality
	let showingAggregated = false;
	document.getElementById('aggregate').addEventListener('click', function() {
		showingAggregated = !showingAggregated;
		if (showingAggregated) {
			document.getElementById('distanceVis').style.display = 'none';
			document.getElementById('distanceVisAggregated').style.display = 'block';
			this.innerText = 'Show all activities';
		} else {
			document.getElementById('distanceVis').style.display = 'block';
			document.getElementById('distanceVisAggregated').style.display = 'none';
			this.innerText = 'Show means';
		}
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
