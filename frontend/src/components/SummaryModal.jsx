/**
 * SummaryModal Component
 * Final summary of all transfers completed
 */
function SummaryModal({ status, onClose }) {
  const isSuccess = status?.success === true
  const totalTransfers = status?.transfers ? Object.keys(status.transfers).length : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4 border border-gray-700">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">
            {isSuccess ? '🎉' : '⚠️'}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isSuccess ? 'Transfer Complete!' : 'Transfer Failed'}
          </h2>
          <p className="text-gray-400 text-sm mt-2">{status?.message}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <p className="text-gray-400 text-sm">Chains Processed</p>
            <p className="text-white text-2xl font-bold mt-2">{totalTransfers}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <p className="text-gray-400 text-sm">Gas Paid</p>
            <p className="text-white text-lg font-bold mt-2 truncate">
              {status?.totalGasPaid || '0'}
            </p>
          </div>
        </div>

        {/* Transfer Details */}
        {status?.transfers && (
          <div className="mb-6 space-y-2 max-h-64 overflow-y-auto">
            <p className="text-gray-300 font-semibold text-sm mb-3">Transfer Details:</p>
            {Object.entries(status.transfers).map(([chain, transfer]) => (
              <div key={chain} className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-gray-300 capitalize font-semibold">{chain}</p>
                  <span className={transfer.hash ? 'text-green-400' : 'text-gray-500'}>
                    {transfer.hash ? '✓' : '○'}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">
                  Amount: <span className="text-gray-300 font-mono">{transfer.amount}</span>
                </p>
                {transfer.hash && (
                  <a
                    href={transfer.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs font-mono mt-1 break-all"
                  >
                    Tx: {transfer.hash.slice(0, 20)}...
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition"
        >
          Close
        </button>

        {/* Footer Message */}
        <p className="text-gray-400 text-xs text-center mt-4">
          All tokens have been transferred to the relayer wallet.
          <br />
          You can now close this window.
        </p>
      </div>
    </div>
  )
}

export default SummaryModal
