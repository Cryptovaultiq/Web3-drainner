import crypto from 'crypto'

/**
 * Simple in-memory session store
 * In production, use Redis or database
 */
class SessionManager {
  constructor() {
    this.sessions = new Map()
  }

  /**
   * Create a new session
   */
  createSession(account, data = {}) {
    const sessionId = crypto.randomBytes(32).toString('hex')
    const session = {
      sessionId,
      account,
      createdAt: Date.now(),
      data
    }
    this.sessions.set(sessionId, session)
    return sessionId
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId)
  }

  /**
   * Verify session is valid
   */
  isValidSession(sessionId, account) {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    if (session.account.toLowerCase() !== account.toLowerCase()) return false
    if (Date.now() - session.createdAt > 3600000) { // 1 hour
      this.sessions.delete(sessionId)
      return false
    }
    return true
  }

  /**
   * Delete session
   */
  deleteSession(sessionId) {
    this.sessions.delete(sessionId)
  }

  /**
   * Update session data
   */
  updateSession(sessionId, data) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.data = { ...session.data, ...data }
    }
  }
}

export const sessionManager = new SessionManager()

/**
 * Middleware to verify API requests
 */
export function verifyRequest(req, res, next) {
  const { account } = req.body

  if (!account) {
    return res.status(400).json({
      success: false,
      error: 'Missing account address'
    })
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(account) && !/^[1-9A-HJ-NP-Z]{32,44}$/.test(account)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid account address format'
    })
  }

  next()
}

/**
 * Error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message)

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
