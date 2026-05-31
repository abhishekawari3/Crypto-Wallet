# NexaWallet

## Deploy to Vercel

This app is ready to deploy from the `client/Wallet` folder.

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set **Root Directory** to `client/Wallet`.
4. Keep the framework preset as **Vite**.
5. Add these environment variables in Vercel:

```bash
TOKEN_SECRET=use-a-long-random-secret-with-at-least-32-characters
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
MONGODB_URI=mongodb+srv://...
MONGODB_DB=nexa_wallet
```

Use a `TOKEN_SECRET` with at least 32 random characters. Deployed builds fail fast without it so auth tokens and encrypted wallet records are not created with a development secret.

The frontend uses same-origin `/api` routes on Vercel. The backend connects to MongoDB lazily, so serverless cold starts do not crash the app. Use MongoDB Atlas or another hosted MongoDB database for auth and wallet persistence. Local JSON-file storage is not used; local development also requires `MONGODB_URI`.

The local backend WebSocket streams prices at `/prices`. In production, Vercel serverless functions do not host long-running WebSocket servers, so the frontend polls `/api/prices`.

For local development, run both commands in separate terminals:

```bash
npm run server
npm run dev
```
