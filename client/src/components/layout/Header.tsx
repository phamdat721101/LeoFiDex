import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/web3/WalletConnect";
import { LeoFiLogo } from "@/lib/leofi-logo";

interface HeaderProps {
  toggleMobileMenu: () => void;
}

export function Header({ toggleMobileMenu }: HeaderProps) {
  const [location] = useLocation();
  const { address } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const openWalletModal = () => {
    setShowWalletModal(true);
  };

  const closeWalletModal = () => {
    setShowWalletModal(false);
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeWalletModal();
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <LeoFiLogo className="w-8 h-8 mr-2" />
              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">LeoFi</span>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className={`font-medium ${location === "/" ? "text-orange-500" : "text-gray-700 hover:text-orange-500"} transition-colors`}>
                Dashboard
              </a>
            </Link>
            <Link href="/pools">
              <a className={`font-medium ${location === "/pools" ? "text-orange-500" : "text-gray-700 hover:text-orange-500"} transition-colors`}>
                Pools
              </a>
            </Link>
            <Link href="/swap">
              <a className={`font-medium ${location === "/swap" ? "text-orange-500" : "text-gray-700 hover:text-orange-500"} transition-colors`}>
                Swap
              </a>
            </Link>
            <Link href="/docs">
              <a className={`font-medium ${location === "/docs" ? "text-orange-500" : "text-gray-700 hover:text-orange-500"} transition-colors`}>
                Docs
              </a>
            </Link>
          </nav>
          
          {/* Wallet Connect */}
          <div>
            {address ? (
              <Button 
                variant="outline" 
                className="hidden md:flex items-center gap-2 border-orange-200"
                onClick={openWalletModal}
              >
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="font-mono text-sm truncate max-w-[120px]">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </Button>
            ) : (
              <Button 
                className="hidden md:block bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white"
                onClick={openWalletModal}
              >
                Connect Wallet
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Wallet Connect Modal */}
      {showWalletModal && (
        <WalletConnect onClose={closeWalletModal} />
      )}
    </>
  );
}
