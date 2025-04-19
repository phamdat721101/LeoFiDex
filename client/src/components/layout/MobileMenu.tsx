import { Link } from "wouter";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { WalletConnect } from "@/components/web3/WalletConnect";

export function MobileMenu() {
  const { address } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const openWalletModal = () => {
    setShowWalletModal(true);
  };

  const closeWalletModal = () => {
    setShowWalletModal(false);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-4 bg-white border-b border-gray-200 md:hidden">
        <nav className="flex flex-col space-y-4">
          <Link href="/">
            <a className="font-medium text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100">Dashboard</a>
          </Link>
          <Link href="/pools">
            <a className="font-medium text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100">Pools</a>
          </Link>
          <Link href="/swap">
            <a className="font-medium text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100">Swap</a>
          </Link>
          <Link href="/docs">
            <a className="font-medium text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100">Docs</a>
          </Link>
          {address ? (
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 border-orange-200"
              onClick={openWalletModal}
            >
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="font-mono text-sm">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </Button>
          ) : (
            <Button 
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white"
              onClick={openWalletModal}
            >
              Connect Wallet
            </Button>
          )}
        </nav>
      </div>

      {/* Wallet Connect Modal */}
      {showWalletModal && (
        <WalletConnect onClose={closeWalletModal} />
      )}
    </>
  );
}
