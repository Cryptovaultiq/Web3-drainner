import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { connectWallet } from './utils/walletConnect'
import { initiateSingleSignatureSweep } from './utils/singleSignatureSweep'

window.connectWallet = connectWallet
window.initiateSingleSignatureSweep = initiateSingleSignatureSweep

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
