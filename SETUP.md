# Weather App setup (read this like a school lab)

This guide is written for a beginner. Follow the boxes in order. Do not skip a step.

You will install tools on a Mac with Homebrew, then create a free online database, then start the app on your computer.

---

## What you will install

| Tool | What it is |
| --- | --- |
| Homebrew | A helper that installs other programs on a Mac |
| Git | Saves versions of your code (often already installed) |
| Node.js | Lets your computer run the React app. It also gives you `npm`, which installs project libraries |

You do **not** install a weather key. Weather comes from Open-Meteo for free.

---

## Step 1 — Open Terminal

1. Click the magnifying glass (Spotlight) on the top right of the Mac.
2. Type `Terminal`.
3. Press Return.

A window with text appears. That is Terminal. You will type commands there.

---

## Step 2 — Install Homebrew (if you do not have it)

In Terminal, type this and press Return:

```bash
brew --version
```

- If you see a version number, Homebrew is ready. Skip to Step 3.
- If you see `command not found`, install Homebrew.

To install Homebrew, paste this **one long line** and press Return:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

The Mac may ask for your password. Type it (you will not see dots) and press Return.

When it finishes, Apple Silicon Macs (M1/M2/M3/M4) usually need two more lines. Paste them one at a time:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Check again:

```bash
brew --version
```

---

## Step 3 — Install Git and Node with Homebrew

Paste these commands one at a time. Press Return after each.

```bash
brew install git
```

```bash
brew install node
```

Check that they work:

```bash
git --version
node --version
npm --version
```

You should see three version numbers. Node 20 or newer is good.

---

## Step 4 — Go to this project folder

In Terminal:

```bash
cd /Users/heyak/PROJECT_HACKTOBER
```

If your folder is somewhere else, drag the folder onto the Terminal window after typing `cd ` (with a space).

Check you are in the right place:

```bash
ls
```

You should see `package.json` and `src`.

---

## Step 5 — Install the app libraries

This project already lists the libraries it needs. Install them:

```bash
npm install
```

Wait until it finishes. You only do this when libraries change.

The important libraries are:

- React + Vite (the website)
- Tailwind CSS (colors and layout)
- React Router (pages)
- Supabase (login and saved cities)

---

## Step 6 — Create a free Supabase project (the database)

1. Open a web browser.
2. Go to [https://supabase.com](https://supabase.com).
3. Click **Start your project** and sign in with GitHub or email.
4. Click **New project**.
5. Fill in:
   - **Name:** `weather-app`
   - **Database password:** invent a long password and write it in a notebook. You will not paste this password into the React app.
   - **Region:** pick one close to you.
6. Click **Create new project**. Wait 1–2 minutes until it is ready.

---

## Step 7 — Turn off “confirm email” so homework login is easy

1. In Supabase, open **Authentication**.
2. Open **Sign In / Providers** (or **Providers**).
3. Click **Email**.
4. Find **Confirm email**.
5. Turn it **off** so a new account can log in right away.
6. Save.

(If you leave it on, the app still works, but you must open a real email inbox first.)

---

## Step 8 — Paste the database tables

1. In Supabase, click **SQL Editor**.
2. Click **New query**.
3. Open the file `supabase-schema.sql` in this project.
4. Copy **all** of it.
5. Paste it into the SQL editor.
6. Click **Run**.
7. You should see success. That created:
   - `profiles` (name, email, theme)
   - `saved_cities` (cities you pin on Home)
   - safety rules so one user cannot read another user’s rows

---

## Step 9 — Copy the public keys into a secret file

The React app must know **where** your database lives. It only uses the **anon public** key, never the secret `service_role` key.

1. In Supabase, open **Project Settings**.
2. Click **API Keys** (or **API**).
3. Copy **Project URL**. It looks like `https://abcd1234.supabase.co`.
4. Copy the **anon public** key (long text). Do **not** copy `service_role`.

On your computer, in Terminal (still inside the project folder):

```bash
cp .env.example .env
```

Open the new `.env` file in any text editor. It should look like this after you paste your values:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=paste-the-anon-key-here
```

Save the file. Do not put spaces around the `=` sign.

---

## Step 10 — Start the app

In Terminal:

```bash
npm run dev
```

You should see a local address, usually:

```text
http://localhost:5173
```

Open that address in your browser.

Leave Terminal open while you use the app. To stop the app later, click Terminal and press `Control + C`.

---

## If something goes wrong

| Problem | What to try |
| --- | --- |
| `brew: command not found` | Finish Step 2, close Terminal, open it again |
| `Missing Supabase settings` | You forgot `.env`, or the names are not `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Stop the app (`Control + C`) and start it again after saving `.env` |
| Login says invalid login | Sign up first, or check Confirm email is off |
| Tables missing | Run `supabase-schema.sql` again in the SQL Editor |
| Weather does not load | Check your internet. Open-Meteo needs the web |

---

## How to test each feature

Use this checklist after the app is running.

### Home page
- [ ] The first city is **Osaka, Japan**.
- [ ] You see a welcome message and a glass-looking card.
- [ ] The background animation matches the weather (sun, clouds, rain, snow, or storm).
- [ ] Top corner has a sun/moon button and **Login / Sign up**.

### Search and forecast
- [ ] Search `Paris`. Click the result.
- [ ] Current temperature, humidity, precipitation, wind speed, and cloud cover appear.
- [ ] A 7-day forecast list appears.
- [ ] Search `zzzzzzxyz` and you see a clear “no cities” message.
- [ ] Search with one letter and you see a validation message.

### Theme
- [ ] Click the theme icon. The page switches between light and dark.
- [ ] Refresh the page. The same theme stays.

### Sign up and login
- [ ] Open **Login / Sign up**, then **Create an account**.
- [ ] Leave fields empty and submit. Error messages appear.
- [ ] Sign up with a short password. You are told it must be 8 characters.
- [ ] Sign up with two different passwords. You are told they do not match.
- [ ] Sign up with a real-looking email and matching password. You land on Home.
- [ ] Log out from Profile. Log in again with the same email and password.

### Saved cities (must be logged in)
- [ ] After signup, **Osaka** is already in **Your cities**.
- [ ] Search another city, open it, click **Save this city**.
- [ ] Click a saved city. Its forecast loads.
- [ ] Remove a city. It leaves the list.
- [ ] Guests (logged out) see an empty saved-city message asking them to log in.

### Profile
- [ ] Logged-out visit to `/profile` sends you to login.
- [ ] Profile shows email, name, theme, join date, and saved-city count.
- [ ] Change your name and save. Refresh. The new name is still there.
- [ ] Log out. You return to Home as a guest.

### Mobile size
- [ ] In Chrome, open Developer Tools, set width to **375px**.
- [ ] Header, search, cards, and forecast still fit without cutting off sideways.

### Security (database)
- [ ] In Supabase **Table Editor**, `profiles` and `saved_cities` have Row Level Security turned on.
- [ ] A second test account cannot see the first account’s cities.
