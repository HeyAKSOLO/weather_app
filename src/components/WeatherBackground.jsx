function Drops({ kind, count }) {
  const items = Array.from({ length: count }, (_, index) => {
    const left = `${(index * 17) % 100}%`
    const delay = `${(index % 8) * 0.18}s`
    const duration = kind === 'snow' ? `${5 + (index % 4)}s` : `${0.8 + (index % 5) * 0.15}s`

    if (kind === 'snow') {
      return (
        <span
          key={index}
          className="snow-flake pointer-events-none absolute top-[-12px] h-2 w-2 rounded-full bg-white/90"
          style={{ left, animationDelay: delay, animationDuration: duration }}
        />
      )
    }

    return (
      <span
        key={index}
        className="rain-drop pointer-events-none absolute top-[-16px] h-8 w-px bg-sky-100/80"
        style={{ left, animationDelay: delay, animationDuration: duration }}
      />
    )
  })

  return items
}

export default function WeatherBackground({ group = 'clear' }) {
  const skies = {
    clear: 'from-sky-300 via-blue-400 to-indigo-500 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-950',
    clouds: 'from-slate-300 via-slate-400 to-slate-600 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950',
    rain: 'from-slate-500 via-blue-800 to-slate-900',
    snow: 'from-slate-200 via-sky-200 to-slate-400 dark:from-slate-700 dark:via-slate-800 dark:to-slate-950',
    storm: 'from-slate-700 via-indigo-950 to-black',
  }

  return (
    <div className={`pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b ${skies[group] || skies.clear}`}>
      {(group === 'clear' || group === 'clouds') && (
        <>
          <div className="sun-glow absolute right-[12%] top-16 h-28 w-28 rounded-full bg-amber-200/80 blur-sm dark:bg-amber-300/40" />
          <div
            className="cloud-piece absolute top-24 h-16 w-40 rounded-full bg-white/50 blur-[1px] dark:bg-white/15"
            style={{ animationDuration: '32s' }}
          />
          <div
            className="cloud-piece absolute top-40 h-12 w-28 rounded-full bg-white/40 dark:bg-white/10"
            style={{ animationDuration: '24s', animationDelay: '-8s' }}
          />
        </>
      )}

      {group === 'rain' && <Drops kind="rain" count={28} />}
      {group === 'snow' && <Drops kind="snow" count={22} />}

      {group === 'storm' && (
        <>
          <Drops kind="rain" count={32} />
          <div className="storm-flash absolute inset-0 bg-white" />
        </>
      )}
    </div>
  )
}
