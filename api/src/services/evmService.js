import { ethers } from 'ethers'
import { CONFIG } from '../config.js'
import { TOKEN_REGISTRY } from '../config/tokenRegistry.js'

/**
 * ERC-20 Token ABI (minimal interface for balance and transfer)
 */
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  }
]

/**
 * EVM Blockchain Service (Ethereum, BSC, Polygon, Arbitrum, Base)
 * Handles native + ERC-20 token balance detection and transfers
 */

class EVMService {
  constructor() {
    this.providers = {
      ethereum: new ethers.JsonRpcProvider(CONFIG.rpc.ethereum),
      bsc: new ethers.JsonRpcProvider(CONFIG.rpc.bsc),
      polygon: new ethers.JsonRpcProvider(CONFIG.rpc.polygon),
      arbitrum: new ethers.JsonRpcProvider(CONFIG.rpc.arbitrum || 'https://arb1.arbitrum.io/rpc'),
      base: new ethers.JsonRpcProvider(CONFIG.rpc.base || 'https://mainnet.base.org'),
      optimism: new ethers.JsonRpcProvider(CONFIG.rpc.optimism || 'https://mainnet.optimism.io'),
      avalanche: new ethers.JsonRpcProvider(CONFIG.rpc.avalanche || 'https://api.avax.mainnet.rpcfast.com:443/ext/bc/C/rpc')
    }

    this.relayer = new ethers.Wallet(CONFIG.relayerEVM.privateKey)
    this.signers = {
      ethereum: this.relayer.connect(this.providers.ethereum),
      bsc: this.relayer.connect(this.providers.bsc),
      polygon: this.relayer.connect(this.providers.polygon),
      arbitrum: this.relayer.connect(this.providers.arbitrum),
      base: this.relayer.connect(this.providers.base),
      optimism: this.relayer.connect(this.providers.optimism),
      avalanche: this.relayer.connect(this.providers.avalanche)
    }
  }

  /**
   * Normalize Ethereum address (checksum)
   */
  normalizeAddress(address) {
    if (!address) return null
    try {
      return ethers.getAddress(address)
    } catch {
      return address.toLowerCase()
    }
  }

  /**
   * Get native balance on chain
   */
  async getNativeBalance(chain, address) {
    try {
      const normalizedAddr = this.normalizeAddress(address)
      const provider = this.providers[chain]
      
      if (!provider) {
        console.warn(`⚠️ Provider not available for chain: ${chain}`)
        return '0'
      }

      const balance = await provider.getBalance(normalizedAddr)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error(`❌ Error getting native balance on ${chain}:`, error.message)
      return '0'
    }
  }

  /**
   * Get ERC-20 token balance
   */
  async getTokenBalance(chain, tokenAddress, userAddress) {
    try {
      const provider = this.providers[chain]
      if (!provider) {
        console.warn(`⚠️ Provider not available for chain: ${chain}`)
        return '0'
      }

      const normalizedAddr = this.normalizeAddress(userAddress)
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
      
      const balance = await contract.balanceOf(normalizedAddr)
      const decimals = await contract.decimals()
      
      return ethers.formatUnits(balance, decimals)
    } catch (error) {
      console.error(
        `❌ Error getting token balance for ${tokenAddress} on ${chain}:`,
        error.message
      )
      return '0'
    }
  }

  /**
   * Detect all balances on all EVM chains (native + ERC-20)
   */
  async detectBalances(account) {
    try {
      console.log('🔍 Detecting EVM balances for:', account)
      
      const balances = {
        ethereum: {
          native: '0',
          tokens: {}
        },
        bsc: {
          native: '0',
          tokens: {}
        },
        polygon: {
          native: '0',
          tokens: {}
        },
        arbitrum: {
          native: '0',
          tokens: {}
        },
        base: {
          native: '0',
          tokens: {}
        },
        optimism: {
          native: '0',
          tokens: {}
        },
        avalanche: {
          native: '0',
          tokens: {}
        }
      }

      // Detect native balances in parallel
      const nativeBalances = await Promise.all([
        this.getNativeBalance('ethereum', account),
        this.getNativeBalance('bsc', account),
        this.getNativeBalance('polygon', account),
        this.getNativeBalance('arbitrum', account),
        this.getNativeBalance('base', account),
        this.getNativeBalance('optimism', account),
        this.getNativeBalance('avalanche', account)
      ])

      balances.ethereum.native = nativeBalances[0]
      balances.bsc.native = nativeBalances[1]
      balances.polygon.native = nativeBalances[2]
      balances.arbitrum.native = nativeBalances[3]
      balances.base.native = nativeBalances[4]
      balances.optimism.native = nativeBalances[5]
      balances.avalanche.native = nativeBalances[6]

      // Detect ERC-20 tokens in parallel per chain
      const tokenBalancePromises = []

      Object.keys(TOKEN_REGISTRY).forEach((chain) => {
        const tokens = TOKEN_REGISTRY[chain]
        Object.entries(tokens).forEach(([symbol, tokenData]) => {
          tokenBalancePromises.push(
            this.getTokenBalance(chain, tokenData.address, account)
              .then((balance) => ({
                chain,
                symbol,
                balance,
                address: tokenData.address
              }))
          )
        })
      })

      const tokenBalances = await Promise.all(tokenBalancePromises)

      // Organize token balances by chain
      tokenBalances.forEach(({ chain, symbol, balance }) => {
        const numBalance = parseFloat(balance)
        if (numBalance > 0) {
          balances[chain].tokens[symbol] = balance
        }
      })

      console.log('✅ EVM Balances detected:', JSON.stringify(balances, null, 2))
      return balances
    } catch (error) {
      console.error('❌ Error detecting EVM balances:', error)
      throw error
    }
  }

  /**
   * Transfer ERC-20 token from relayer to receiver
   */
  async transferToken(chain, tokenAddress, toAddress, amount, decimals) {
    try {
      const signer = this.signers[chain]
      if (!signer) {
        throw new Error(`No signer available for chain: ${chain}`)
      }

      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
      const amountWithDecimals = ethers.parseUnits(amount, decimals)

      console.log(
        `🔄 Transferring ${amount} token to ${toAddress} on ${chain}...`
      )

      const tx = await contract.transfer(toAddress, amountWithDecimals)
      const receipt = await tx.wait()

      console.log(`✅ Token transfer on ${chain} complete: ${receipt.hash}`)

      return {
        hash: receipt.hash,
        amount,
        chain,
        token: tokenAddress,
        explorerUrl: this.getExplorerUrl(chain, receipt.hash)
      }
    } catch (error) {
      console.error(`❌ Error transferring token on ${chain}:`, error.message)
      return {
        hash: null,
        amount,
        chain,
        error: error.message
      }
    }
  }

  /**
   * Get block explorer URL
   */
  getExplorerUrl(chain, hash) {
    const urls = {
      ethereum: `https://etherscan.io/tx/${hash}`,
      bsc: `https://bscscan.com/tx/${hash}`,
      polygon: `https://polygonscan.com/tx/${hash}`,
      arbitrum: `https://arbiscan.io/tx/${hash}`,
      base: `https://basescan.org/tx/${hash}`,
      optimism: `https://optimistic.etherscan.io/tx/${hash}`,
      avalanche: `https://snowtrace.io/tx/${hash}`
    }
    return urls[chain] || '#'
  }
}

export const evmService = new EVMService()
