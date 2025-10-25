import { getDefaultConfig } from "@rainbow-me/rainbowkit";

import { appChains } from "./chains";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "something_just_like_that";
if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID && process.env.NODE_ENV === "development") {
  console.warn(
    "Using fallback WalletConnect project ID. Provide NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID for production environments.",
  );
}

export const wagmiConfig = getDefaultConfig({
  appName: "Nullwire Notary",
  projectId: walletConnectProjectId,
  chains: appChains,
  ssr: true,
});

export { appChains };

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
