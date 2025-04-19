import React, { useState } from 'react';
import { useWagmiWallet } from '@/hooks/useWagmiWalletV2';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { truncateMiddle } from '@/lib/formatters';
import { WalletConnect } from './WalletConnect';
import { 
  Wallet, 
  LogOut, 
  Copy, 
  ExternalLink, 
  ChevronDown
} from 'lucide-react';
import { NETWORK_PARAMS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

export function WalletStatusV2() {
  const { 
    address, 
    isConnected, 
    chainId, 
    balance, 
    disconnect, 
    isLoading,
    networkName
  } = useWagmiWallet();
  
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { toast } = useToast();
  
  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: 'Address copied',
        description: 'Wallet address copied to clipboard',
      });
    }
  };
  
  const handleOpenExplorer = () => {
    if (address && chainId) {
      const explorerUrl = NETWORK_PARAMS[chainId]?.blockExplorerUrls?.[0];
      if (explorerUrl) {
        window.open(`${explorerUrl}/address/${address}`, '_blank');
      }
    }
  };
  
  const openWalletModal = () => {
    setIsWalletModalOpen(true);
  };
  
  const closeWalletModal = () => {
    setIsWalletModalOpen(false);
  };
  
  if (!isConnected) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="ml-2"
          onClick={openWalletModal}
          disabled={isLoading}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
        {isWalletModalOpen && <WalletConnect onClose={closeWalletModal} />}
      </>
    );
  }
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
          >
            <div className="flex items-center">
              {networkName && (
                <span className="mr-2 text-xs font-medium">
                  {networkName}
                </span>
              )}
              <span className="font-mono text-xs">
                {truncateMiddle(address || '', 4, 4)}
              </span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm">Wallet</span>
              {balance && (
                <span className="text-xs text-muted-foreground mt-1">
                  {balance.formatted} {balance.symbol}
                </span>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Card className="border-0 shadow-none">
            <CardContent className="p-2">
              <div className="text-xs font-mono bg-muted p-2 rounded-md break-all">
                {address}
              </div>
            </CardContent>
          </Card>
          <DropdownMenuItem onClick={handleCopyAddress}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy Address</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenExplorer}>
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>View on Explorer</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => disconnect()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isWalletModalOpen && <WalletConnect onClose={closeWalletModal} />}
    </>
  );
}