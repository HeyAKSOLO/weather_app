import { describeWeather } from '../lib/weatherCodes.js'

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/40 px-3 py-3 dark:bg-slate-800/60">
      <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">{label}</p>
      <p className="mt-1 text-lg font-medium">{value}</p>
    </div>
  )
}

function formatDay(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function ForecastDetails({ forecast }) {
  const { current, daily } = forecast

  return (
    <section className="space-y-4">
      <div className="glass-panel grid grid-cols-2 gap-3 rounded-3xl p-4 sm:grid-cols-4">
        <Stat label="Humidity" value={`${current.humidity}%`} />
        <Stat label="Precipitation" value={`${current.precipitation} mm`} />
        <Stat label="Wind speed" value={`${current.windSpeed} km/h`} />
        <Stat label="Cloud cover" value={`${current.cloudCover}%`} />
      </div>

      <div className="glass-panel rounded-3xl p-4">
        <h3 className="mb-3 text-lg font-semibold">7-day forecast</h3>
        <ul className="space-y-2">
          {daily.map((day) => {
            const info = describeWeather(day.weatherCode)
            return (
              <li
                key={day.date}
                className="grid grid-cols-2 gap-2 rounded-xl bg-white/40 px-3 py-2 text-sm sm:grid-cols-5 dark:bg-slate-800/60"
              >
                <span className="font-medium">{formatDay(day.date)}</span>
                <span>{info.label}</span>
                <span>
                  {Math.round(day.tempMax)}° / {Math.round(day.tempMin)}°
                </span>
                <span>Rain {day.precipitation} mm</span>
                <span>Wind {Math.round(day.windMax)} km/h</span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
