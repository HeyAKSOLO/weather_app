const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

/**
 * Rounding keeps saved coordinates stable so the unique (lat, lon) database
 * rule does not fail when the same city is searched twice.
 */
export function roundCoord(value) {
  return Math.round(Number(value) * 10000) / 10000
}

export async function searchCities(query) {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const url = new URL(GEOCODE_URL)
  url.searchParams.set('name', trimmed)
  url.searchParams.set('count', '6')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Could not search cities right now. Please try again.')
  }

  const data = await response.json()
  if (!data.results) return []

  return data.results.map((place) => ({
    city_name: place.name,
    country: place.country || 'Unknown',
    latitude: roundCoord(place.latitude),
    longitude: roundCoord(place.longitude),
  }))
}

export async function fetchForecast(latitude, longitude) {
  const url = new URL(FORECAST_URL)
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,cloud_cover',
  )
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
  )
  url.searchParams.set('timezone', 'auto')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Could not load the forecast. Please try again.')
  }

  const data = await response.json()
  if (!data.current || !data.daily) {
    throw new Error('The weather service sent an unexpected answer.')
  }

  const days = data.daily.time.map((date, index) => ({
    date,
    weatherCode: data.daily.weather_code[index],
    tempMax: data.daily.temperature_2m_max[index],
    tempMin: data.daily.temperature_2m_min[index],
    precipitation: data.daily.precipitation_sum[index],
    precipProbability: data.daily.precipitation_probability_max[index],
    windMax: data.daily.wind_speed_10m_max[index],
  }))

  return {
    current: {
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      windSpeed: data.current.wind_speed_10m,
      cloudCover: data.current.cloud_cover,
      weatherCode: data.current.weather_code,
    },
    daily: days,
    units: data.current_units,
  }
}
