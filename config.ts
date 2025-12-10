// @noErrors
import { createConfig, cookieStorage } from "@account-kit/react";
import { QueryClient } from "@tanstack/react-query";
import { baseSepolia, alchemy } from "@account-kit/infra";

export const config = createConfig(
  {
    transport: alchemy({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
    }),
    chain: baseSepolia,
    ssr: true,
    storage: cookieStorage,
    enablePopupOauth: true,
    // Learn more here: https://www.alchemy.com/docs/wallets/transactions/sponsor-gas
    policyId: process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID!,
  },
  {
    auth: {
      sections: [
        [{ type: "email", emailMode: "otp" }],
        [
          { type: "passkey" },
          { type: "social", authProviderId: "google", mode: "popup" },
        ],
      ],
      addPasskeyOnSignup: true,
    },
  }
);

export const queryClient = new QueryClient();
