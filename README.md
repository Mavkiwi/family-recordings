# For Kirsten - Family Recordings

A memorial web app to collect voice recordings and memories from family and friends.

## Deployment

Deployed via **Cloudflare Pages** from GitHub.

- Repository: https://github.com/Mavkiwi/family-recordings
- Cloudflare Pages auto-deploys on push to `main`

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn-ui
- PWA enabled
- n8n webhook for file uploads

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Webhook

Files are uploaded to: `https://plex.app.n8n.cloud/webhook/voice-idea`
