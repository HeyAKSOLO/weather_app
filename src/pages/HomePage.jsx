import { useCallback, useEffect, useMemo, useState } from 'react'
import CitySearch from '../components/CitySearch.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import ForecastDetails from '../components/ForecastDetails.jsx'
import LoadingState from '../components/LoadingState.jsx'
import SavedCityList from '../components/SavedCityList.jsx'
import WeatherBackground from '../components/WeatherBackground.jsx'
import WeatherCard from '../components/WeatherCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { fetchForecast } from '../lib/weatherApi.js'
import { DEFAULT_CITY, describeWeather } from '../lib/weatherCodes.js'

function samePlace(a, b) {
  return Boolean(a && b && a.latitude === b.latitude && a.longitude === b.longitude)
}

export default function HomePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [savedCities, setSavedCities] = useState([])
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY)
  const [forecast, setForecast] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')

  const loadSavedCities = useCallback(async () => {
    if (!user) {
      setSavedCities([])
      return []
    }

    setCitiesLoading(true)
    const { data, error: loadError } = await supabase
      .from('saved_cities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    setCitiesLoading(false)

    if (loadError) {
      setError(loadError.message)
      return []
    }

    setSavedCities(data || [])
    return data || []
  }, [user])

  useEffect(() => {
    let ignore = false

    async function start() {
      const cities = await loadSavedCities()
      if (ignore) return

      if (profile?.last_selected_city_id) {
        const remembered = cities.find((city) => city.id === profile.last_selected_city_id)
        setSelectedCity(remembered || cities[0] || DEFAULT_CITY)
      } else if (cities[0]) {
        setSelectedCity(cities[0])
      } else {
        setSelectedCity(DEFAULT_CITY)
      }
    }

    start()
    return () => {
      ignore = true
    }
  }, [loadSavedCities, profile?.last_selected_city_id])

  useEffect(() => {
    let ignore = false

    async function loadWeather() {
      setWeatherLoading(true)
      setError('')
      try {
        const data = await fetchForecast(selectedCity.latitude, selectedCity.longitude)
        if (!ignore) setForecast(data)
      } catch (err) {
        if (!ignore) {
          setForecast(null)
          setError(err.message || 'Could not load weather.')
        }
      } finally {
        if (!ignore) setWeatherLoading(false)
      }
    }

    loadWeather()
    return () => {
      ignore = true
    }
  }, [selectedCity])

  async function rememberSelection(city) {
    setSelectedCity(city)
    if (user && city.id) {
      await supabase
        .from('profiles')
        .update({ last_selected_city_id: city.id })
        .eq('id', user.id)
      refreshProfile()
    }
  }

  async function handleSaveCity() {
    if (!user) return
    setSaveError('')

    const { error: insertError } = await supabase.from('saved_cities').insert({
      user_id: user.id,
      city_name: selectedCity.city_name,
      country: selectedCity.country,
      latitude: selectedCity.latitude,
      longitude: selectedCity.longitude,
    })

    if (insertError) {
      setSaveError(
        insertError.code === '23505'
          ? 'That city is already on your list.'
          : insertError.message,
      )
      return
    }

    const cities = await loadSavedCities()
    const saved = cities.find((city) => samePlace(city, selectedCity))
    if (saved) rememberSelection(saved)
  }

  async function handleRemoveCity(city) {
    if (!user || !city.id) return
    const { error: deleteError } = await supabase.from('saved_cities').delete().eq('id', city.id)
    if (deleteError) {
      setSaveError(deleteError.message)
      return
    }

    const cities = await loadSavedCities()
    if (samePlace(city, selectedCity)) {
      setSelectedCity(cities[0] || DEFAULT_CITY)
    }
  }

  const alreadySaved = useMemo(
    () => savedCities.some((city) => samePlace(city, selectedCity)),
    [savedCities, selectedCity],
  )

  const weatherGroup = forecast
    ? describeWeather(forecast.current.weatherCode).group
    : 'clear'

  return (
    <div className="space-y-5">
      <WeatherBackground group={weatherGroup} />

      <section className="glass-panel rounded-3xl p-5">
        <p className="text-sm uppercase tracking-wide text-sky-800 dark:text-sky-200">Welcome</p>
        <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
          See the weather in cities around the world
        </h1>
        <p className="mt-2 max-w-2xl text-slate-700 dark:text-slate-300">
          Osaka, Japan is shown first. Search any city for humidity, rain, wind, and a 7-day
          forecast. Sign in to keep several cities on this page.
        </p>
      </section>

      <CitySearch onSelect={(city) => rememberSelection(city)} />

      <section className="glass-panel rounded-3xl p-4">
        <h2 className="mb-3 text-lg font-semibold">Your cities</h2>
        <SavedCityList
          cities={savedCities}
          loading={citiesLoading}
          selectedCity={selectedCity}
          onSelect={rememberSelection}
          onRemove={handleRemoveCity}
          isLoggedIn={Boolean(user)}
        />
        {saveError ? <div className="mt-3"><ErrorMessage message={saveError} /></div> : null}
      </section>

      {error ? <ErrorMessage message={error} /> : null}
      {weatherLoading ? <LoadingState message="Loading the forecast..." /> : null}

      {!weatherLoading && forecast ? (
        <>
          <WeatherCard
            city={selectedCity}
            forecast={forecast}
            canSave={Boolean(user)}
            alreadySaved={alreadySaved}
            onSave={handleSaveCity}
          />
          <ForecastDetails forecast={forecast} />
        </>
      ) : null}
    </div>
  )
}
