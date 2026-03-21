import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App'
import './index.css'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // 性能采样：生产环境 10%，开发环境 0%
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 0,
  // 会话录制：只录制出错的会话
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
