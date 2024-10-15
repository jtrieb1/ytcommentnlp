import { useState } from 'react'
import ResultViewer from './components/ResultViewer'
import './App.css'

export type ScrapeResult = {
  user: string,
  comment: string,
  posted: string,
  compound_sentiment: number,
  positive_sentiment: number,
  negative_sentiment: number,
  neutral_sentiment: number,
}

function App() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ScrapeResult[]>([])

  const fetchResults = async (ytUrl: string, ytCount: number) => {
    const jsonPayload = JSON.stringify({ ytUrl, ytCount })
    setLoading(true);
    const response = await fetch('http://localhost:5000/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jsonPayload
    });
    const data = await response.json();
    setResults(data);
    setLoading(false);
  }

  return (
    <>
      {
        results.length === 0 && !loading ? (
          <form onSubmit={
            e => {
              e.preventDefault();
              const ytUrl = e.currentTarget.ytUrl.value
              const ytCount = parseInt(e.currentTarget.ytCount.value)
              fetchResults(ytUrl, ytCount);
            }
          }
          className='form'
          >
            <input type="text" name='ytUrl' placeholder="YouTube URL" className='form-textinput' />
            <br />
            <input type="number" name="ytCount" placeholder="Number of comments" className='form-textinput' />
            <br />
            <button type="submit" className='submit-button'>Fetch results</button>
          </form>
          
        ) : !loading ? (
          <ResultViewer results={results} />
        ) : (
          <div className='loading'>Loading...</div>
        )
      }
    </>
  )
}

export default App
