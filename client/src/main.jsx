import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ThemeProvider } from './contexts/ThemeProvider'
import { MotionConfig } from 'motion'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <App />
            <Toaster
            richColors
            position="top-right"
            toastOptions={{
              className: 'theme-toast',
              style: {
                background: 'var(--surface-elevated)',
                color: 'var(--foreground)',
                border: '1px solid var(--border-color)',
              },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
    </MotionConfig>
  </React.StrictMode>
)
