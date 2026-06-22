import { create } from 'zustand'

/**
 * Web3 Wallet Store
 * Manages wallet connection, balances, and transaction states
 */
export const useWalletStore = create((set) => ({
  // Connection State
  account: null,
  isConnected: false,
  isLoading: false,
  error: null,

  // Balances
  balances: {
    ethereum: '0',
    bsc: '0',
    polygon: '0',
    solana: '0',
    tron: '0',
    sui: '0'
  },

  // Transfer State
  transferStatus: null,
  transferHash: null,

  // Actions
  setAccount: (account) => set({ account }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setBalances: (balances) => set({ balances }),
  setTransferStatus: (status) => set({ transferStatus: status }),
  setTransferHash: (hash) => set({ transferHash: hash }),

  // Reset
  reset: () => set({
    account: null,
    isConnected: false,
    error: null,
    balances: {
      ethereum: '0',
      bsc: '0',
      polygon: '0',
      solana: '0',
      tron: '0',
      sui: '0'
    }
  })
}))
