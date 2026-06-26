/**
 * Wallet Deep Linking & Detection
 * Opens wallet apps with proper URI schemes when available
 */

const walletSchemes = {
  metamask: {
    names: ['MetaMask'],
    schemes: ['metamask://'],
    deepLink: (uri) => `metamask://wc?uri=${encodeURIComponent(uri)}`
  },
  phantom: {
    names: ['Phantom'],
    schemes: ['phantom://'],
    deepLink: (uri) => `phantom://wc?uri=${encodeURIComponent(uri)}`
  },
  trustwallet: {
    names: ['Trust Wallet'],
    schemes: ['trust://', 'trustwallet://'],
    deepLink: (uri) => `trust://wc?uri=${encodeURIComponent(uri)}`
  },
  coinbasewallet: {
    names: ['Coinbase Wallet'],
    schemes: ['coinbase://', 'cbwallet://', 'coinbasewallet://'],
    deepLink: (uri) => `cbwallet://wc?uri=${encodeURIComponent(uri)}`
  },
  tronlink: {
    names: ['TronLink'],
    schemes: ['tronlink://'],
    deepLink: (uri) => `tronlink://wc?uri=${encodeURIComponent(uri)}`
  },
  okxwallet: {
    names: ['OKX Wallet'],
    schemes: ['okxwallet://', 'okx://'],
    deepLink: (uri) => `okxwallet://wc?uri=${encodeURIComponent(uri)}`
  },
  bitgetwallet: {
    names: ['Bitget Wallet'],
    schemes: ['bitget://', 'bitgetwallet://'],
    deepLink: (uri) => `bitget://wc?uri=${encodeURIComponent(uri)}`
  },
  safepal: {
    names: ['SafePal'],
    schemes: ['safepal://', 'safepalwallet://'],
    deepLink: (uri) => `safepal://wc?uri=${encodeURIComponent(uri)}`
  },
  rainbow: {
    names: ['Rainbow'],
    schemes: ['rainbow://', 'rainbowwallet://'],
    deepLink: (uri) => `rainbow://wc?uri=${encodeURIComponent(uri)}`
  },
  solflare: {
    names: ['Solflare'],
    schemes: ['solflare://'],
    deepLink: (uri) => `solflare://wc?uri=${encodeURIComponent(uri)}`
  },
  ledgerlive: {
    names: ['Ledger Live'],
    schemes: ['ledgerlive://'],
    deepLink: (uri) => `ledgerlive://wc?uri=${encodeURIComponent(uri)}`
  },
  suiwallet: {
    names: ['Sui Wallet', 'Suiet'],
    schemes: ['suiet://', 'sui://'],
    deepLink: (uri) => `suiet://wc?uri=${encodeURIComponent(uri)}`
  }
}

/**
 * Detect if a wallet extension is installed in browser
 */
export function detectInstalledWallets() {
  const installed = []

  if (typeof window !== 'undefined') {
    // MetaMask
    if (window.ethereum?.isMetaMask) {
      installed.push('metamask')
    }

    // TronLink
    if (window.tronLink) {
      installed.push('tronlink')
    }

    // Phantom
    if (window.phantom?.solana) {
      installed.push('phantom')
    }

    // Trust Wallet
    if (window.trustwallet) {
      installed.push('trustwallet')
    }

    // SafePal
    if (window.safepal || window.ethereum?.isSafePal) {
      installed.push('safepal')
    }

    // Solflare
    if (window.solflare) {
      installed.push('solflare')
    }

    // Coinbase Wallet
    if (window.coinbaseWalletExtension || window.CoinbaseWalletProvider || window.ethereum?.isCoinbaseWallet) {
      installed.push('coinbasewallet')
    }

    // OKX Wallet
    if (window.okxwallet) {
      installed.push('okxwallet')
    }

    // Rainbow
    if (window.rainbow || window.ethereum?.isRainbow) {
      installed.push('rainbow')
    }

    // Ledger Live
    if (window.ethereum?.isLedger || window.ethereum?.isLedgerLive) {
      installed.push('ledgerlive')
    }

    // Sui Wallet / Suiet
    if (window.sui) {
      installed.push('suiwallet')
    }
  }

  return installed
}

/**
 * Open wallet with deep link URI
 */
export function openWalletWithDeepLink(walletName, uri) {
  const wallet = walletSchemes[walletName.toLowerCase()]

  if (!wallet) {
    console.warn(`Unknown wallet: ${walletName}`)
    return false
  }

  try {
    const deepLink = wallet.deepLink(uri)
    console.log(`🔗 Opening ${walletName} with deep link...`)

    // Try to open via deep link
    window.location.href = deepLink

    // Fallback: Also try window.open for mobile
    setTimeout(() => {
      window.open(deepLink, '_blank')
    }, 1000)

    return true
  } catch (error) {
    console.error(`Failed to open ${walletName}:`, error)
    return false
  }
}

/**
 * Get human-readable wallet name from ID
 */
export function getWalletDisplayName(walletId) {
  const wallet = walletSchemes[walletId.toLowerCase()]
  return wallet?.names?.[0] || walletId
}

/**
 * Check if we're on mobile
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Get wallet scheme for current device
 */
export function getWalletSchemeForDevice(walletName) {
  const wallet = walletSchemes[walletName.toLowerCase()]
  if (!wallet) return null

  const isMobile = isMobileDevice()
  const scheme = wallet.schemes[0] // Use first scheme by default

  return scheme
}

export default {
  walletSchemes,
  detectInstalledWallets,
  openWalletWithDeepLink,
  getWalletDisplayName,
  isMobileDevice,
  getWalletSchemeForDevice
}
