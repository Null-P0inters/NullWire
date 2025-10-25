import { defineChain } from "viem";
import { mainnet, sepolia } from "wagmi/chains";

export const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Celo Sepolia Testnet",
    symbol: "CELO",
  },
  rpcUrls: {
    default: {
      http: ["https://forno.celo-sepolia.celo-testnet.org/"],
    },
    public: {
      http: ["https://forno.celo-sepolia.celo-testnet.org/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Celo Sepolia Explorer",
      url: "https://celo-sepolia.blockscout.com/",
    },
  },
  testnet: true,
});

export const appChains = [celoSepolia, sepolia, mainnet] as const;
