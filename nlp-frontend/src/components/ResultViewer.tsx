import { useState } from "react"
import { ScrapeResult } from "../App"
import "./ResultViewer.css"

const ResultViewer = ({ results }: { results: ScrapeResult[] }) => {

    const [refinedResults, setRefinedResults] = useState<ScrapeResult[]>(results);
    const [filter, setFilter] = useState<string>("");
    const [sortKey, setSortKey] = useState<"default" | "newest" | "oldest" | "compound" | "positive" | "negative" | "neutral">("default");

    const downloadResultsAsCsv = () => {
        const csv = refinedResults.map(result => {
            return `"${result.user}","${result.comment}",${result.posted},${result.compound_sentiment},${result.positive_sentiment},${result.negative_sentiment},${result.neutral_sentiment},${result.unsplit_compound_sentiment},${result.unsplit_positive_sentiment},${result.unsplit_negative_sentiment},${result.unsplit_neutral_sentiment}`
        }).join('\n');
        // Add headers
        const headers = 'User,Comment,Time Posted,Predicted Compound Sentiment,Predicted Positive Sentiment,Predicted Negative Sentiment,Predicted Neutral Sentiment, Unsplit Predicted Compound Sentiment, Unsplit Predicted Positive Sentiment, Unsplit Predicted Negative Sentiment, Unsplit Predicted Neutral Sentiment\n';
        const csvWithHeaders = headers + csv;
        const blob = new Blob([csvWithHeaders], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const csvFilterSuffix = filter === '' ? '' : `_filtered_${filter}`;
        const csvSortSuffix = sortKey === 'default' ? '' : `_sorted_${sortKey}`;
        const csvTimestampSuffix = new Date().toISOString().replace(/:/g, '-');
        const csvSuffix = `${csvFilterSuffix}${csvSortSuffix}_${csvTimestampSuffix}`;
        a.download = `results${csvSuffix}.csv`;
        a.click();
    }

    return (
        <div className="results-container">
            <div className="buttonContainer">
                <button onClick={() => window.location.reload()} className="new-search-button">New search</button>
                <button onClick={downloadResultsAsCsv} className="csv-download-button">Download as CSV</button>
            </div>
            <div className="searchbar-container">
                <label>Search results by keyword:</label>
                <input type="text" name="searchbar" placeholder="Search by keyword" className="searchbar" onChange={(e) => {
                    const keyword = e.target.value;
                    setFilter(keyword);
                    const newResults = results.filter(result => result.comment.includes(keyword));
                    setRefinedResults(newResults);
                }
                } />
                <label>Sort by:</label>
                <select name="sort" className="sort" onChange={(e) => {
                    const sortType = e.target.value;
                    let newResults = [...refinedResults];
                    switch (sortType) {
                        case 'default':
                            newResults = results;
                            setSortKey('default');
                            break;
                        case 'newest':
                            newResults = newResults.sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime());
                            setSortKey('newest');
                            break;
                        case 'oldest':
                            newResults = newResults.sort((a, b) => new Date(a.posted).getTime() - new Date(b.posted).getTime());
                            setSortKey('oldest');
                            break;
                        case 'compound-des':
                            newResults = newResults.sort((a, b) => b.compound_sentiment - a.compound_sentiment);
                            setSortKey('compound');
                            break;
                        case 'compound-asc':
                            newResults = newResults.sort((a, b) => a.compound_sentiment - b.compound_sentiment);
                            setSortKey('compound');
                            break;
                        case 'positive-des':
                            newResults = newResults.sort((a, b) => b.positive_sentiment - a.positive_sentiment);
                            setSortKey('positive');
                            break;
                        case 'positive-asc':
                            newResults = newResults.sort((a, b) => a.positive_sentiment - b.positive_sentiment);
                            setSortKey('positive');
                            break;
                        case 'negative-des':
                            newResults = newResults.sort((a, b) => b.negative_sentiment - a.negative_sentiment);
                            setSortKey('negative');
                            break;
                        case 'negative-asc':
                            newResults = newResults.sort((a, b) => a.negative_sentiment - b.negative_sentiment);
                            setSortKey('negative');
                            break;
                        case 'neutral-des':
                            newResults = newResults.sort((a, b) => b.neutral_sentiment - a.neutral_sentiment);
                            setSortKey('neutral');
                            break;
                        case 'neutral-asc':
                            newResults = newResults.sort((a, b) => a.neutral_sentiment - b.neutral_sentiment);
                            setSortKey('neutral');
                            break;
                        default:
                            break;
                    }
                    setRefinedResults(newResults);
                } }>
                    <option value="default">Default</option>
                    <option value="newest">Time Posted (Descending)</option>
                    <option value="oldest">Time Posted (Ascending)</option>
                    <option value="compound-des">Compound Sentiment (Descending)</option>
                    <option value="compound-asc">Compound Sentiment (Ascending)</option>
                    <option value="positive-des">Positive Sentiment (Descending)</option>
                    <option value="positive-asc">Positive Sentiment (Ascending)</option>
                    <option value="negative-des">Negative Sentiment (Descending)</option>
                    <option value="negative-asc">Negative Sentiment (Ascending)</option>
                    <option value="neutral-des">Neutral Sentiment (Descending)</option>
                    <option value="neutral-asc">Neutral Sentiment (Ascending)</option>
                </select>
            </div>
        {refinedResults.map((result, i) => (
            <div key={i} className="result">
            <h3>User: {result.user}</h3>
            <p>Comment: {result.comment}</p>
            <p>Time Posted: {result.posted}</p>
            <p>Predicted Compound Sentiment: {result.compound_sentiment}</p>
            <p>Predicted Positive Sentiment: {result.positive_sentiment}</p>
            <p>Predicted Negative Sentiment: {result.negative_sentiment}</p>
            <p>Predicted Neutral Sentiment: {result.neutral_sentiment}</p>
            <p>Unsplit Predicted Compound Sentiment: {result.unsplit_compound_sentiment}</p>
            <p>Unsplit Predicted Positive Sentiment: {result.unsplit_positive_sentiment}</p>
            <p>Unsplit Predicted Negative Sentiment: {result.unsplit_negative_sentiment}</p>
            <p>Unsplit Predicted Neutral Sentiment: {result.unsplit_neutral_sentiment}</p>
            </div>
        ))}
        </div>
    )
}

export default ResultViewer;
