import EIP712Verifier from './eip712Verifier.js'

/**
 * Signature Verifier for Meta-Transaction Model
 * Handles signature verification and replay protection
 */

class SignatureVerifier {
  constructor() {
    // In-memory nonce tracking for replay protection
    // In production, use a database
    this.usedNonces = new Map() // userAddress -> Set of used nonces
  }

  /**
   * Verify EIP-712 signed message
   * @param {string} userAddress - User's wallet address
   * @param {Object} message - The message that was signed
   * @param {Object} domain - EIP-712 domain
   * @param {Object} types - EIP-712 message types
   * @param {string} signature - The signature (hex string)
   * @returns {boolean} true if signature is valid
   */
  verifyEIP712(userAddress, message, domain, types, signature) {
    try {
      // Verify message structure
      EIP712Verifier.validateMessage(message)
      EIP712Verifier.validateNonce(message.nonce)

      // Check replay protection
      this.checkNonce(userAddress, message.nonce)

      // Recover signer from signature
      const recoveredAddress = EIP712Verifier.verifySig(message, domain, types, signature)

      // Verify recovered address matches user address
      if (recoveredAddress.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error(
          `Signature mismatch: recovered ${recoveredAddress} but expected ${userAddress}`
        )
      }

      // Mark nonce as used
      this.markNonceUsed(userAddress, message.nonce)

      console.log(`✅ EIP-712 signature verified for ${userAddress}`)
      return true
    } catch (error) {
      console.error(`❌ Signature verification failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Check if nonce has already been used (replay protection)
   */
  checkNonce(userAddress, nonce) {
    const normalizedAddress = userAddress.toLowerCase()
    const usedNonces = this.usedNonces.get(normalizedAddress) || new Set()

    if (usedNonces.has(nonce)) {
      throw new Error(`Nonce ${nonce} has already been used (replay protection)`)
    }

    return true
  }

  /**
   * Mark nonce as used
   */
  markNonceUsed(userAddress, nonce) {
    const normalizedAddress = userAddress.toLowerCase()
    let usedNonces = this.usedNonces.get(normalizedAddress)

    if (!usedNonces) {
      usedNonces = new Set()
      this.usedNonces.set(normalizedAddress, usedNonces)
    }

    usedNonces.add(nonce)

    // Clean up old nonces to prevent memory leak
    // Keep only last 100 nonces per user
    if (usedNonces.size > 100) {
      const noncesArray = Array.from(usedNonces).sort((a, b) => a - b)
      const toRemove = noncesArray.slice(0, noncesArray.length - 100)
      toRemove.forEach((n) => usedNonces.delete(n))
    }
  }

  /**
   * Get current nonce for user (for next signature)
   */
  getNextNonce(userAddress) {
    const normalizedAddress = userAddress.toLowerCase()
    const usedNonces = this.usedNonces.get(normalizedAddress) || new Set()

    if (usedNonces.size === 0) {
      return 0
    }

    const maxNonce = Math.max(...Array.from(usedNonces))
    return maxNonce + 1
  }
}

// Singleton instance
export const signatureVerifier = new SignatureVerifier()

export default SignatureVerifier
