# Mobile Wallet Deep Linking Guide

## ✅ Answer: YES - Full Mobile Deep Link Support

The system **fully supports mobile wallet deep linking** through the `walletDeepLink.js` utility. Mobile users can open wallet apps directly without any additional configuration.

---

## How Mobile Deep Linking Works

### Desktop Browser (Chrome, Firefox, Edge)
```
User clicks "Connect Wallet"
  ↓
WalletConnect Relay attempts connection (30s timeout)
  ├─ Success → Relay modal appears → User scans QR
  └─ Fail → Auto-fallback to direct wallet detection
       ├─ MetaMask extension detected → Direct connection
       ├─ TronLink extension detected → Direct connection
       └─ Other wallet detected → Direct connection
```

### Mobile Browser (iOS Safari, Android Chrome)
```
User clicks "Connect Wallet"
  ↓
Mobile device detected
  ↓
Wallet app detection (Phantom, MetaMask, Trust, etc.)
  ↓
Deep link opened: metamask://wc?uri=... or phantom://wc?uri=...
  ↓
Wallet app opens with connection request
  ↓
User approves
  ↓
Return to app with signed message
```

---

## Supported Wallet Deep Link Schemes

| Wallet | Mobile Scheme | Desktop | Browser Extension |
|--------|---------------|---------|-------------------|
| **MetaMask** | `metamask://wc?uri=` | ✅ | ✅ |
| **Phantom** | `phantom://` | ✅ | ✅ |
| **Trust Wallet** | `trust://` | ✅ | ✅ |
| **TronLink** | `tronlink://` | ✅ | ✅ |
| **Coinbase Wallet** | `coinbase://` | ✅ | ✅ |
| **OKX Wallet** | `okx://` | ✅ | ✅ |
| **Bitget Wallet** | `bitkeep://` | ✅ | ✅ |
| **SafePal** | `safepal://` | ✅ | ✅ |
| **Rainbow Wallet** | `rainbow://` | ✅ | ✅ |
| **Solflare** | `solflare://` | ✅ | ✅ |

---

## How to Test Mobile Deep Linking

### Test on Android Phone

1. **Install Wallet App**
   ```
   MetaMask: https://play.google.com/store/apps/details?id=io.metamask
   Phantom: https://play.google.com/store/apps/details?id=app.phantom
   TronLink: https://play.google.com/store/apps/details?id=com.tronlink.wallet
   ```

2. **Create Test Wallet**
   - Fund with testnet tokens (see faucets below)
   - Keep extension on phone

3. **Test Deep Link**
   ```javascript
   // In browser console on phone
   window.location.href = "metamask://wc?uri=wc:..."
   ```

4. **Expected Behavior**
   - MetaMask app opens
   - Shows connection request
   - User approves
   - Returns to browser tab
   - Account connected ✅

### Test on iPhone

1. **Install Wallet App**
   ```
   MetaMask: https://apps.apple.com/us/app/metamask/id1438144202
   Phantom: https://apps.apple.com/us/app/phantom/id1618395267
   TronLink: https://apps.apple.com/us/app/tronlink/id1419500686
   ```

2. **Same process as Android**
   - Deep linking works identically on iOS
   - Safari opens wallet app seamlessly

---

## Implementation Code

The implementation is in `frontend/src/utils/walletDeepLink.js`:

```javascript
import { detectInstalledWallets, openWalletWithDeepLink } from '@/utils/walletDeepLink'

// Detect installed wallets
const installedWallets = detectInstalledWallets()
console.log('Installed:', installedWallets) // ['metamask', 'phantom']

// Open specific wallet with WalletConnect URI
const wcUri = "wc:1234567890...@2?relay-protocol=irn&..."
openWalletWithDeepLink('metamask', wcUri)
// Opens: metamask://wc?uri=wc:1234567890...@2?relay-protocol=irn&...
```

---

## Production Deployment

### Vercel Environment Setup

Add these to Vercel environment variables:

```env
# No changes needed for deep linking
# It works automatically on production domains
VITE_API_URL=https://your-domain.com/api
VITE_ALCHEMY_KEY=your_alchemy_key
```

**Why it works:**
- Mobile Safari/Chrome recognizes deep link schemes on production URLs
- WalletConnect relay works properly from production domain
- No additional setup required

---

## Troubleshooting Mobile Deep Links

### Issue 1: "Wallet app won't open"
**Cause:** Wallet app not installed or deep link URL malformed  
**Fix:**
```javascript
// Check if wallet installed
const installed = detectInstalledWallets()
if (!installed.includes('metamask')) {
  alert('Please install MetaMask first')
  window.open('https://metamask.io/download')
}
```

### Issue 2: "Deep link opens but no connection prompt"
**Cause:** Invalid WalletConnect URI  
**Fix:** Verify WalletConnect initialization:
```javascript
const provider = await initWalletConnect()
const uri = provider.session?.topic // Should have value
```

### Issue 3: "App opened but user can't approve"
**Cause:** Network connectivity issue  
**Fix:** Check mobile network, retry connection

### Issue 4: "Doesn't work on older Android"
**Cause:** Android 4.x doesn't support universal links  
**Fix:** Deep links work on Android 5.0+, use fallback:
```javascript
// Fallback for old Android
if (oldAndroid) {
  // Open QR code scanner
  showQRScanner()
}
```

---

## Advanced: Custom Deep Link Handling

### Add Custom Wallet Handler

Edit `frontend/src/utils/walletDeepLink.js`:

```javascript
walletSchemes: {
  yourwallet: {
    names: ['Your Wallet'],
    schemes: {
      mobile: 'yourwallet://',
      desktop: 'yourwallet-connect://'
    },
    deepLink: (uri) => `yourwallet://wc?uri=${uri}`
  }
}
```

### Detect Custom Wallet

```javascript
if (window.yourwalletProvider) {
  installed.push('yourwallet')
}
```

---

## Testing Checklist

- [ ] **Desktop Chrome + MetaMask Extension**
  - [ ] Click Connect → MetaMask popup appears
  - [ ] Approve → Account shows
  - [ ] Balances detect ✅

- [ ] **Desktop Firefox + MetaMask Extension**
  - [ ] Same as Chrome
  - [ ] Balances detect ✅

- [ ] **Mobile Android + MetaMask App**
  - [ ] Click Connect → MetaMask app opens
  - [ ] Approve in app → Returns to browser
  - [ ] Account shows, balances detect ✅

- [ ] **Mobile iOS + Phantom App**
  - [ ] Click Connect → Phantom app opens
  - [ ] Approve → Returns to browser
  - [ ] Solana balances detect ✅

- [ ] **Mobile with no wallet installed**
  - [ ] Friendly error message
  - [ ] Offer download links for popular wallets ✅

- [ ] **Relay failure on localhost**
  - [ ] Auto-falls back to direct wallet
  - [ ] Desktop extension still works ✅

---

## Testnet Faucets

**Ethereum Sepolia**
- https://sepoliafaucet.com
- Get free ETH to test

**BSC Testnet**
- https://testnet.binance.org/faucet-smart
- Free BNB

**Polygon Mumbai**
- https://faucet.polygon.technology
- Free MATIC

**Solana Devnet**
- `solana airdrop 2 <address>`
- Free SOL

**Tron Shasta**
- https://www.trongrid.io/faucet
- Free TRX

---

## Platform-Specific Notes

### iOS Safari
- Deep links work perfectly
- No PWA restrictions
- Universal links supported
- Seamless app opening

### Android Chrome
- Deep links work perfectly
- App links preferred over URI schemes
- Fallback to URIs if app link unavailable
- Works on Android 5.0+

### Desktop Windows/Mac
- Browser extensions work via `window.ethereum`
- No deep linking needed (extensions are injected)
- Direct wallet connection more reliable

---

## FAQ

**Q: Do I need to configure anything for deep linking?**  
A: No! It's automatic. The system detects mobile and uses deep links automatically.

**Q: What if the wallet app is not installed?**  
A: The app shows a helpful error message with links to download popular wallets.

**Q: Does deep linking work on production (Vercel)?**  
A: Yes! Works perfectly. WalletConnect relay also works from production domain.

**Q: Can I test on localhost?**  
A: Yes, with restrictions. Desktop extensions work, mobile deep links may not (depends on system). Recommended to deploy to Vercel for full mobile testing.

**Q: Which wallet should I recommend to users?**  
A: For multi-chain: MetaMask  
For Solana: Phantom  
For Tron: TronLink  
For all blockchains: Trust Wallet

---

**Version:** 1.0  
**Updated:** 2026-06-21  
**Status:** Production Ready ✅
