import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { Button } from './ui/button';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import { CONTRACT_ADDRESSES } from '@/contracts/addresses';
import { formatEther } from 'viem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Get WUSDT balance
  const { data: wusdtBalance } = useBalance({
    address,
    token: CONTRACT_ADDRESSES.WUSDT,
  });

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="premium" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="text-xs opacity-80">
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </span>
              <span className="text-xs font-medium">
                {wusdtBalance ? `${parseFloat(formatEther(wusdtBalance.value)).toFixed(2)} WUSDT` : '0 WUSDT'}
              </span>
            </div>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-card border-glass-border">
          <DropdownMenuItem 
            onClick={() => disconnect()}
            className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="hero" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-glass-border">
        {connectors.map((connector) => (
          <DropdownMenuItem
            key={connector.id}
            onClick={() => connect({ connector })}
            className="cursor-pointer"
          >
            <Wallet className="h-4 w-4 mr-2" />
            {connector.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}