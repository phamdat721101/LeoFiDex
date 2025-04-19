import { useWagmiWallet } from "@/hooks/useWagmiWallet";
import { Button } from "@/components/ui/button";
import { X, ChevronRight } from "lucide-react";
import { FaWallet } from "react-icons/fa";
import { BsCoin } from "react-icons/bs";
import { MdAccountBalanceWallet } from "react-icons/md";
import { truncateMiddle } from "@/lib/formatters";
import { useState } from "react";
import { ConnectorType } from "@/hooks/useWagmiWallet";

interface WalletConnectProps {
  onClose: () => void;
}

export function WalletConnect({ onClose }: WalletConnectProps) {
  const { connect, disconnect, address, isConnected, isLoading, balance, chainId } = useWagmiWallet();
  const [connectingType, setConnectingType] = useState<ConnectorType | null>(null);

  // Handle connect button click
  const handleConnect = async (provider: ConnectorType) => {
    setConnectingType(provider);
    try {
      await connect(provider);
      onClose();
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    } finally {
      setConnectingType(null);
    }
  };

  // Handle disconnect button click
  const handleDisconnect = async () => {
    try {
      await disconnect();
      onClose();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  // Close modal when clicking the backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get correct icon for the wallet that is connected
  const getWalletIcon = () => {
    if (!address) return <FaWallet className="w-6 h-6 mr-2 text-orange-500" />;
    
    // This is a placeholder. In a real app, you would detect the wallet type
    return <FaWallet className="w-6 h-6 mr-2 text-orange-500" />;
  };

  // Get wallet name
  const getWalletName = () => {
    if (!address) return "Unknown";
    
    // This is a placeholder. In a real app, you would detect the wallet type
    return "Wallet";
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Connect Wallet</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {!isConnected ? (
          <div className="grid grid-cols-1 gap-3">
            <Button 
              variant="outline" 
              className="flex items-center justify-between h-16 px-4"
              onClick={() => handleConnect("metamask")}
              disabled={isLoading || connectingType !== null}
            >
              <div className="flex items-center">
                <FaWallet className="w-8 h-8 mr-3 text-orange-500" />
                <span className="font-medium">MetaMask</span>
              </div>
              {connectingType === "metamask" ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-between h-16 px-4"
              onClick={() => handleConnect("walletconnect")}
              disabled={isLoading || connectingType !== null}
            >
              <div className="flex items-center">
                <MdAccountBalanceWallet className="w-8 h-8 mr-3 text-blue-500" />
                <span className="font-medium">WalletConnect</span>
              </div>
              {connectingType === "walletconnect" ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-between h-16 px-4"
              onClick={() => handleConnect("coinbase")}
              disabled={isLoading || connectingType !== null}
            >
              <div className="flex items-center">
                <BsCoin className="w-8 h-8 mr-3 text-blue-600" />
                <span className="font-medium">Coinbase Wallet</span>
              </div>
              {connectingType === "coinbase" ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-between h-16 px-4"
              onClick={() => handleConnect("injected")}
              disabled={isLoading || connectingType !== null}
            >
              <div className="flex items-center">
                <MdAccountBalanceWallet className="w-8 h-8 mr-3 text-gray-500" />
                <span className="font-medium">Other Wallet</span>
              </div>
              {connectingType === "injected" ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Connected with</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getWalletIcon()}
                  <span className="font-medium">{getWalletName()}</span>
                </div>
                <span className="font-mono text-sm">
                  {address ? truncateMiddle(address, 6, 4) : ''}
                </span>
              </div>
            </div>
            
            {balance && (
              <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Balance</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{balance.formatted}</span>
                  <span>{balance.symbol}</span>
                </div>
              </div>
            )}
            
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleDisconnect}
              disabled={isLoading}
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
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
