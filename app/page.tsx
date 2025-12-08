"use client";
import {
  useAuthModal,
  useLogout,
  useSignerStatus,
  useUser,
} from "@account-kit/react";
import { useConnect, injected, useConnection, useDisconnect } from "wagmi";

export default function Home() {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const { address, isConnected } = useConnection();

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-4 justify-center text-center">
      <div className="flex flex-col gap-10">
        <h1 className="font-semibold text-xl">Smart Wallets</h1>
        <div className="flex flex-col sm:flex-row gap-3 mx-auto justify-between w-xl">
          <div className="flex flex-col gap-4 p-4">
            <h2 className="">Alchemy</h2>
            {signerStatus.isInitializing ? (
              <>Loading...</>
            ) : user ? (
              <div className="flex flex-col gap-2 p-2">
                <p className="italic">
                  You're logged in as {user.address.slice(0, 6)}...
                  {user.address?.slice(-4) ?? "anon"}
                </p>
                <button
                  className="akui-btn akui-btn-primary mt-6"
                  onClick={() => logout()}
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                className="akui-btn akui-btn-primary"
                onClick={openAuthModal}
              >
                Login
              </button>
            )}
          </div>
          <div className="flex flex-col gap-4 p-4">
            <h2>EOA</h2>
            {isConnected ? (
              <div className="flex flex-col gap-2 p-2">
                <p className="italic">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                <button
                  className="akui-btn akui-btn-primary mt-6"
                  onClick={() => disconnect.mutate()}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                className="akui-btn akui-btn-primary"
                onClick={() => connect.mutate({ connector: injected() })}
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
