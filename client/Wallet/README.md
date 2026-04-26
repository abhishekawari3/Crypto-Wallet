# React + Vite

## Deploy to Vercel

This app is ready to deploy from the `client/Wallet` folder.

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set **Root Directory** to `client/Wallet`.
4. Keep the framework preset as **Vite**.
5. Add these environment variables in Vercel:

```bash
TOKEN_SECRET=use-a-long-random-secret
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
```

The frontend uses same-origin `/api` routes on Vercel. The local backend WebSocket is replaced by polling `/api/prices` in production because Vercel serverless functions do not host long-running WebSocket servers.

For local development, run both commands in separate terminals:

```bash
npm run server
npm run dev
```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
