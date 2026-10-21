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

## Password recovery

Forgot password uses Supabase's standard reset-link flow. The app redirects to `${VITE_APP_URL}/login?recovery=1`; when `VITE_APP_URL` is unset it uses the current browser origin, so deployed requests use the deployed domain rather than localhost. Set `VITE_APP_URL` in the Vercel production environment to the app's canonical deployed URL, then redeploy. `vercel.json` rewrites app routes to the Vite entry point so `/login` works when opened directly from an email.

In the Supabase dashboard, open **Authentication → URL Configuration**:

- Set **Site URL** to the canonical Vercel production URL.
- Add `https://<your-vercel-domain>/login?recovery=1` to **Redirect URLs**. Replace the placeholder with the actual deployment domain. If you use a custom domain, add its matching URL too. Add `http://localhost:5173/login?recovery=1` only for local development.

Under **Authentication → Email Templates → Reset Password**, use the standard reset link with `{{ .ConfirmationURL }}` (for example, `<a href="{{ .ConfirmationURL }}">Reset password</a>`). Do not use `{{ .Token }}`: this app expects the link callback and does not present an OTP form. Configure SMTP with a verified sender under **Project Settings → Authentication → SMTP Settings** if Supabase's default sender does not reliably deliver email.
