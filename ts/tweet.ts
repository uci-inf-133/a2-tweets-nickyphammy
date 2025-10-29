class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        // Live event: "Watch my run right now with @Runkeeper Live"
        if (this.text.includes("right now") && this.text.includes("Live")) {
            return "live_event";
        }
        // Achievement: "Achieved a new personal record with #Runkeeper"
        if (this.text.includes("Achieved") || this.text.includes("achievement")) {
            return "achievement";
        }
        // Completed event: "Just completed a ..." or "Just posted a ..."
        if (this.text.includes("Just completed") || this.text.includes("Just posted")) {
            return "completed_event";
        }
        // Everything else is miscellaneous
        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written

        if (this.source !== 'completed_event') {
            return false;
        }

        // Check if there's a dash followed by custom text (not just "with @Runkeeper")
        const dashIndex = this.text.indexOf(' - ');
        if (dashIndex !== -1) {
            return true;
        }

        return false;
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        //TODO: parse the written text from the tweet
        const dashIndex = this.text.indexOf(' - ');
        if (dashIndex !== -1) {
            const afterDash = this.text.substring(dashIndex + 3);
            const urlMatch = afterDash.match(/https?:\/\/\S+/);
            if (urlMatch) {
                return afterDash.substring(0, afterDash.indexOf(urlMatch[0])).trim();
            }
            return afterDash.trim();
        }
        return "";
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        const activityPattern = /(?:completed|posted) a (?:[\d.]+\s+(?:km|mi)\s+)?(\w+)/i;
        const match = this.text.match(activityPattern);
        if (match && match[1]) {
            return match[1].toLowerCase();
        }
        return "unknown";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        const distancePattern = /([\d.]+)\s+(km|mi)/i;
        const match = this.text.match(distancePattern);
        if (match && match[1]) {
            const distance = parseFloat(match[1]);
            const unit = match[2].toLowerCase();
            if (unit === 'km') {
                return distance / 1.609;
            }
            return distance;
        }
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        const urlMatch = this.text.match(/https?:\/\/\S+/);
        const activityStr = this.activityType !== 'unknown' ? this.activityType : 'activity';

        // Parse the tweet text and make links clickable
        let tweetHtml = this.text;
        if (urlMatch) {
            // Replace URLs with clickable links
            tweetHtml = this.text.replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank">$1</a>');
        }

        return `<tr>
            <td>${rowNumber}</td>
            <td>${activityStr}</td>
            <td>${tweetHtml}</td>
        </tr>`;
    }
}