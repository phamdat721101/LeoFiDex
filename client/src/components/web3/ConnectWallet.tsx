import React, { useState } from 'react';
import { 
  useAccount, 
  useConnect, 
  useDisconnect,
  useBalance
} from 'wagmi';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function ConnectWallet() {
  const [open, setOpen] = useState(false);
  const { address, status, chainId } = useAccount();
  const { connectors, connect, isPending, isError } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({
    address,
    query: {
      enabled: !!address,
    }
  });

  // Check if wallet is connected
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || isPending;
  
  // Format address for display
  const formattedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  // Handle wallet connection
  const handleConnect = (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    if (connector) {
      connect({ connector });
      setOpen(false);
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            className="flex items-center gap-2 border-orange-200 text-sm"
            onClick={() => setOpen(true)}
          >
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="font-mono truncate max-w-[120px]">
              {formattedAddress}
            </span>
            {balanceData && (
              <span className="hidden md:inline-block">
                {parseFloat(balanceData.formatted).toFixed(4)} {balanceData.symbol}
              </span>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDisconnect}
            className="text-gray-500"
            aria-label="Disconnect wallet"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </Button>
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting
                </>
              ) : (
                'Connect Wallet'
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect your wallet</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => handleConnect(connector.id)}
                  disabled={!connector.ready || isConnecting}
                  className="w-full justify-start gap-4 bg-white text-black border hover:bg-gray-100"
                  variant="outline"
                >
                  {getWalletIcon(connector.id)}
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{getWalletName(connector.id)}</span>
                    {!connector.ready && <span className="text-xs text-gray-500">Not installed</span>}
                  </div>
                </Button>
              ))}
              {isError && (
                <div className="text-red-500 text-sm mt-2">
                  Error connecting. Please try again.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Helper functions to get wallet information
function getWalletName(id: string): string {
  switch (id) {
    case 'metaMask':
      return 'MetaMask';
    case 'walletConnect':
      return 'WalletConnect';
    case 'injected':
      return 'Browser Wallet';
    default:
      return id;
  }
}

function getWalletIcon(id: string) {
  switch (id) {
    case 'metaMask':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.1003 3L13.6 8.4L15.2 5.07692L21.1003 3Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2.8999 3L10.3315 8.46L8.7999 5.07692L2.8999 3Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.2307 16.4L16.0999 19.84L20.6307 21.16L21.8999 16.48L18.2307 16.4Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2.1099 16.48L3.3699 21.16L7.8999 19.84L5.7699 16.4L2.1099 16.48Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.63066 10.52L6.25977 12.56L10.7406 12.76L10.5697 7.92L7.63066 10.52Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.3691 10.52L13.3891 7.86L13.2598 12.76L17.7406 12.56L16.3691 10.52Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.8999 19.84L10.4307 18.42L8.2307 16.52L7.8999 19.84Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.5693 18.42L16.0993 19.84L15.7693 16.52L13.5693 18.42Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.0993 19.84L13.5693 18.42L13.7993 20.28L13.7693 21.1L16.0993 19.84Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.8999 19.84L10.2299 21.1L10.2099 20.28L10.4307 18.42L7.8999 19.84Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.2693 15.26L8.15967 14.54L9.63967 13.8L10.2693 15.26Z" fill="#233447" stroke="#233447" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.7305 15.26L14.3605 13.8L15.8405 14.54L13.7305 15.26Z" fill="#233447" stroke="#233447" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.8999 19.84L8.2599 16.4L5.7699 16.48L7.8999 19.84Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15.7402 16.4L16.1002 19.84L18.2309 16.48L15.7402 16.4Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17.7402 12.56L13.2598 12.76L13.7306 15.26L14.3602 13.8L15.8402 14.54L17.7402 12.56Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.15969 14.54L9.63969 13.8L10.2693 15.26L10.7401 12.76L6.25977 12.56L8.15969 14.54Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6.25977 12.56L8.23006 16.52L8.15969 14.54L6.25977 12.56Z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15.8401 14.54L15.7695 16.52L17.7401 12.56L15.8401 14.54Z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.7402 12.76L10.2695 15.26L10.8602 18.26L11.0095 14.44L10.7402 12.76Z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.2599 12.76L13.0003 14.42L13.1399 18.26L13.7307 15.26L13.2599 12.76Z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.7302 15.26L13.1396 18.26L13.5696 18.42L15.7696 16.52L15.8402 14.54L13.7302 15.26Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.15967 14.54L8.23004 16.52L10.4301 18.42L10.8601 18.26L10.2693 15.26L8.15967 14.54Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.7695 21.1L13.7995 20.28L13.5895 20.1H10.4094L10.2095 20.28L10.2295 21.1L7.8994 19.84L8.8594 20.62L10.3795 21.68H13.6194L15.1394 20.62L16.0994 19.84L13.7695 21.1Z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.5691 18.42L13.1392 18.26H10.8591L10.4292 18.42L10.2092 20.28L10.4092 20.1H13.5892L13.7992 20.28L13.5691 18.42Z" fill="#161616" stroke="#161616" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21.3696 8.26L22.0003 4.98L21.1003 3L13.5693 7.68L16.3693 10.52L20.5293 11.78L21.4493 10.68L21.0693 10.4L21.7093 9.84L21.2493 9.48L21.8893 9.02L21.3696 8.26Z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M1.99951 4.98L2.63951 8.26L2.09951 9.02L2.74951 9.48L2.28951 9.84L2.92951 10.4L2.54951 10.68L3.46951 11.78L7.62951 10.52L10.4295 7.68L2.89951 3L1.99951 4.98Z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20.5295 11.78L16.3695 10.52L17.7395 12.56L15.7695 16.52L18.2295 16.48H21.8995L20.5295 11.78Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.62987 10.52L3.46987 11.78L2.10986 16.48H5.76987L8.23987 16.52L6.25987 12.56L7.62987 10.52Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.2592 12.76L13.5692 7.68L14.7692 4.28H9.22925L10.4292 7.68L10.7392 12.76L10.8492 14.46L10.8592 18.26H13.1393L13.1493 14.46L13.2592 12.76Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'walletConnect':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.42858 8.57072C11.1223 5.99524 15.5352 5.99524 18.2289 8.57072L18.6749 8.99524C18.8281 9.1411 18.8281 9.37889 18.6749 9.52475L17.326 10.827C17.2495 10.8999 17.1257 10.8999 17.0492 10.827L16.4424 10.249C14.6231 8.5042 12.0344 8.5042 10.2151 10.249L9.56511 10.8784C9.48864 10.9513 9.36476 10.9513 9.28829 10.8784L7.93947 9.57617C7.7862 9.43031 7.7862 9.19252 7.93947 9.04665L8.42858 8.57072ZM20.5742 10.827L21.7772 11.9822C21.9305 12.1281 21.9305 12.3659 21.7772 12.5117L16.6429 17.4688C16.49 17.6146 16.2422 17.6146 16.0889 17.4684C16.0889 17.4684 16.0889 17.4684 16.0889 17.4684L12.5464 14.0662C12.5083 14.0297 12.4468 14.0297 12.4087 14.0662C12.4087 14.0662 12.4087 14.0662 12.4087 14.0662L8.86654 17.4684C8.71326 17.6146 8.46548 17.6146 8.31221 17.4684C8.31221 17.4684 8.31221 17.4684 8.31221 17.4684L3.17819 12.5113C3.02492 12.3654 3.02492 12.1276 3.17819 11.9818L4.38145 10.827C4.53473 10.6811 4.78251 10.6811 4.93578 10.827L8.47867 14.2292C8.5167 14.2657 8.57825 14.2657 8.61628 14.2292C8.61628 14.2292 8.61628 14.2292 8.61628 14.2292L12.1582 10.827C12.3114 10.6811 12.5592 10.6811 12.7125 10.827C12.7125 10.827 12.7125 10.827 12.7125 10.827L16.2551 14.2292C16.2931 14.2657 16.3547 14.2657 16.3927 14.2292L19.9352 10.827C20.0885 10.6811 20.3363 10.6811 20.4896 10.827L20.5742 10.827Z" fill="#3B99FC"/>
        </svg>
      );
    case 'injected':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="12" fill="#F6F7F9"/>
          <path d="M12 4V12M12 12V20M12 12H20M12 12H4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="12" fill="#F6F7F9"/>
          <path d="M12 4V12M12 12V20M12 12H20M12 12H4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
  }
}