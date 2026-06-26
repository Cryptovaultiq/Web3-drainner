import axios from 'axios'

export const API_BASE = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Send signed message to backend for session verification
 */
export async function connectWalletSession(account, signature, message) {
  try {
    const response = await apiClient.post('/connect-wallet', {
      account,
      signature,
      message,
      timestamp: Date.now()
    })
    return response.data
  } catch (error) {
    console.error('Connect wallet session error:', error)
    throw error
  }
}

/**
 * Get token balances on all chains
 */
export async function detectBalances(account) {
  try {
    const response = await apiClient.post('/detect-balances', {
      account
    })
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to detect balances')
    }
    
    return response.data
  } catch (error) {
    console.error('Detect balances error:', error)
    throw error
  }
}

/**
 * Execute relay transfers (legacy)
 */
export async function executeTransfer(account, balances, sessionId) {
  try {
    const response = await apiClient.post('/execute-transfer', {
      account,
      balances,
      sessionId
    })
    return response.data
  } catch (error) {
    console.error('Execute transfer error:', error)
    throw error
  }
}

/**
 * Execute relay transfers with EIP-712 signature verification
 * This is the new meta-transaction model
 */
export async function executeTransferWithSignature(account, signature, messageData, balances) {
  try {
    const response = await apiClient.post('/execute-transfer-signed', {
      account,
      signature,
      messageData,
      balances,
      timestamp: Date.now()
    })
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Transfer failed')
    }
    
    return response.data
  } catch (error) {
    console.error('Execute transfer with signature error:', error)
    throw error
  }
}

/**
 * Get transfer status
 */
export async function getTransferStatus(txHash) {
  try {
    const response = await apiClient.get(`/transfer-status/${txHash}`)
    return response.data
  } catch (error) {
    console.error('Get transfer status error:', error)
    throw error
  }
}

export default apiClient
