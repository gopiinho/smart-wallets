"use client";
import { queryClient, config } from "@/config";
import {
  AlchemyAccountProvider,
  AlchemyAccountsProviderProps,
} from "@account-kit/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { wagmiConfig } from "@/wagmiConfig";
import { WagmiProvider } from "wagmi";

export const Providers = (
  props: PropsWithChildren<{
    initialState?: AlchemyAccountsProviderProps["initialState"];
  }>
) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AlchemyAccountProvider
          config={config}
          queryClient={queryClient}
          initialState={props.initialState}
        >
          {props.children}
        </AlchemyAccountProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
