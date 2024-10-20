from flask import Flask, request
from flask_cors import CORS
from youtube_comment_downloader import *
from itertools import islice
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk import tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import pandas as pd
from datetime import datetime, timedelta
import emot

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

def cleanEmoji(text):
    def cleanSymbols(text):
        return text.replace('_', ' ').replace('-', ' ').replace(':', ' ')

    for emoti in emot.emo_unicode.EMOJI_UNICODE:
        text = text.replace(emoti, cleanSymbols(emot.emo_unicode.EMOJI_UNICODE.get(emoti, '')))
    for emoti in emot.emo_unicode.UNICODE_EMOJI:
        text = text.replace(emoti, cleanSymbols(emot.emo_unicode.UNICODE_EMOJI.get(emoti, '')))
    for emoti in emot.emo_unicode.EMOTICONS_EMO:
        text = text.replace(emoti, cleanSymbols(emot.emo_unicode.EMOTICONS_EMO.get(emoti, '')))

    return text

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

        scores = {
            "unsplit-compound": 0,
            "unsplit-positive": 0,
            "unsplit-negative": 0,
            "unsplit-neutral": 0,
            "compound": 0,
            "positive": 0,
            "negative": 0,
            "neutral": 0
        }

        sentences = tokenize.sent_tokenize(comment["text"])
        for sentence in sentences:
            # Clean emoji for better parsing
            sentence = cleanEmoji(sentence)

            ss = sid.polarity_scores(sentence) # Get unsplit scores
            scores["unsplit-compound"] += ss["compound"]
            scores["unsplit-positive"] += ss["pos"]
            scores["unsplit-negative"] += ss["neg"]
            scores["unsplit-neutral"] += ss["neu"]

            tokens = tokenize.word_tokenize(sentence)
            tokens = [t.lower() for t in tokens]
            filtered_tokens = [t for t in tokens if t not in stopwords.words('english')]
            lemmatizer = WordNetLemmatizer()
            lemmatized_tokens = [lemmatizer.lemmatize(t) for t in filtered_tokens]
            processed = " ".join(lemmatized_tokens)

            ss = sid.polarity_scores(processed)
            scores["compound"] += ss["compound"]
            scores["positive"] += ss["pos"]
            scores["negative"] += ss["neg"]
            scores["neutral"] += ss["neu"]

        # Normalize scores
        scores["unsplit-compound"] /= len(sentences)
        scores["unsplit-positive"] /= len(sentences)
        scores["unsplit-negative"] /= len(sentences)
        scores["unsplit-neutral"] /= len(sentences)
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
            "neutral_sentiment": scores["neutral"],
            "unsplit_compound_sentiment": scores["unsplit-compound"],
            "unsplit_positive_sentiment": scores["unsplit-positive"],
            "unsplit_negative_sentiment": scores["unsplit-negative"],
            "unsplit_neutral_sentiment": scores["unsplit-neutral"]
        })

    df = pd.DataFrame(dfdict)

    return df.to_json(orient='records'), 200

if __name__ == '__main__':
    pass
