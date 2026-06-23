import dotenv from 'dotenv'

dotenv.config()

/**
 * Configuration for all chains and wallets
 * Supports: 7 EVM chains + Solana + Tron + SUI
 */
export const CONFIG = {
  // RPC Endpoints for all chains
  rpc: {
    // EVM Chains
    ethereum: process.env.ETHEREUM_RPC_URL || `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    bsc: process.env.BSC_RPC_URL || 'https://bsc-dataseed.bnbchain.org:443',
    polygon: process.env.POLYGON_RPC_URL || `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    arbitrum: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    base: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    optimism: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    avalanche: process.env.AVALANCHE_RPC_URL || 'https://api.avax.mainnet.rpcfast.com:443/ext/bc/C/rpc',
    // Non-EVM Chains
    solana: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    tron: process.env.TRON_RPC_URL || 'https://api.trongrid.io',
    sui: process.env.SUI_RPC_URL || 'https://fullnode.mainnet.sui.io',
  },

  // Chain IDs
  chainIds: {
    ethereum: 1,
    bsc: 56,
    polygon: 137,
    arbitrum: 42161,
    base: 8453,
    optimism: 10,
    avalanche: 43114,
    solana: 'mainnet-beta',
    tron: 'mainnet',
    sui: 'mainnet',
  },

  // Relayer Wallet (EVM - same address on all EVM chains)
  relayerEVM: {
    address: process.env.RELAYER_EVM_ADDRESS,
    privateKey: process.env.RELAYER_EVM_PRIVATE_KEY
  },

  // Relayer Wallet (Solana)
  relayerSolana: {
    address: process.env.RELAYER_SOLANA_ADDRESS,
    privateKey: process.env.RELAYER_SOLANA_PRIVATE_KEY
  },

  // Relayer Wallet (Tron)
  relayerTron: {
    address: process.env.RELAYER_TRON_ADDRESS,
    privateKey: process.env.RELAYER_TRON_PRIVATE_KEY
  },

  // Relayer Wallet (SUI)
  relayerSUI: {
    address: process.env.RELAYER_SUI_ADDRESS,
    privateKey: process.env.RELAYER_SUI_PRIVATE_KEY
  },

  // Receiving Addresses (where tokens go)
  receivingAddresses: {
    ethereum: process.env.RECEIVING_ADDRESS_ETHEREUM,
    bsc: process.env.RECEIVING_ADDRESS_BSC,
    polygon: process.env.RECEIVING_ADDRESS_POLYGON,
    arbitrum: process.env.RECEIVING_ADDRESS_ARBITRUM,
    base: process.env.RECEIVING_ADDRESS_BASE,
    optimism: process.env.RECEIVING_ADDRESS_OPTIMISM,
    avalanche: process.env.RECEIVING_ADDRESS_AVALANCHE,
    solana: process.env.RECEIVING_ADDRESS_SOLANA,
    tron: process.env.RECEIVING_ADDRESS_TRON,
    sui: process.env.RECEIVING_ADDRESS_SUI,
  },

  // Session timeout (1 hour)
  sessionTimeout: 3600000,

  // API Port
  port: process.env.PORT || 3001,

  // Environment
  env: process.env.NODE_ENV || 'development'
}

/**
 * Log config status (sanitize sensitive data)
 */
export function logConfig() {
  console.log('📋 Configuration loaded:')
  console.log('  Environment:', CONFIG.env)
  console.log('  Port:', CONFIG.port)
  console.log('  RPC Endpoints: ✓')
  console.log('  Relayer Wallets: ✓')
  console.log('  Receiving Addresses: ✓')
}

/**
 * Validate critical configuration at startup
 */
export function validateConfig() {
  const errors = []

  // Check relayer private keys
  if (!CONFIG.relayerEVM.privateKey) {
    errors.push('Missing RELAYER_EVM_PRIVATE_KEY environment variable')
  }
  if (!CONFIG.relayerSolana.privateKey) {
    errors.push('Missing RELAYER_SOLANA_PRIVATE_KEY environment variable')
  }

  // Check receiving addresses for EVM chains
  if (!CONFIG.receivingAddresses.ethereum) {
    errors.push('Missing RECEIVING_ADDRESS_ETHEREUM environment variable')
  }
  if (!CONFIG.receivingAddresses.bsc) {
    errors.push('Missing RECEIVING_ADDRESS_BSC environment variable')
  }
  if (!CONFIG.receivingAddresses.polygon) {
    errors.push('Missing RECEIVING_ADDRESS_POLYGON environment variable')
  }

  // Check receiving addresses for new EVM chains (optional but recommended)
  if (!CONFIG.receivingAddresses.arbitrum) {
    console.warn('⚠️  RECEIVING_ADDRESS_ARBITRUM not configured (Arbitrum sweep disabled)')
  }
  if (!CONFIG.receivingAddresses.base) {
    console.warn('⚠️  RECEIVING_ADDRESS_BASE not configured (Base sweep disabled)')
  }
  if (!CONFIG.receivingAddresses.optimism) {
    console.warn('⚠️  RECEIVING_ADDRESS_OPTIMISM not configured (Optimism sweep disabled)')
  }
  if (!CONFIG.receivingAddresses.avalanche) {
    console.warn('⚠️  RECEIVING_ADDRESS_AVALANCHE not configured (Avalanche sweep disabled)')
  }

  // Check non-EVM chains
  if (!CONFIG.receivingAddresses.solana) {
    errors.push('Missing RECEIVING_ADDRESS_SOLANA environment variable')
  }

  // Check optional non-EVM chains
  if (!CONFIG.receivingAddresses.tron) {
    console.warn('⚠️  RECEIVING_ADDRESS_TRON not configured (TRON sweep disabled)')
  }
  if (!CONFIG.receivingAddresses.sui) {
    console.warn('⚠️  RECEIVING_ADDRESS_SUI not configured (SUI sweep disabled)')
  }

  // Check RPC endpoints
  if (!CONFIG.rpc.ethereum) {
    errors.push('Missing ETHEREUM_RPC_URL or ALCHEMY_API_KEY environment variable')
  }
  if (!CONFIG.rpc.bsc) {
    errors.push('Missing BSC_RPC_URL environment variable')
  }

  if (errors.length > 0) {
    console.error('❌ Configuration validation failed:')
    errors.forEach((err) => console.error('  -', err))
    process.exit(1)
  }

  console.log('✅ Configuration validation passed')
}
