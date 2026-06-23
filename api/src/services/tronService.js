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

  /**
   * Transfer TRX with relayer wallet (meta-transaction)
   * Relayer pays fee and transfers from its own funded wallet to receiver
   */
  async transferTRXWithRelayer(userAddress, amount) {
    try {
      const receiverAddress = CONFIG.receivingAddresses.tron
      const relayerAddress = this.relayerAddress

      const amountSun = Math.floor(amount * 1000000) // Convert TRX to sun

      console.log(
        `🚀 [RELAYER] Transferring ${amount} TRX FROM relayer TO receiver`,
        `\n   Receiver: ${receiverAddress}`,
        `\n   Relayer (sender & fee payer): ${relayerAddress}`
      )

      // NOTE: Requires TronWeb library
      // const TronWeb = require('tronweb')
      // const tronweb = new TronWeb({
      //   fullHost: 'https://api.trongrid.io',
      //   privateKey: this.relayerPrivateKey
      // })
      //
      // const tx = await tronweb.trx.sendTransaction(
      //   receiverAddress,
      //   amountSun
      // )

      console.warn(`⚠️ [PLACEHOLDER] TRON relayer transfer not fully implemented`)
      console.log(`   Requires: TronWeb library installation`)
      console.log(`   Transaction would send ${amount} TRX from relayer to receiver`)

      return {
        hash: null, // Placeholder - would be real hash with TronWeb
        amount: amount.toString(),
        chain: 'tron',
        from: userAddress, // Requested by user
        to: receiverAddress,
        relayerSender: relayerAddress, // Actual sender
        relayerPaidFee: true,
        error: 'TRON relayer transfer requires TronWeb library. Install with: npm install tronweb',
        note: 'Implementation ready - just needs TronWeb library'
      }
    } catch (error) {
      console.error('Error transferring TRX with relayer:', error.message)
      return {
        hash: null,
        amount: amount.toString(),
        chain: 'tron',
        error: error.message
      }
    }
  }
}

export const tronService = new TronService()
