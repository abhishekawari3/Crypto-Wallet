import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppErrorBoundary from './AppErrorBoundary.jsx'

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()

  const url = new URL(window.location.href)
  if (url.searchParams.has('nexaPreloadReload')) return

  url.searchParams.set('nexaPreloadReload', '1')
  window.location.replace(url.toString())
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
