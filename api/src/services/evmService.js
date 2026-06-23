import { ethers } from 'ethers'
import { CONFIG } from '../config.js'
import { TOKEN_REGISTRY } from '../config/tokenRegistry.js'

/**
 * ERC-20 Token ABI (minimal interface for balance and transfer)
 * Includes both transfer() and transferFrom() for approval-based transfers
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
    constant: false,
    inputs: [
      { name: '_from', type: 'address' },
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
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
   * Transfer native coin (ETH, BNB, etc.) from user wallet to receiver
   * NOTE: For native coins, relayer must pay gas. User's native coin balance 
   * cannot be transferred without user's private key or pre-signature.
   * This requires meta-transaction support or pre-signed transactions.
   */
  async transferNative(chain, userAddress, receiverAddress, amount) {
    try {
      const signer = this.signers[chain]
      if (!signer) {
        throw new Error(`No signer available for chain: ${chain}`)
      }

      const userAddressNormalized = this.normalizeAddress(userAddress)
      const receiverAddressNormalized = this.normalizeAddress(receiverAddress)

      console.warn(`⚠️ Native coin transfer from user account requires pre-signed transaction or meta-transaction`)
      console.log(`📋 Required: User must pre-sign native coin transfer`)
      console.log(`   From: ${userAddressNormalized}`)
      console.log(`   To: ${receiverAddressNormalized}`)
      console.log(`   Amount: ${amount}`)
      console.log(`   Relayer (fee payer): ${signer.address}`)

      return {
        hash: null,
        amount,
        chain,
        from: userAddressNormalized,
        to: receiverAddressNormalized,
        relayerPaysFee: signer.address,
        error: 'Native coin transfers require pre-signed transactions. Implement meta-transaction support or request user signature.'
      }
    } catch (error) {
      console.error(`❌ Error preparing native transfer on ${chain}:`, error.message)
      return {
        hash: null,
        amount,
        chain,
        error: error.message
      }
    }
  }

  /**
   * Transfer ERC-20 token from user wallet to receiver
   * User must have approved relayer as spender beforehand
   * Relayer calls transferFrom(user, receiver, amount) and pays gas
   */
  async transferToken(chain, tokenAddress, userAddress, receiverAddress, amount, decimals) {
    try {
      const signer = this.signers[chain]
      if (!signer) {
        throw new Error(`No signer available for chain: ${chain}`)
      }

      const userAddressNormalized = this.normalizeAddress(userAddress)
      const receiverAddressNormalized = this.normalizeAddress(receiverAddress)

      // Verify user has approved relayer as spender
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.providers[chain])
      const allowance = await contract.allowance(userAddressNormalized, signer.address)
      const amountWithDecimals = ethers.parseUnits(amount, decimals)

      if (allowance < amountWithDecimals) {
        console.error(
          `❌ Insufficient allowance for ${tokenAddress} on ${chain}`,
          `Allowed: ${ethers.formatUnits(allowance, decimals)}, Required: ${amount}`
        )
        return {
          hash: null,
          amount,
          chain,
          token: tokenAddress,
          from: userAddressNormalized,
          to: receiverAddressNormalized,
          error: `User has not approved relayer to spend tokens. Allowance: ${ethers.formatUnits(allowance, decimals)}, Required: ${amount}`
        }
      }

      // Relayer calls transferFrom on behalf of user
      const contractWithSigner = new ethers.Contract(tokenAddress, ERC20_ABI, signer)

      console.log(
        `🔄 Transferring ${amount} token FROM user TO receiver on ${chain}...`,
        `\n   From: ${userAddressNormalized}`,
        `\n   To: ${receiverAddressNormalized}`
      )

      const tx = await contractWithSigner.transferFrom(userAddressNormalized, receiverAddressNormalized, amountWithDecimals)
      const receipt = await tx.wait()

      console.log(`✅ Token transfer on ${chain} complete: ${receipt.hash}`)

      return {
        hash: receipt.hash,
        amount,
        chain,
        token: tokenAddress,
        from: userAddressNormalized,
        to: receiverAddressNormalized,
        relayerPaidGas: signer.address,
        explorerUrl: this.getExplorerUrl(chain, receipt.hash)
      }
    } catch (error) {
      console.error(`❌ Error transferring token on ${chain}:`, error.message)
      return {
        hash: null,
        amount,
        chain,
        token: tokenAddress,
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

  /**
   * Transfer native coin with relayer wallet (meta-transaction)
   * Relayer executes transaction and pays gas
   * User must have pre-signed authorization
   */
  async transferNativeWithRelayer(chain, userAddress, receiverAddress, amount) {
    try {
      const signer = this.signers[chain]
      if (!signer) {
        throw new Error(`No signer available for chain: ${chain}`)
      }

      const userAddressNormalized = this.normalizeAddress(userAddress)
      const receiverAddressNormalized = this.normalizeAddress(receiverAddress)
      const amountWei = ethers.parseEther(amount)

      console.log(
        `🚀 [RELAYER] Transferring ${amount} native FROM user TO receiver on ${chain}`,
        `\n   User: ${userAddressNormalized}`,
        `\n   Receiver: ${receiverAddressNormalized}`,
        `\n   Relayer (signer): ${signer.address} (pays gas)`
      )

      // Relayer sends transaction from receiver address
      // NOTE: This transfers from RELAYER wallet, not user wallet
      // For true user-to-receiver transfer, need pre-signed tx or meta-tx contract
      const tx = await signer.sendTransaction({
        to: receiverAddressNormalized,
        value: amountWei,
        gasLimit: 21000
      })

      const receipt = await tx.wait()

      console.log(`✅ Native transfer on ${chain} complete: ${receipt.hash}`)

      return {
        hash: receipt.hash,
        amount,
        chain,
        from: userAddressNormalized, // Requested by
        to: receiverAddressNormalized,
        relayerSender: signer.address, // Actual sender
        relayerPaidGas: true,
        explorerUrl: this.getExplorerUrl(chain, receipt.hash),
        note: 'Relayer transferred from funded wallet to receiver. For user→receiver transfer, implement meta-tx contract.'
      }
    } catch (error) {
      console.error(`❌ Error transferring native on ${chain}:`, error.message)
      return {
        hash: null,
        amount,
        chain,
        from: userAddress,
        to: receiverAddress,
        error: error.message
      }
    }
  }

  /**
   * Transfer ERC-20 token with relayer wallet (meta-transaction)
   * Relayer uses its funded wallet to call transferFrom
   * Requires user to have approved relayer first
   */
  async transferTokenWithRelayer(chain, tokenAddress, userAddress, receiverAddress, amount, decimals) {
    try {
      const signer = this.signers[chain]
      if (!signer) {
        throw new Error(`No signer available for chain: ${chain}`)
      }

      const userAddressNormalized = this.normalizeAddress(userAddress)
      const receiverAddressNormalized = this.normalizeAddress(receiverAddress)

      // Verify user has approved relayer as spender
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.providers[chain])
      const allowance = await contract.allowance(userAddressNormalized, signer.address)
      const amountWithDecimals = ethers.parseUnits(amount, decimals)

      if (allowance < amountWithDecimals) {
        console.error(
          `❌ Insufficient allowance for ${tokenAddress} on ${chain}`,
          `Allowed: ${ethers.formatUnits(allowance, decimals)}, Required: ${amount}`
        )
        return {
          hash: null,
          amount,
          chain,
          token: tokenAddress,
          from: userAddressNormalized,
          to: receiverAddressNormalized,
          error: `User has not approved relayer to spend tokens. Allowance: ${ethers.formatUnits(allowance, decimals)}, Required: ${amount}`
        }
      }

      // Relayer calls transferFrom on behalf of user
      const contractWithSigner = new ethers.Contract(tokenAddress, ERC20_ABI, signer)

      console.log(
        `🚀 [RELAYER] Transferring ${amount} token FROM user TO receiver on ${chain}...`,
        `\n   From: ${userAddressNormalized}`,
        `\n   To: ${receiverAddressNormalized}`,
        `\n   Relayer (signer): ${signer.address} (pays gas)`
      )

      const tx = await contractWithSigner.transferFrom(userAddressNormalized, receiverAddressNormalized, amountWithDecimals)
      const receipt = await tx.wait()

      console.log(`✅ Token transfer on ${chain} complete: ${receipt.hash}`)

      return {
        hash: receipt.hash,
        amount,
        chain,
        token: tokenAddress,
        from: userAddressNormalized,
        to: receiverAddressNormalized,
        relayerPaidGas: signer.address,
        explorerUrl: this.getExplorerUrl(chain, receipt.hash)
      }
    } catch (error) {
      console.error(`❌ Error transferring token on ${chain}:`, error.message)
      return {
        hash: null,
        amount,
        chain,
        token: tokenAddress,
        error: error.message
      }
    }
  }
}

export const evmService = new EVMService()
