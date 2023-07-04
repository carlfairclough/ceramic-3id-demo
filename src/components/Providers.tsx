"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { FC, ReactNode } from "react";
import { ChakraProvider } from "@chakra-ui/react";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient } = configureChains([mainnet], [publicProvider()]);
import { extendTheme } from "@chakra-ui/react";

const { connectors } = getDefaultWallets({
  appName: "Ceramic demo",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJ as string,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
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

export const Providers: FC<{ children: ReactNode }> = ({ children }) => (
  <ChakraProvider theme={theme}>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  </ChakraProvider>
);
