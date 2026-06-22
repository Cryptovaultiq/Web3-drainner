/**
 * TransferModal Component
 * Shows transfer progress and status
 */
function TransferModal({ status }) {
  const isSuccess = status?.success === true
  const isProcessing = status?.status === 'processing'

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        {isProcessing ? (
          <span className="animate-spin">⏳</span>
        ) : isSuccess ? (
          <span>✅</span>
        ) : (
          <span>❌</span>
        )}
        Transfer Status
      </h2>

      <div className="space-y-4">
        {/* Message */}
        <div className={`p-4 rounded-lg border ${
          isSuccess
            ? 'bg-green-900 border-green-700 text-green-200'
            : isProcessing
            ? 'bg-blue-900 border-blue-700 text-blue-200'
            : 'bg-red-900 border-red-700 text-red-200'
        }`}>
          <p className="font-semibold">{status?.message || 'Processing transfer...'}</p>
        </div>

        {/* Details */}
        {status?.transfers && (
          <div className="space-y-2">
            <p className="text-gray-300 font-semibold text-sm">Chain Transfers:</p>
            {Object.entries(status.transfers).map(([chain, transfer]) => (
              <div key={chain} className="bg-gray-700 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-300 capitalize font-semibold">{chain}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Amount: {transfer.amount}
                    </p>
                  </div>
                  <div className="text-right">
                    {transfer.hash ? (
                      <a
                        href={transfer.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs font-mono"
                      >
                        {transfer.hash.slice(0, 10)}...
                      </a>
                    ) : (
                      <span className="text-gray-500 text-xs">Pending...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gas Info */}
        {status?.totalGasPaid && (
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <p className="text-gray-300 text-sm">
              <span className="font-semibold">⛽ Gas Paid by Relayer:</span> {status.totalGasPaid}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransferModal
