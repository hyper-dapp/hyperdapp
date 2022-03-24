export enum Chains {
  MAINNET = "0x1",
  ROPSTEN = "0x3",
  RINKEBY = "0x4",
  GOERLY = "0x5",
  KOVAN = "0x2a",
  LOCAL = "0x539",
  AVALANCHE = "0xa86a",
  BINANCE_SMART_CHAIN = "0x38",
  BINANCE_SMART_CHAIN_TESTNET = "0x61",
  POLYGON = "0x89",
  MUMBAI = "0x13881",
}

interface NetworkConfig {
  blockExplorerUrl?: string;
  chainId?: number;
  chainName?: string;
  currencyName?: string;
  currencySymbol?: string;
  etherscanAPI?: string;
  rpcUrl?: string;
  wrapped?: string;
}

export const networkConfigs: { [key in Chains]: NetworkConfig } = {
  [Chains.MAINNET]: {
    chainName: "mainnet",
    currencySymbol: "ETH",
    blockExplorerUrl: "https://etherscan.io/",
    etherscanAPI: "https://api.etherscan.io/api",
    wrapped: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  },
  [Chains.ROPSTEN]: {
    chainName: "ropsten",
    currencySymbol: "ETH",
    etherscanAPI: "https://api-ropsten.etherscan.io/api",
    blockExplorerUrl: "https://ropsten.etherscan.io/",
  },
  [Chains.RINKEBY]: {
    chainName: "rinkeby",
    currencySymbol: "ETH",
    etherscanAPI: "https://api-rinkeby.etherscan.io/api",
    blockExplorerUrl: "https://rinkeby.etherscan.io/",
  },
  [Chains.GOERLY]: {
    chainName: "goerli",
    currencySymbol: "ETH",
    etherscanAPI: "https://api-goerli.etherscan.io/api",
    blockExplorerUrl: "https://goerli.etherscan.io/",
  },
  [Chains.KOVAN]: {
    chainName: "kovan",
    currencySymbol: "ETH",
    etherscanAPI: "https://api-kovan.etherscan.io/api",
    blockExplorerUrl: "https://kovan.etherscan.io/",
  },
  [Chains.LOCAL]: {
    chainName: "Local Chain",
    currencyName: "ETH",
    currencySymbol: "ETH",
    rpcUrl: "http://127.0.0.1:7545",
  },
  [Chains.AVALANCHE]: {
    chainId: 43114,
    chainName: "Avalanche Mainnet",
    currencyName: "AVAX",
    currencySymbol: "AVAX",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorerUrl: "https://cchain.explorer.avax.network/",
  },
  [Chains.BINANCE_SMART_CHAIN]: {
    chainId: 56,
    chainName: "Smart Chain",
    currencyName: "BNB",
    currencySymbol: "BNB",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    blockExplorerUrl: "https://bscscan.com/",
    wrapped: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  },
  [Chains.BINANCE_SMART_CHAIN_TESTNET]: {
    chainId: 97,
    chainName: "Smart Chain - Testnet",
    currencyName: "BNB",
    currencySymbol: "BNB",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    blockExplorerUrl: "https://testnet.bscscan.com/",
  },
  [Chains.POLYGON]: {
    chainId: 137,
    chainName: "Polygon Mainnet",
    currencyName: "MATIC",
    currencySymbol: "MATIC",
    rpcUrl: "https://rpc-mainnet.maticvigil.com/",
    blockExplorerUrl: "https://explorer-mainnet.maticvigil.com/",
    wrapped: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  },
  [Chains.MUMBAI]: {
    chainId: 80001,
    chainName: "Mumbai",
    currencyName: "MATIC",
    currencySymbol: "MATIC",
    rpcUrl: "https://rpc-mumbai.matic.today/",
    blockExplorerUrl: "https://mumbai.polygonscan.com/",
  },
};

export const getNativeByChain = (chain: Chains): string => {
  return networkConfigs[chain]?.currencySymbol || "NATIVE";
};

export const getChainName = (chain: Chains): string => {
  return networkConfigs[chain]?.chainName || "";
};

export const getChainById = (chain: Chains): string => {
  return `${networkConfigs[chain]?.chainId || ""}`;
};

export const getExplorer = (chain: string): string => {
  return networkConfigs[chain as Chains]?.blockExplorerUrl || "";
};

export const getWrappedNative = (chain: Chains): string => {
  return networkConfigs[chain]?.wrapped || "";
};
