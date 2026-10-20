import { describeWeather } from '../lib/weatherCodes.js'

export default function WeatherCard({ city, forecast, onSave, canSave, alreadySaved }) {
  const info = describeWeather(forecast.current.weatherCode)

  return (
    <section className="glass-panel rounded-3xl p-5">
      <p className="text-sm uppercase tracking-wide text-sky-800 dark:text-sky-200">Now</p>
      <h2 className="mt-1 text-3xl font-semibold">
        {city.city_name}, {city.country}
      </h2>
      <p className="mt-2 text-6xl font-light">{Math.round(forecast.current.temperature)}°</p>
      <p className="mt-1 text-lg">{info.label}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Feels like {Math.round(forecast.current.feelsLike)}°
      </p>

      {canSave && !alreadySaved ? (
        <button
          type="button"
          onClick={onSave}
          className="mt-4 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          Save this city
        </button>
      ) : null}

      {alreadySaved ? (
        <p className="mt-4 text-sm text-sky-800 dark:text-sky-200">Saved on your Home list.</p>
      ) : null}
    </section>
  )
}
