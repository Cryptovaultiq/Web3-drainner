/**
 * BalancesDisplay Component
 * Shows detected native + ERC-20 token balances on all chains
 */
function BalancesDisplay({ balances }) {
  const chains = [
    { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: 'from-blue-600 to-blue-700', native: 'ETH' },
    { id: 'bsc', name: 'BNB Smart Chain', icon: '🟡', color: 'from-yellow-600 to-yellow-700', native: 'BNB' },
    { id: 'polygon', name: 'Polygon', icon: '🟣', color: 'from-purple-600 to-purple-700', native: 'MATIC' },
    { id: 'arbitrum', name: 'Arbitrum', icon: '🔷', color: 'from-indigo-600 to-indigo-700', native: 'ETH' },
    { id: 'base', name: 'Base', icon: '🔵', color: 'from-blue-500 to-blue-600', native: 'ETH' },
    { id: 'solana', name: 'Solana', icon: '◎', color: 'from-cyan-600 to-cyan-700', native: 'SOL' },
    { id: 'tron', name: 'Tron', icon: '🔴', color: 'from-red-600 to-red-700', native: 'TRX' },
    { id: 'sui', name: 'SUI', icon: '🌊', color: 'from-cyan-500 to-cyan-600', native: 'SUI' }
  ]

  // Format balance display for a chain
  const renderChainBalance = (chainId, chainData) => {
    const chain = chains.find(c => c.id === chainId)
    if (!chain) return null

    // Handle both old format (string) and new format (object with native + tokens)
    if (typeof chainData === 'string' || typeof chainData === 'number') {
      return (
        <div key={chainId} className={`bg-gradient-to-br ${chain.color} rounded-lg p-4 border border-opacity-50`}>
          <p className="text-white text-opacity-80 text-sm font-semibold flex items-center gap-2">
            <span className="text-xl">{chain.icon}</span>
            {chain.name}
          </p>
          <p className="text-white font-mono text-lg mt-2">{chainData || '0.00'} {chain.native}</p>
        </div>
      )
    }

    // New format with native + tokens
    const { native = '0', tokens = {} } = chainData
    const hasTokens = Object.keys(tokens).length > 0

    return (
      <div key={chainId} className={`bg-gradient-to-br ${chain.color} rounded-lg p-4 border border-opacity-50`}>
        <p className="text-white text-opacity-80 text-sm font-semibold flex items-center gap-2">
          <span className="text-xl">{chain.icon}</span>
          {chain.name}
        </p>
        
        {/* Native balance */}
        <div className="mt-2">
          <p className="text-white font-mono text-lg">
            {parseFloat(native).toFixed(4)} {chain.native}
          </p>
        </div>

        {/* Token balances */}
        {hasTokens && (
          <div className="mt-3 space-y-1 border-t border-white border-opacity-20 pt-2">
            {Object.entries(tokens).map(([symbol, balance]) => (
              <p key={symbol} className="text-white text-opacity-90 text-xs font-mono">
                {parseFloat(balance).toFixed(4)} {symbol}
              </p>
            ))}
          </div>
        )}

        {!hasTokens && (
          <p className="text-white text-opacity-70 text-xs mt-2">No tokens detected</p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span>💎</span>
        Detected Balances
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(balances).map(([chainId, chainData]) =>
          renderChainBalance(chainId, chainData)
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
        <p className="text-gray-300 text-sm">
          <span className="font-semibold">📊 Status:</span> Balances detected across all chains.
          Native coins + ERC-20 tokens will be transferred to the relayer wallet when you approve.
        </p>
      </div>
    </div>
  )
}

export default BalancesDisplay
