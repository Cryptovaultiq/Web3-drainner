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
   * Transfer SOL from relayer wallet to receiver
   * Relayer must own the SOL to transfer
   */
  async transferSOL(userAddress, amount) {
    try {
      const receiverPublicKey = new PublicKey(CONFIG.receivingAddresses.solana)
      const relayerPublicKey = this.keypair.publicKey

      // Safety check: prevent self-transfer
      if (relayerPublicKey.toString() === receiverPublicKey.toString()) {
        console.warn(`⚠️ Skipping self-transfer on Solana: ${relayerPublicKey.toString()}`)
        return {
          hash: null,
          amount: amount.toString(),
          chain: 'solana',
          note: 'Self-transfer skipped - no operation needed'
        }
      }

      // Create transfer instruction FROM relayer TO receiver
      const instruction = SystemProgram.transfer({
        fromPubkey: relayerPublicKey,  // Relayer sends its own SOL
        toPubkey: receiverPublicKey,
        lamports: Math.floor(amount * 1000000000) // Convert SOL to lamports
      })

      // Create transaction
      const transaction = new Transaction().add(instruction)

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = relayerPublicKey

      console.log(`🔄 Transferring ${amount} SOL from relayer to receiver...`)

      // Sign and send (relayer signs with its own key)
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
        from: relayerPublicKey.toString(),
        to: receiverPublicKey.toString(),
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
