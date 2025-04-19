import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useTokens } from "@/hooks/useTokens";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { apiRequest } from "@/lib/queryClient";

export function CreatePool() {
  const { toast } = useToast();
  const { connected } = useWallet();
  const { tokens } = useTokens();
  
  const [token0, setToken0] = useState("");
  const [token1, setToken1] = useState("");
  const [fee, setFee] = useState("0.3");
  const [initialPrice, setInitialPrice] = useState("");
  
  const createPoolMutation = useMutation({
    mutationFn: async (poolData: any) => {
      const res = await apiRequest("POST", "/api/pools", poolData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pools'] });
      toast({
        title: "Pool created",
        description: "Your new liquidity pool has been created successfully.",
      });
      
      // Reset form
      setToken0("");
      setToken1("");
      setFee("0.3");
      setInitialPrice("");
    },
    onError: (error) => {
      toast({
        title: "Error creating pool",
        description: error.message || "Failed to create a new pool. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleCreatePool = () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a pool.",
        variant: "destructive",
      });
      return;
    }
    
    if (!token0 || !token1 || !fee || !initialPrice) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to create a pool.",
        variant: "destructive",
      });
      return;
    }
    
    if (token0 === token1) {
      toast({
        title: "Invalid token selection",
        description: "Please select different tokens for the pool.",
        variant: "destructive",
      });
      return;
    }
    
    createPoolMutation.mutate({
      token0,
      token1,
      fee: parseFloat(fee),
      initialPrice: parseFloat(initialPrice)
    });
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a new liquidity pool</CardTitle>
        <CardDescription>
          Deploy a new AMM liquidity pool with customizable fee tier and initial price
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="token0" className="text-sm font-medium">Token 1</label>
            <Select value={token0} onValueChange={setToken0}>
              <SelectTrigger id="token0">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {tokens?.map((token: any) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.symbol} - {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="token1" className="text-sm font-medium">Token 2</label>
            <Select value={token1} onValueChange={setToken1}>
              <SelectTrigger id="token1">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {tokens?.map((token: any) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.symbol} - {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="fee" className="text-sm font-medium">Fee Tier</label>
            <Select value={fee} onValueChange={setFee}>
              <SelectTrigger id="fee">
                <SelectValue placeholder="Select fee tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.05">0.05% - Very stable pairs</SelectItem>
                <SelectItem value="0.3">0.3% - Standard pairs</SelectItem>
                <SelectItem value="1">1% - Exotic pairs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="initialPrice" className="text-sm font-medium">Initial Price</label>
            <Input
              id="initialPrice"
              placeholder="0.0"
              value={initialPrice}
              onChange={(e) => setInitialPrice(e.target.value)}
              type="number"
              min="0"
              step="0.000001"
            />
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-md border border-orange-100">
          <h4 className="text-sm font-medium text-orange-800 mb-2">Important information</h4>
          <ul className="text-xs text-orange-700 list-disc list-inside space-y-1">
            <li>Pool creation is irreversible and requires a network transaction</li>
            <li>The initial price sets the starting exchange rate between tokens</li>
            <li>After creating a pool, you'll need to add liquidity separately</li>
            <li>Gas costs for pool creation vary based on network congestion</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90"
          onClick={handleCreatePool}
          disabled={createPoolMutation.isPending}
        >
          {createPoolMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Pool...
            </>
          ) : "Create Pool"}
        </Button>
      </CardFooter>
    </Card>
  );
}
