import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import {
  arbitrum,
  goerli,
  mainnet,
  optimism,
  polygon,
  zora,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

import { Chain } from "wagmi";
// const c: Chain = 'eip155:1'
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, optimism],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "RainbowKit App",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJ as string,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const theme = extendTheme({
  styles: {
    global: () => ({
      body: {
        bg: "#f2f2f2",
      },
    }),
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
