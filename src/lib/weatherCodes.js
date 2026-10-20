/**
 * Open-Meteo weather codes: https://open-meteo.com/en/docs
 * We map each code to a simple animation group used by WeatherBackground.
 */
export function describeWeather(code) {
  const groups = {
    clear: { label: 'Clear sky', group: 'clear' },
    clouds: { label: 'Cloudy', group: 'clouds' },
    fog: { label: 'Foggy', group: 'clouds' },
    drizzle: { label: 'Drizzle', group: 'rain' },
    rain: { label: 'Rain', group: 'rain' },
    snow: { label: 'Snow', group: 'snow' },
    storm: { label: 'Thunderstorm', group: 'storm' },
  }

  if (code === 0) return { ...groups.clear, label: 'Clear sky' }
  if (code === 1) return { ...groups.clear, label: 'Mostly clear' }
  if (code === 2) return { ...groups.clouds, label: 'Partly cloudy' }
  if (code === 3) return { ...groups.clouds, label: 'Overcast' }
  if (code === 45 || code === 48) return groups.fog
  if (code >= 51 && code <= 57) return groups.drizzle
  if (code >= 61 && code <= 67) return groups.rain
  if (code >= 71 && code <= 77) return groups.snow
  if (code >= 80 && code <= 82) return { ...groups.rain, label: 'Rain showers' }
  if (code >= 85 && code <= 86) return { ...groups.snow, label: 'Snow showers' }
  if (code >= 95 && code <= 99) return groups.storm

  return { label: 'Unknown', group: 'clouds' }
}

export const DEFAULT_CITY = {
  city_name: 'Osaka',
  country: 'Japan',
  latitude: 34.6937,
  longitude: 135.5023,
}
