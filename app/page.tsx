"use client";
import {
  useAuthModal,
  useLogout,
  useSignerStatus,
  useUser,
  useSendCalls,
  useSmartAccountClient,
} from "@account-kit/react";
import { encodeFunctionData, parseUnits, formatUnits } from "viem";
import { mockTokenAbi } from "@/utils/abi";
import { MOCK_TOKEN_ADDRESS } from "@/utils/constants";
import { useEffect, useState } from "react";

export default function Home() {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout();
  const { client } = useSmartAccountClient({
    type: "LightAccount",
    accountParams: {},
  });

  const [balance, setBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const { sendCallsAsync, isSendingCalls, sendCallsResult } = useSendCalls({
    client,
  });

  const fetchBalance = async () => {
    if (!client?.account?.address) return;

    setIsLoadingBalance(true);
    try {
      const balanceData = await client.readContract({
        address: MOCK_TOKEN_ADDRESS,
        abi: mockTokenAbi,
        functionName: "balanceOf",
        args: [client.account.address],
      });

      setBalance(formatUnits(balanceData as bigint, 18));
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (client?.account?.address) {
      fetchBalance();
    }
  }, [client?.account?.address]);

  useEffect(() => {
    if (sendCallsResult?.ids?.[0]) {
      const timer = setTimeout(() => {
        fetchBalance();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sendCallsResult?.ids]);

  const handleMint = async () => {
    if (!client) {
      throw new Error("Smart account client not connected");
    }

    try {
      const { ids } = await sendCallsAsync({
        capabilities: {
          paymasterService: {
            policyId: process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID!,
          },
        },
        calls: [
          {
            to: MOCK_TOKEN_ADDRESS,
            data: encodeFunctionData({
              abi: mockTokenAbi,
              functionName: "mintYourself",
              args: [parseUnits("1000", 18)],
            }),
          },
        ],
      });

      console.log("Transaction sent with ID:", ids[0]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 md:p-24">
      <div className="w-full max-w-2xl flex flex-col gap-8 sm:gap-10">
        <h1 className="font-semibold text-xl text-center">
          Smart Wallets Demo
        </h1>

        <div className="w-full p-6 sm:p-8">
          {signerStatus.isInitializing ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading...
              </p>
            </div>
          ) : user ? (
            <div className="flex flex-col gap-6">
              <div className="p-4 space-y-3">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Smart Wallet Address
                  </p>
                  <p className="font-mono text-sm sm:text-base break-all">
                    {client?.account?.address || user.address}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Signer Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        signerStatus.isConnected ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <p className="text-sm sm:text-base">
                      {signerStatus.isConnected ? "Connected" : "Disconnected"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-foreground/10 p-6 text-center">
                <p className="text-xs sm:text-sm mb-2">Token Balance</p>
                {isLoadingBalance ? (
                  <>
                    <div className="animate-pulse">
                      <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32 mx-auto"></div>
                    </div>
                  </>
                ) : (
                  <p className="text-3xl sm:text-4xl font-bold">
                    {parseFloat(balance).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    <span className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
                      TOK
                    </span>
                  </p>
                )}
                <button
                  onClick={fetchBalance}
                  disabled={isLoadingBalance}
                  className="mt-3 text-xs sm:text-sm cursor-pointer hover:underline disabled:opacity-50"
                >
                  Refresh Balance
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="akui-btn akui-btn-primary rounded-none flex-1 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleMint}
                  disabled={
                    isSendingCalls || !client || !signerStatus.isConnected
                  }
                >
                  {isSendingCalls ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Minting...
                    </span>
                  ) : !client ? (
                    "Wallet Loading..."
                  ) : !signerStatus.isConnected ? (
                    "Signer Disconnected"
                  ) : (
                    "Mint 1,000 Tokens"
                  )}
                </button>

                <button
                  className="akui-btn rounded-none border border-foreground/30 flex-1 sm:flex-none py-3 text-base"
                  onClick={() => logout()}
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center">
                Connect your wallet to get started
              </p>
              <button
                className="akui-btn akui-btn-primary rounded-none w-full sm:w-auto px-8 py-3 text-base"
                onClick={openAuthModal}
              >
                Login
              </button>
            </div>
          )}
        </div>

        <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by Alchemy Account Kit</p>
          <p className="mt-1">Base Sepolia Testnet</p>
        </div>
      </div>
    </main>
  );
}
