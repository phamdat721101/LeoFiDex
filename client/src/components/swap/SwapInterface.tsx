import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ArrowDown, RefreshCw, Settings, AlertCircle } from "lucide-react";
import { useTokens } from "@/hooks/useTokens";
import { useSwap } from "@/hooks/useSwap";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { apiRequest } from "@/lib/queryClient";
import { TokenBadge } from "@/components/ui/token-badge";

export function SwapInterface() {
  const { toast } = useToast();
  const { connected } = useWallet();
  const { tokens } = useTokens();
  
  const [tokenFrom, setTokenFrom] = useState("");
  const [tokenTo, setTokenTo] = useState("");
  const [amountFrom, setAmountFrom] = useState("");
  const [amountTo, setAmountTo] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [deadline, setDeadline] = useState("20");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { getQuote, isLoadingQuote } = useSwap();
  
  // Get estimated output amount when input amount or selected tokens change
  useEffect(() => {
    const updateQuote = async () => {
      if (!tokenFrom || !tokenTo || !amountFrom || parseFloat(amountFrom) === 0) {
        setAmountTo("");
        return;
      }
      
      try {
        const quote = await getQuote(tokenFrom, tokenTo, parseFloat(amountFrom));
        setAmountTo(quote.toString());
      } catch (error) {
        console.error("Failed to get quote:", error);
        setAmountTo("");
      }
    };
    
    updateQuote();
  }, [tokenFrom, tokenTo, amountFrom, getQuote]);
  
  const swapMutation = useMutation({
    mutationFn: async (swapData: any) => {
      const res = await apiRequest("POST", "/api/swap", swapData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Swap executed",
        description: `Successfully swapped ${amountFrom} ${getTokenSymbol(tokenFrom)} for ${amountTo} ${getTokenSymbol(tokenTo)}`,
      });
      
      // Reset form
      setAmountFrom("");
      setAmountTo("");
    },
    onError: (error) => {
      toast({
        title: "Swap failed",
        description: error.message || "Failed to execute swap. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleSwapTokens = () => {
    const tempToken = tokenFrom;
    const tempAmount = amountFrom;
    
    setTokenFrom(tokenTo);
    setTokenTo(tempToken);
    setAmountFrom(amountTo);
    setAmountTo(tempAmount);
  };
  
  const getTokenSymbol = (address: string) => {
    const token = tokens?.find((t: any) => t.address === address);
    return token ? token.symbol : "???";
  };
  
  const getTokenColor = (address: string) => {
    const token = tokens?.find((t: any) => t.address === address);
    return token?.color || "#3B82F6";
  };
  
  const handleSwap = () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to swap tokens.",
        variant: "destructive",
      });
      return;
    }
    
    if (!tokenFrom || !tokenTo || !amountFrom || !amountTo) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to execute a swap.",
        variant: "destructive",
      });
      return;
    }
    
    swapMutation.mutate({
      tokenFrom,
      tokenTo,
      amountFrom: parseFloat(amountFrom),
      amountTo: parseFloat(amountTo),
      slippage: parseFloat(slippage),
      deadline: parseInt(deadline)
    });
  };
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Swap</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
          <Settings className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSettingsOpen && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium mb-2">Transaction Settings</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="slippage" className="text-xs">Slippage Tolerance (%)</Label>
                <Input
                  id="slippage"
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  min="0.1"
                  max="50"
                  step="0.1"
                  className="h-8 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="deadline" className="text-xs">Transaction Deadline (minutes)</Label>
                <Input
                  id="deadline"
                  type="number"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min="1"
                  max="180"
                  step="1"
                  className="h-8 mt-1"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label>From</Label>
          <div className="flex space-x-3 mb-2">
            <Select value={tokenFrom} onValueChange={setTokenFrom}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Token" />
              </SelectTrigger>
              <SelectContent>
                {tokens?.map((token: any) => (
                  <SelectItem key={token.address} value={token.address}>
                    <div className="flex items-center">
                      <TokenBadge 
                        symbol={token.symbol} 
                        color={token.color} 
                        size="sm" 
                        className="mr-2" 
                      />
                      {token.symbol}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="0.0"
              value={amountFrom}
              onChange={(e) => setAmountFrom(e.target.value)}
              type="number"
              min="0"
              step="0.000001"
            />
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-gray-100 hover:bg-gray-200" 
            onClick={handleSwapTokens}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label>To</Label>
          <div className="flex space-x-3 mb-2">
            <Select value={tokenTo} onValueChange={setTokenTo}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Token" />
              </SelectTrigger>
              <SelectContent>
                {tokens?.map((token: any) => (
                  <SelectItem key={token.address} value={token.address}>
                    <div className="flex items-center">
                      <TokenBadge 
                        symbol={token.symbol} 
                        color={token.color} 
                        size="sm" 
                        className="mr-2" 
                      />
                      {token.symbol}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Input
                placeholder="0.0"
                value={amountTo}
                readOnly
                type="number"
                className={isLoadingQuote ? "bg-gray-50" : ""}
              />
              {isLoadingQuote && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {tokenFrom && tokenTo && amountFrom && amountTo && (
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Rate</span>
              <span>1 {getTokenSymbol(tokenFrom)} = {(parseFloat(amountTo) / parseFloat(amountFrom)).toFixed(6)} {getTokenSymbol(tokenTo)}</span>
            </div>
            <div className="flex justify-between text-gray-600 mt-1">
              <span>Fee</span>
              <span>0.3%</span>
            </div>
          </div>
        )}
        
        {(!tokenFrom || !tokenTo) && (
          <div className="bg-blue-50 p-3 rounded-lg flex items-start space-x-2 text-sm">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-blue-700">
              Select tokens to get started with swapping
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90"
          onClick={handleSwap}
          disabled={!tokenFrom || !tokenTo || !amountFrom || !amountTo || swapMutation.isPending}
        >
          {swapMutation.isPending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Swapping...
            </>
          ) : "Swap"}
        </Button>
      </CardFooter>
    </Card>
  );
}
