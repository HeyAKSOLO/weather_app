import { useState } from 'react'
import ErrorMessage from './ErrorMessage.jsx'
import LoadingState from './LoadingState.jsx'
import { searchCities } from '../lib/weatherApi.js'

export default function CitySearch({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (query.trim().length < 2) {
      setError('Type at least 2 letters to search for a city.')
      return
    }

    setLoading(true)
    try {
      const cities = await searchCities(query)
      setResults(cities)
      if (cities.length === 0) {
        setError('No cities matched that name. Try another spelling.')
      }
    } catch (err) {
      setError(err.message || 'Search failed.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="glass-panel rounded-2xl p-4">
      <h2 className="mb-3 text-lg font-semibold">Find a city</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tokyo, Paris, New York..."
          className="w-full rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-sky-400 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
        />
        <button
          type="submit"
          className="rounded-xl bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-500"
        >
          Search
        </button>
      </form>
      <div className="mt-3 space-y-2">
        {error ? <ErrorMessage message={error} /> : null}
        {loading ? <LoadingState message="Searching cities..." /> : null}
        {!loading && results.length > 0 && (
          <ul className="space-y-2">
            {results.map((city) => (
              <li key={`${city.city_name}-${city.latitude}-${city.longitude}`}>
                <button
                  type="button"
                  onClick={() => onSelect(city)}
                  className="w-full rounded-xl bg-white/50 px-3 py-2 text-left hover:bg-white/80 dark:bg-slate-800/70 dark:hover:bg-slate-700"
                >
                  {city.city_name}, {city.country}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
