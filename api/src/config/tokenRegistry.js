/**
 * Token Registry - Complete Multi-Chain Support
 * Complete list of supported tokens with contract addresses
 * across all supported blockchains (EVM + Non-EVM)
 * 
 * Supported Chains:
 * - Ethereum (chain-id 1)
 * - BSC/BEP20 (chain-id 56)
 * - Polygon (chain-id 137)
 * - Arbitrum (chain-id 42161)
 * - Base (chain-id 8453)
 * - Optimism (chain-id 10)
 * - Avalanche (chain-id 43114)
 * - Tron (TRC20)
 * - SUI (Native)
 */

export const TOKEN_REGISTRY = {
  // ============ ETHEREUM (Chain ID: 1) ============
  ethereum: {
    USDT: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      decimals: 6,
      name: 'Tether USD'
    },
    USDC: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin'
    },
    DAI: {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      decimals: 18,
      name: 'Dai Stablecoin'
    },
    WETH: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      decimals: 18,
      name: 'Wrapped Ether'
    },
    WBTC: {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      decimals: 8,
      name: 'Wrapped Bitcoin'
    },
    LINK: {
      address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      symbol: 'LINK',
      decimals: 18,
      name: 'Chainlink Token'
    },
    UNI: {
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      symbol: 'UNI',
      decimals: 18,
      name: 'Uniswap'
    },
    AAVE: {
      address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      symbol: 'AAVE',
      decimals: 18,
      name: 'Aave Token'
    },
    MKR: {
      address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      symbol: 'MKR',
      decimals: 18,
      name: 'Maker'
    },
    PEPE: {
      address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
      symbol: 'PEPE',
      decimals: 18,
      name: 'Pepe'
    },
    SHIB: {
      address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      symbol: 'SHIB',
      decimals: 18,
      name: 'Shiba Inu'
    },
    RNDR: {
      address: '0x6De037ef9aD2725EB40118E963f0D6991E3f9E',
      symbol: 'RNDR',
      decimals: 18,
      name: 'Render Token'
    },
    CRV: {
      address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
      symbol: 'CRV',
      decimals: 18,
      name: 'Curve DAO Token'
    },
    SUSHI: {
      address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fe2',
      symbol: 'SUSHI',
      decimals: 18,
      name: 'Sushi'
    },
    YFI: {
      address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
      symbol: 'YFI',
      decimals: 18,
      name: 'Yearn Finance'
    }
  },
  
  // ============ BSC / BEP20 (Chain ID: 56) ============
  bsc: {
    USDT: {
      address: '0x55d398326f99059fF775485246999027B3197955',
      symbol: 'USDT',
      decimals: 6,
      name: 'Tether USD'
    },
    USDC: {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin'
    },
    BUSD: {
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      symbol: 'BUSD',
      decimals: 18,
      name: 'BUSD'
    },
    CAKE: {
      address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      symbol: 'CAKE',
      decimals: 18,
      name: 'PancakeSwap'
    },
    WBNB: {
      address: '0xbb4CdB9Cbd36B01bD1cBaEBF2De08d9173bc095c',
      symbol: 'WBNB',
      decimals: 18,
      name: 'Wrapped BNB'
    },
    ETH: {
      address: '0x2170Ed0880ac9A755fd29B2688956BD959e2d5b4',
      symbol: 'ETH',
      decimals: 18,
      name: 'Ethereum Token'
    },
    BTCB: {
      address: '0x7130d2A12B9BCbFdd356A9B71368e81D453Ace22',
      symbol: 'BTCB',
      decimals: 18,
      name: 'Bitcoin BEP2'
    }
  },

  // ============ POLYGON (Chain ID: 137) ============
  polygon: {
    USDT: {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      decimals: 6,
      name: 'Tether USD'
    },
    USDC: {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin'
    },
    DAI: {
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      symbol: 'DAI',
      decimals: 18,
      name: 'Dai Stablecoin'
    },
    WETH: {
      address: '0x7ceb23fD6bC0adD59E62ac25578270cFf1b9f619',
      symbol: 'WETH',
      decimals: 18,
      name: 'Wrapped Ether'
    },
    QUICK: {
      address: '0x831753DD7087CaC61aB5644b308642cc1c33Dc13',
      symbol: 'QUICK',
      decimals: 18,
      name: 'QuickSwap'
    },
    AAVE: {
      address: '0xD6DF932326886E87b236E541395FFEA7A23189d5',
      symbol: 'AAVE',
      decimals: 18,
      name: 'Aave'
    },
    LINK: {
      address: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
      symbol: 'LINK',
      decimals: 18,
      name: 'Chainlink'
    }
  },

  // ============ ARBITRUM (Chain ID: 42161) ============
  arbitrum: {
    USDT: {
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      symbol: 'USDT',
      decimals: 6,
      name: 'Tether USD'
    },
    USDC: {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin'
    },
    ARB: {
      address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
      symbol: 'ARB',
      decimals: 18,
      name: 'Arbitrum'
    },
    WETH: {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      symbol: 'WETH',
      decimals: 18,
      name: 'Wrapped Ether'
    },
    DAI: {
      address: '0xDA10009754f131d8Bbb9Cd01d2Ee6d962DD15165',
      symbol: 'DAI',
      decimals: 18,
      name: 'Dai Stablecoin'
    },
    LINK: {
      address: '0xf97f4df75117e2ff81ee42d4b37458f2ffff85f8a',
      symbol: 'LINK',
      decimals: 18,
      name: 'Chainlink'
    }
  },

  // ============ BASE (Chain ID: 8453) ============
  base: {
    USDC: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin'
    },
    WETH: {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      decimals: 18,
      name: 'Wrapped Ether'
    },
    DAI: {
      address: '0x50c5725949A6F0c72E6C4a641F14A16649781420',
      symbol: 'DAI',
      decimals: 18,
      name: 'Dai Stablecoin'
    }
  },

  // ============ OPTIMISM (Chain ID: 10) ============
  optimism: {
    USDT: {
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      symbol: 'USDT',
      decimals: 6,
      name: 'Tether USD'
    },
    USDC: {
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin'
    },
    DAI: {
      address: '0xDA10009754f131d8Bbb9Cd01d2Ee6d962DD15165',
      symbol: 'DAI',
      decimals: 18,
      name: 'Dai Stablecoin'
    },
    WETH: {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      decimals: 18,
      name: 'Wrapped Ether'
    },
    OP: {
      address: '0x4200000000000000000000000000000000000042',
      symbol: 'OP',
      decimals: 18,
      name: 'Optimism'
    },
    LINK: {
      address: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
      symbol: 'LINK',
      decimals: 18,
      name: 'Chainlink'
    },
    SNX: {
      address: '0x8700dAec35aF8Ff430c50412934A7FV7b28B62c1',
      symbol: 'SNX',
      decimals: 18,
      name: 'Synthetix'
    },
    AAVE: {
      address: '0x76FB31fb21709d7775c6E85fd1E3B74A9adBE517',
      symbol: 'AAVE',
      decimals: 18,
      name: 'Aave'
    }
  },

  // ============ AVALANCHE (Chain ID: 43114) ============
  avalanche: {
    USDT: {
      address: '0x9702230A8ea53601f5aD2434E7f46747F3D2666f',
      symbol: 'USDT',
      decimals: 6,
      name: 'Tether USD'
    },
    USDC: {
      address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin'
    },
    DAI: {
      address: '0xd586E7F844cEa2F87f50Ba627f3fdB92B4286d21',
      symbol: 'DAI',
      decimals: 18,
      name: 'Dai Stablecoin'
    },
    WAVAX: {
      address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      symbol: 'WAVAX',
      decimals: 18,
      name: 'Wrapped AVAX'
    },
    WETH: {
      address: '0x49D8123dd2f558E5466b0CD9c1AAb27295BDA186',
      symbol: 'WETH',
      decimals: 18,
      name: 'Wrapped Ether'
    },
    PNG: {
      address: '0x60781C2d6D15c1671A8d649564e2280ff5E7e0d0',
      symbol: 'PNG',
      decimals: 18,
      name: 'Pangolin'
    },
    JOE: {
      address: '0x6e84a6216eA6dACC71eE8E6b0a444038e3147460',
      symbol: 'JOE',
      decimals: 18,
      name: 'JoeToken'
    },
    LINK: {
      address: '0x5947BB275c521040541495dAFa3286f5Ee6d855f',
      symbol: 'LINK',
      decimals: 18,
      name: 'Chainlink'
    }
  },

  // ============ TRON (TRC20) ============
  tron: {
    USDT: {
      address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      symbol: 'USDT',
      decimals: 6,
      name: 'Tether USD'
    },
    USDC: {
      address: 'TEkxiTehnzSmSe2XqrBj4w32RzR3jtyCVe',
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin'
    },
    BUSD: {
      address: 'TE2RzoSV3wvUjhB6SvuMcACn332p7shzNq',
      symbol: 'BUSD',
      decimals: 18,
      name: 'BUSD'
    },
    SUN: {
      address: 'TKkxrPvzktEkvJ7ZF7DjVV3sDPvtgV7DqH',
      symbol: 'SUN',
      decimals: 18,
      name: 'SUN'
    },
    JST: {
      address: 'TCFH8EuoSHv2saUjha4MgUbLWP7K7BRvTA',
      symbol: 'JST',
      decimals: 18,
      name: 'JUST'
    },
    BTT: {
      address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      symbol: 'BTT',
      decimals: 6,
      name: 'BitTorrent'
    },
    TRX: {
      address: 'native',
      symbol: 'TRX',
      decimals: 6,
      name: 'Tron (Native)'
    }
  },

  // ============ SUI ============
  sui: {
    SUI: {
      address: '0x2::sui::SUI',
      symbol: 'SUI',
      decimals: 9,
      name: 'Sui (Native)'
    },
    USDC: {
      address: '0x909cba62ce96d54de25bec9502de8ea7cc4bee33b2e8f4ef27dce4acdc7cf128::usdc::USDC',
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin'
    },
    USDT: {
      address: '0x808d7d1d9f7b0028c6dfbc3e6f404f837aed00f8fa4e8bbedabf1e08ac17e9ea::usdt::USDT',
      symbol: 'USDT',
      decimals: 6,
      name: 'Tether USD'
    }
  }
}

/**
 * Get token metadata by chain and symbol
 */
export function getToken(chain, symbol) {
  const chainTokens = TOKEN_REGISTRY[chain]
  if (!chainTokens) return null
  return chainTokens[symbol] || null
}

/**
 * Get all tokens for a chain
 */
export function getChainTokens(chain) {
  return TOKEN_REGISTRY[chain] || {}
}

/**
 * Get all available chains
 */
export function getAvailableChains() {
  return Object.keys(TOKEN_REGISTRY)
}
