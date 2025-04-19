import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FaWallet } from "react-icons/fa";
import { BsCoin } from "react-icons/bs";
import { MdAccountBalanceWallet } from "react-icons/md";

interface WalletConnectProps {
  onClose: () => void;
}

export function WalletConnect({ onClose }: WalletConnectProps) {
  const { connect, disconnect, address } = useWallet();

  const handleConnect = (provider: string) => {
    connect(provider);
    onClose();
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Connect Wallet</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {!address ? (
          <div className="grid grid-cols-1 gap-3">
            <Button 
              variant="outline" 
              className="flex items-center justify-between h-16 px-4"
              onClick={() => handleConnect("metamask")}
            >
              <div className="flex items-center">
                <FaWallet className="w-8 h-8 mr-3 text-orange-500" />
                <span className="font-medium">MetaMask</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-between h-16 px-4"
              onClick={() => handleConnect("walletconnect")}
            >
              <div className="flex items-center">
                <MdAccountBalanceWallet className="w-8 h-8 mr-3 text-blue-500" />
                <span className="font-medium">WalletConnect</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-between h-16 px-4"
              onClick={() => handleConnect("coinbase")}
            >
              <div className="flex items-center">
                <BsCoin className="w-8 h-8 mr-3 text-blue-600" />
                <span className="font-medium">Coinbase Wallet</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Connected with</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaWallet className="w-6 h-6 mr-2 text-orange-500" />
                  <span className="font-medium">MetaMask</span>
                </div>
                <span className="font-mono text-sm">{address.slice(0, 6)}...{address.slice(-4)}</span>
              </div>
            </div>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-500">
          By connecting your wallet, you agree to our <a href="#" className="text-orange-500 hover:underline">Terms of Service</a> and <a href="#" className="text-orange-500 hover:underline">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}
