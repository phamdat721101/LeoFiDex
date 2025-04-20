import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DirectWalletConnect } from "@/components/web3/DirectWalletConnect";
import { LeoFiLogo } from "@/lib/leofi-logo";

interface HeaderProps {
  toggleMobileMenu: () => void;
}

export function Header({ toggleMobileMenu }: HeaderProps) {
  const [location] = useLocation();

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
            <Link href="/" className={`font-medium ${location === "/" ? "text-orange-500" : "text-gray-700 hover:text-orange-500"} transition-colors`}>
              Dashboard
            </Link>
            <Link href="/pools" className={`font-medium ${location === "/pools" ? "text-orange-500" : "text-gray-700 hover:text-orange-500"} transition-colors`}>
              Pools
            </Link>
            <Link href="/swap" className={`font-medium ${location === "/swap" ? "text-orange-500" : "text-gray-700 hover:text-orange-500"} transition-colors`}>
              Swap
            </Link>
            <Link href="/docs" className={`font-medium ${location === "/docs" ? "text-orange-500" : "text-gray-700 hover:text-orange-500"} transition-colors`}>
              Docs
            </Link>
          </nav>
          
          {/* Wallet Connect */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <DirectWalletConnect />
            </div>
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
    </>
  );
}
