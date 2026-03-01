import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      {/*
       * ── Centralized Toaster ──────────────────────────────────────────────
       * SATU instance di seluruh app. Jangan tambahkan <Toaster> di tempat lain.
       * Styling ditangani sepenuhnya oleh notify.tsx via toast.custom().
       * containerStyle bottom: 80px = clearance di atas bottom navigation bar.
       */}
      <Toaster
        position="bottom-center"
        gutter={8}
        containerStyle={{ bottom: '80px' }}
        toastOptions={{
          // Jangan override style di sini — biarkan toast.custom() yang mengontrol
          // tampilan sepenuhnya agar tidak ada ghost wrapper transparan
          duration: 4000,
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)


