# Weather App

A React + Vite weather app. Guests see Osaka, Japan. Signed-in users can save several cities. Forecasts come from Open-Meteo. Accounts and saved cities live in Supabase.

**Full beginner setup (Homebrew, Node, Supabase, testing):** see [SETUP.md](SETUP.md).

## Quick start (if tools are already installed)

```bash
npm install
cp .env.example .env
# paste VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY into .env
# run supabase-schema.sql in the Supabase SQL Editor
npm run dev
```

Open `http://localhost:5173`.
