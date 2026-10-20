import EmptyState from './EmptyState.jsx'
import LoadingState from './LoadingState.jsx'

function sameCity(a, b) {
  return a && b && a.latitude === b.latitude && a.longitude === b.longitude
}

export default function SavedCityList({
  cities,
  loading,
  selectedCity,
  onSelect,
  onRemove,
  isLoggedIn,
}) {
  if (loading) {
    return <LoadingState message="Loading your saved cities..." />
  }

  if (!isLoggedIn) {
    return (
      <EmptyState
        title="No saved cities yet"
        message="Log in or sign up to pin several cities and open them any time."
      />
    )
  }

  if (!cities.length) {
    return (
      <EmptyState
        title="Your city list is empty"
        message="Search for a city, then tap Save so it stays on Home."
      />
    )
  }

  return (
    <ul className="space-y-2">
      {cities.map((city) => {
        const active = sameCity(city, selectedCity)
        return (
          <li key={city.id || `${city.latitude}-${city.longitude}`}>
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                active
                  ? 'bg-sky-600 text-white'
                  : 'bg-white/50 dark:bg-slate-800/70'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(city)}
                className="flex-1 text-left"
              >
                {city.city_name}, {city.country}
              </button>
              <button
                type="button"
                onClick={() => onRemove(city)}
                className={`rounded-lg px-2 py-1 text-xs ${
                  active
                    ? 'bg-white/20'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-100'
                }`}
              >
                Remove
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
