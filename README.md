# Campaign Builder — Marketo

Conversational campaign intake → MOps review → auto-build in Marketo.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import repo
3. Vercel auto-detects Next.js — click **Deploy**
4. Add environment variables in **Settings → Environment Variables**:

| Key | Value |
|-----|-------|
| `MKTO_ENDPOINT` | `https://047-LOL-803.mktorest.com/rest` |
| `MKTO_IDENTITY_URL` | `https://047-LOL-803.mktorest.com/identity` |
| `MKTO_CLIENT_ID` | Your Client ID from LaunchPoint |
| `MKTO_CLIENT_SECRET` | Your Client Secret from LaunchPoint |

5. Redeploy after adding env vars
6. Visit your URL — Campaign Builder is ready

## Local Development

```bash
npm install
cp .env.local.example .env.local  # fill in your credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── layout.js              # Root layout
├── page.js                # Entry point
├── CampaignBuilder.js     # Full UI (intake, MOps dashboard, build flow)
└── api/marketo/route.js   # Marketo REST API proxy (server-side)
```

The API route handles all Marketo calls server-side so credentials never reach the browser.
