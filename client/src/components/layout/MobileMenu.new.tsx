import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DirectWalletConnect } from "@/components/web3/DirectWalletConnect";

export function MobileMenu() {
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
          <div className="py-2">
            <DirectWalletConnect />
          </div>
        </nav>
      </div>
    </>
  );
}