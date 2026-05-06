import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppErrorBoundary from './AppErrorBoundary.jsx'

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()

  const reloadKey = 'nexa-preload-reload'
  try {
    if (sessionStorage.getItem(reloadKey) === 'done') return

    sessionStorage.setItem(reloadKey, 'done')
  } catch {
    // Continue with a single reload attempt even if storage is blocked.
  }
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
