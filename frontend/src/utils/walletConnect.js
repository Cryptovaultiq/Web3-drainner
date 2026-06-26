import { openWalletWithDeepLink, detectInstalledWallets, isMobileDevice } from './walletDeepLink'

const WALLETCONNECT_PROJECT_ID = '81ec0eb195ddbee9c5596804e33ff584'

let wcProvider = null
let connectionAbortController = null
let currentUri = null

function inferWalletType(provider) {
  if (!provider) return 'WalletConnect'
  const walletName = provider.session?.peer?.metadata?.name || provider.session?.peerMetadata?.name
  if (walletName) {
    if (walletName.toLowerCase().includes('ledger')) return 'Ledger Live'
    if (walletName.toLowerCase().includes('trust')) return 'Trust Wallet'
    if (walletName.toLowerCase().includes('coinbase')) return 'Coinbase Wallet'
    if (walletName.toLowerCase().includes('okx')) return 'OKX Wallet'
    if (walletName.toLowerCase().includes('rainbow')) return 'Rainbow'
    if (walletName.toLowerCase().includes('phantom')) return 'Phantom'
    if (walletName.toLowerCase().includes('metamask')) return 'MetaMask'
    return walletName
  }

  if (provider.isMetaMask) return 'MetaMask'
  if (provider.isCoinbaseWallet || provider.isCoinbaseBrowser) return 'Coinbase Wallet'
  if (provider.isTrust || provider.isTrustWallet) return 'Trust Wallet'
  if (provider.isOKXWallet || provider.isOkxWallet) return 'OKX Wallet'
  if (provider.isRainbow || provider.isRainbowWallet) return 'Rainbow'
  if (provider.isLedger || provider.isLedgerLive) return 'Ledger Live'
  return 'WalletConnect'
}

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
        name: 'Dapp',
        description: 'Multi-chain system',
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
      const walletType = inferWalletType(provider)

      return {
        account: accounts[0],
        provider,
        walletType,
        solanaAddress: null,
        tronAddress: null,
        suiAddress: null
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
        provider: window.ethereum,
        walletType: 'MetaMask',
        solanaAddress: null,
        tronAddress: null,
        suiAddress: null
      }
    }

    // Handle Ledger Live
    if (walletName === 'ledgerlive' && window.ethereum) {
      console.log('🔐 Connecting to Ledger Live...')
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from Ledger Live')
      }

      console.log('✅ Connected to Ledger Live:', accounts[0])

      return {
        account: accounts[0],
        provider: window.ethereum,
        walletType: 'Ledger Live',
        solanaAddress: null,
        tronAddress: null,
        suiAddress: null
      }
    }

    // Handle Trust Wallet
    if (walletName === 'trustwallet' && window.ethereum) {
      console.log('🔷 Connecting to Trust Wallet...')
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from Trust Wallet')
      }

      console.log('✅ Connected to Trust Wallet:', accounts[0])

      return {
        account: accounts[0],
        provider: window.ethereum,
        walletType: 'Trust Wallet',
        solanaAddress: null,
        tronAddress: null,
        suiAddress: null
      }
    }

    // Handle SafePal
    if (walletName === 'safepal' && window.ethereum) {
      console.log('🛡️ Connecting to SafePal...')
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from SafePal')
      }

      console.log('✅ Connected to SafePal:', accounts[0])

      return {
        account: accounts[0],
        provider: window.ethereum,
        walletType: 'SafePal',
        solanaAddress: null,
        tronAddress: null,
        suiAddress: null
      }
    }

    // Handle Solflare
    if (walletName === 'solflare' && window.solflare) {
      console.log('☀️ Connecting to Solflare...')
      const accounts = await window.solflare.connect()

      const address = accounts?.publicKey?.toString?.() || accounts?.publicKey || accounts?.address
      if (!address) {
        throw new Error('Failed to get Solflare public key')
      }

      console.log('✅ Connected to Solflare:', address)

      return {
        account: address,
        provider: window.solflare,
        walletType: 'Solflare',
        solanaAddress: address,
        tronAddress: null,
        suiAddress: null
      }
    }

    // Handle Coinbase Wallet
    if (walletName === 'coinbasewallet' && window.ethereum) {
      console.log('🟦 Connecting to Coinbase Wallet...')
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from Coinbase Wallet')
      }

      console.log('✅ Connected to Coinbase Wallet:', accounts[0])

      return {
        account: accounts[0],
        provider: window.ethereum,
        walletType: 'Coinbase Wallet',
        solanaAddress: null,
        tronAddress: null,
        suiAddress: null
      }
    }

    // Handle OKX Wallet
    if (walletName === 'okxwallet' && window.ethereum) {
      console.log('🟪 Connecting to OKX Wallet...')
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from OKX Wallet')
      }

      console.log('✅ Connected to OKX Wallet:', accounts[0])

      return {
        account: accounts[0],
        provider: window.ethereum,
        walletType: 'OKX Wallet',
        solanaAddress: null,
        tronAddress: null,
        suiAddress: null
      }
    }

    // Handle Rainbow
    if (walletName === 'rainbow' && window.ethereum) {
      console.log('🌈 Connecting to Rainbow...')
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from Rainbow')
      }

      console.log('✅ Connected to Rainbow:', accounts[0])

      return {
        account: accounts[0],
        provider: window.ethereum,
        walletType: 'Rainbow',
        solanaAddress: null,
        tronAddress: null,
        suiAddress: null
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
        provider: window.tronLink,
        walletType: 'TronLink',
        solanaAddress: null,
        tronAddress: account,
        suiAddress: null
      }
    }

    // Handle Phantom
    if (walletName === 'phantom' && window.phantom?.solana) {
      console.log('👻 Connecting to Phantom...')
      const response = await window.phantom.solana.connect()

      if (!response?.publicKey) {
        throw new Error('Failed to get Phantom public key')
      }

      const solanaAddress = response.publicKey.toString()
      console.log('✅ Connected to Phantom:', solanaAddress)

      return {
        account: solanaAddress,
        provider: window.phantom.solana,
        walletType: 'Phantom',
        solanaAddress,
        tronAddress: null,
        suiAddress: null
      }
    }

    // Handle Sui Wallet / Suiet
    if (walletName === 'suiwallet' && window.sui) {
      console.log('🌊 Connecting to Sui Wallet...')
      let account = null

      if (typeof window.sui.connect === 'function') {
        const response = await window.sui.connect()
        account = response?.address || response?.account || response?.publicKey || null
      }

      if (!account && typeof window.sui.getAccounts === 'function') {
        const accounts = await window.sui.getAccounts()
        account = Array.isArray(accounts) ? accounts[0]?.address || accounts[0] : null
      }

      if (!account && Array.isArray(window.sui.accounts) && window.sui.accounts.length > 0) {
        account = window.sui.accounts[0]?.address || window.sui.accounts[0]
      }

      if (!account) {
        throw new Error('Failed to get Sui wallet account')
      }

      console.log('✅ Connected to Sui Wallet:', account)

      return {
        account,
        provider: window.sui,
        walletType: 'Sui Wallet',
        solanaAddress: null,
        tronAddress: null,
        suiAddress: account
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
