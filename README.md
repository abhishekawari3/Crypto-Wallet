# NexaWallet

A locally-hosted crypto wallet dashboard built with React, Vite, Tailwind CSS, and a lightweight Node.js backend. NexaWallet supports Ethereum and Solana wallet generation, account persistence, and live market prices via WebSocket and REST price feeds.

## Project structure

- `client/Wallet/` - main project folder
  - `src/` - React application source
  - `server/` - Node.js API server, auth, wallet storage, price streaming
  - `public/` - static frontend assets
  - `package.json` - dependencies and scripts
  - `README.md` - deployment notes for Vercel

## Key features

- User registration and login with JWT-based authentication
- Ethereum and Solana wallet creation and import flow
- Wallet persistence in local JSON storage or MongoDB Atlas
- Live crypto price streaming using Binance WebSocket and REST fallback
- Responsive UI with theme support and 3D canvas scene
- API endpoints for auth, wallets, and price data

## Prerequisites

- Node.js 20 or newer
- npm
- Optional: MongoDB Atlas or another MongoDB connection for persistent storage

## Local development

1. Open a terminal in `client/Wallet`
2. Install dependencies:

```bash
npm install
```

3. Start the backend server:

```bash
npm run server
```

4. In another terminal, start the frontend:

```bash
npm run dev
```

5. Open the Vite app URL shown in the terminal (typically `http://localhost:5173`).

## Available scripts

- `npm run dev` - start Vite frontend dev server
- `npm run server` - start Node.js backend API server
- `npm run start` - alias for `npm run server`
- `npm run build` - build the frontend for production
- `npm run preview` - preview the built frontend
- `npm run lint` - run ESLint across the project

## API endpoints

- `POST /api/auth/register` - create a new account
- `POST /api/auth/login` - sign in and receive a token
- `GET /api/auth/me` - get authenticated user info
- `GET /api/wallets` - list saved wallets for the current user
- `POST /api/wallets` - save a new wallet record
- `GET /api/prices` - fetch current market prices snapshot
- `GET /api/health` - service health check and price snapshot
- WebSocket: `ws://localhost:8787/prices` - live price updates

## Environment variables

Create a `.env` file in `client/Wallet` or set environment variables in your shell.

- `TOKEN_SECRET` - secret used for JWT signing. Use at least 32 characters in production.
- `CLIENT_ORIGIN` - optional allowed frontend origin for CORS
- `MONGODB_URI` - optional MongoDB connection string
- `MONGODB_DB` - optional MongoDB database name
- `PORT` - optional backend port (defaults to `8787`)
- `LOCAL_DATA_FILE` - optional fallback JSON file path for local storage
- `DISABLE_PRICE_WS` - set to `true` to disable Binance WebSocket price streaming

## Storage behavior

- If `MONGODB_URI` and `MONGODB_DB` are configured, the app uses MongoDB for users and wallets.
- Without MongoDB, the app falls back to local JSON storage at `server/data/nexa-wallet.json`.
- In Vercel production, local JSON persistence is disabled to avoid writing to serverless storage.

## Notes

- The backend uses strong password hashing with PBKDF2 and AES-256-GCM encryption for private keys.
- The app currently supports both Ethereum and Solana wallets.
- Deploying to Vercel requires setting the project root to `client/Wallet` and configuring environment variables.

## Deploying to Vercel

1. Push the repository to GitHub.
2. In Vercel, import the project and set the root directory to `client/Wallet`.
3. Use the Vite framework preset.
4. Add the required environment variables:

```bash
TOKEN_SECRET=use-a-long-random-secret-with-at-least-32-characters
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
MONGODB_URI=mongodb+srv://...
MONGODB_DB=nexa_wallet
```

## License

This repository does not include a license file. Add one if you want to open-source the project.
