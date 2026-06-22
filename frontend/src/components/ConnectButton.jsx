/**
 * ConnectButton Component
 * Main button to initiate wallet connection with WalletConnect + Direct Wallet fallback
 */
function ConnectButton({ onClick, isLoading, error }) {
  return (
    <div className="space-y-4">
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
          isLoading
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            Connecting Wallet...
          </>
        ) : (
          <>
            <span>👛</span>
            Connect Wallet
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <p className="text-red-200 font-semibold">Connection Error</p>
          <p className="text-red-300 text-sm mt-2">{error}</p>
        </div>
      )}
    </div>
  )
}

export default ConnectButton
