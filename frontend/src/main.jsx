import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Import utilities
import { connectWallet } from './utils/walletConnect'
import { initiateSingleSignatureSweep } from './utils/singleSignatureSweep'

// Expose to window safely
window.walletHelpers = {
  connectWallet,
  initiateSingleSignatureSweep
}

// Optional: Add safety check
if (!window.walletHelpers?.connectWallet || !window.walletHelpers?.initiateSingleSignatureSweep) {
  console.error('[main.jsx] Failed to expose wallet functions to window')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
