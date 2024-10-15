from flask import Flask, request
from flask_cors import CORS
from youtube_comment_downloader import *
from itertools import islice
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk import tokenize
import pandas as pd
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

def parseTime(time, time_parsed):
    dt = datetime.utcfromtimestamp(int(time_parsed))
    # time is a string that looks like "<x> minutes ago", "<x> hours ago", "<x> days ago"
    if "minute" in time:
        return dt - timedelta(minutes=int(time.split(" ")[0]))
    elif "hour" in time:
        return dt - timedelta(hours=int(time.split(" ")[0]))
    elif "day" in time:
        return dt - timedelta(days=int(time.split(" ")[0]))
    else:
        return dt

@app.post('/scrape')
def scrape():

    # Validate input
    if 'ytUrl' not in request.json:
        return 'Error: Missing ytUrl parameter', 400
    if 'ytCount' not in request.json:
        return 'Error: Missing ytCount parameter', 400

    downloader = YoutubeCommentDownloader()
    ytUrl = request.json['ytUrl']
    comments = downloader.get_comments_from_url(ytUrl)
    sid = SentimentIntensityAnalyzer()
    dfdict = []
    for comment in islice(comments, request.json['ytCount']):
        sentences = tokenize.sent_tokenize(comment["text"])
        scores = {
            "compound": 0,
            "positive": 0,
            "negative": 0,
            "neutral": 0
        }
        for sentence in sentences:
            ss = sid.polarity_scores(sentence)
            scores["compound"] += ss["compound"]
            scores["positive"] += ss["pos"]
            scores["negative"] += ss["neg"]
            scores["neutral"] += ss["neu"]
        
        # Normalize scores
        scores["compound"] /= len(sentences)
        scores["positive"] /= len(sentences)
        scores["negative"] /= len(sentences)
        scores["neutral"] /= len(sentences)

        dfdict.append({
            "user": comment["author"], 
            "comment": comment["text"],
            "posted": parseTime(comment["time"], comment["time_parsed"]).strftime('%Y-%m-%d %H:%M'), 
            "compound_sentiment": scores["compound"], 
            "negative_sentiment": scores["negative"],
            "positive_sentiment": scores["positive"],
            "neutral_sentiment": scores["neutral"]
        })
    
    df = pd.DataFrame(dfdict)
    
    return df.to_json(orient='records'), 200

if __name__ == '__main__':
    pass