import cors from 'cors'
import { handleDetectBalances } from '../../src/routes/handlers.js'

const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
})

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

/**
 * POST /api/detect-balances
 */
export default async function handler(req, res) {
  await runMiddleware(req, res, corsMiddleware)

  if (req.method === 'POST') {
    return handleDetectBalances(req, res)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
