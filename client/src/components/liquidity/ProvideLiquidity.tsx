import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useTokens } from "@/hooks/useTokens";
import { usePools } from "@/hooks/usePools";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { TokenBadge } from "@/components/ui/token-badge";

export function ProvideLiquidity() {
  const { toast } = useToast();
  const { connected } = useWallet();
  const { tokens } = useTokens();
  const { pools } = usePools();
  
  const [tab, setTab] = useState("add");
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [priceRangeEnabled, setPriceRangeEnabled] = useState(false);
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("0");
  const [currentPrice, setCurrentPrice] = useState("0");
  const [removePercent, setRemovePercent] = useState(50);
  
  // Get pool details when a pool is selected
  useEffect(() => {
    if (!selectedPoolId || !pools) return;
    
    const selectedPool = pools.find((p: any) => p.id === selectedPoolId);
    if (selectedPool) {
      setCurrentPrice(selectedPool.price);
      
      // Default price range (±20% of current price)
      const price = parseFloat(selectedPool.price);
      setMinPrice((price * 0.8).toFixed(6));
      setMaxPrice((price * 1.2).toFixed(6));
    }
  }, [selectedPoolId, pools]);
  
  const getPoolById = (id: string) => {
    return pools?.find((p: any) => p.id === id);
  };
  
  const addLiquidityMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/liquidity/add", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
      
      toast({
        title: "Liquidity added",
        description: "Your liquidity has been added successfully.",
      });
      
      // Reset form
      setAmount0("");
      setAmount1("");
    },
    onError: (error) => {
      toast({
        title: "Error adding liquidity",
        description: error.message || "Failed to add liquidity. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const removeLiquidityMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/liquidity/remove", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
      
      toast({
        title: "Liquidity removed",
        description: "Your liquidity has been removed successfully.",
      });
      
      // Reset form
      setRemovePercent(50);
    },
    onError: (error) => {
      toast({
        title: "Error removing liquidity",
        description: error.message || "Failed to remove liquidity. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleAddLiquidity = () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to provide liquidity.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedPoolId || !amount0 || !amount1) {
      toast({
        title: "Missing information",
        description: "Please select a pool and enter amounts.",
        variant: "destructive",
      });
      return;
    }
    
    addLiquidityMutation.mutate({
      poolId: selectedPoolId,
      amount0: parseFloat(amount0),
      amount1: parseFloat(amount1),
      ...(priceRangeEnabled && {
        minPrice: parseFloat(minPrice),
        maxPrice: parseFloat(maxPrice)
      })
    });
  };
  
  const handleRemoveLiquidity = () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to remove liquidity.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedPoolId) {
      toast({
        title: "Missing information",
        description: "Please select a pool to remove liquidity from.",
        variant: "destructive",
      });
      return;
    }
    
    removeLiquidityMutation.mutate({
      poolId: selectedPoolId,
      percent: removePercent
    });
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Liquidity</CardTitle>
        <CardDescription>
          Provide liquidity to earn fees or remove your existing position
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add Liquidity</TabsTrigger>
            <TabsTrigger value="remove">Remove Liquidity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-6 mt-4">
            <div className="space-y-4">
              <div>
                <Label>Select Pool</Label>
                <Select value={selectedPoolId} onValueChange={setSelectedPoolId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a token pair" />
                  </SelectTrigger>
                  <SelectContent>
                    {pools?.map((pool: any) => (
                      <SelectItem key={pool.id} value={pool.id}>
                        <div className="flex items-center">
                          <TokenBadge 
                            symbol={pool.token0.symbol} 
                            color={pool.token0.color} 
                            size="sm" 
                            className="mr-1" 
                          />
                          <TokenBadge 
                            symbol={pool.token1.symbol} 
                            color={pool.token1.color} 
                            size="sm" 
                            className="mr-2" 
                          />
                          {pool.token0.symbol}-{pool.token1.symbol} ({pool.fee}%)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedPoolId && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        {getPoolById(selectedPoolId)?.token0.symbol} Amount
                      </Label>
                      <Input
                        placeholder="0.0"
                        value={amount0}
                        onChange={(e) => setAmount0(e.target.value)}
                        type="number"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {getPoolById(selectedPoolId)?.token1.symbol} Amount
                      </Label>
                      <Input
                        placeholder="0.0"
                        value={amount1}
                        onChange={(e) => setAmount1(e.target.value)}
                        type="number"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enablePriceRange"
                      checked={priceRangeEnabled}
                      onChange={(e) => setPriceRangeEnabled(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="enablePriceRange" className="cursor-pointer">
                      Set custom price range (concentrated liquidity)
                    </Label>
                  </div>
                  
                  {priceRangeEnabled && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Current Price:</span>
                        <span className="font-medium">
                          1 {getPoolById(selectedPoolId)?.token0.symbol} = {currentPrice} {getPoolById(selectedPoolId)?.token1.symbol}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Min Price</Label>
                          <Input
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            type="number"
                            min="0"
                            step="0.000001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Price</Label>
                          <Input
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            type="number"
                            min="0"
                            step="0.000001"
                          />
                        </div>
                      </div>
                      
                      <div className="text-xs text-orange-600">
                        <p>Note: Setting a price range allows you to concentrate your liquidity, potentially earning more fees within that range but earning nothing outside of it.</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="remove" className="space-y-6 mt-4">
            <div className="space-y-4">
              <div>
                <Label>Select Pool</Label>
                <Select value={selectedPoolId} onValueChange={setSelectedPoolId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a token pair" />
                  </SelectTrigger>
                  <SelectContent>
                    {pools?.map((pool: any) => (
                      <SelectItem key={pool.id} value={pool.id}>
                        <div className="flex items-center">
                          <TokenBadge 
                            symbol={pool.token0.symbol} 
                            color={pool.token0.color} 
                            size="sm" 
                            className="mr-1" 
                          />
                          <TokenBadge 
                            symbol={pool.token1.symbol} 
                            color={pool.token1.color} 
                            size="sm" 
                            className="mr-2" 
                          />
                          {pool.token0.symbol}-{pool.token1.symbol} ({pool.fee}%)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedPoolId && (
                <>
                  <div className="space-y-4">
                    <Label>Amount to Remove: {removePercent}%</Label>
                    <Slider
                      value={[removePercent]}
                      onValueChange={(value) => setRemovePercent(value[0])}
                      min={1}
                      max={100}
                      step={1}
                    />
                    <div className="flex justify-between text-sm">
                      <span>1%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>You'll receive:</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <TokenBadge 
                          symbol={getPoolById(selectedPoolId)?.token0.symbol || ""} 
                          color={getPoolById(selectedPoolId)?.token0.color || "#3B82F6"} 
                          size="sm" 
                          className="mr-2" 
                        />
                        <span>
                          {(
                            parseFloat(getPoolById(selectedPoolId)?.userLiquidity?.amount0 || "0") * 
                            (removePercent / 100)
                          ).toFixed(6)} {getPoolById(selectedPoolId)?.token0.symbol}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <TokenBadge 
                          symbol={getPoolById(selectedPoolId)?.token1.symbol || ""} 
                          color={getPoolById(selectedPoolId)?.token1.color || "#10B981"} 
                          size="sm" 
                          className="mr-2" 
                        />
                        <span>
                          {(
                            parseFloat(getPoolById(selectedPoolId)?.userLiquidity?.amount1 || "0") * 
                            (removePercent / 100)
                          ).toFixed(6)} {getPoolById(selectedPoolId)?.token1.symbol}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        {tab === "add" ? (
          <Button 
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90"
            onClick={handleAddLiquidity}
            disabled={!selectedPoolId || !amount0 || !amount1 || addLiquidityMutation.isPending}
          >
            {addLiquidityMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Liquidity...
              </>
            ) : "Add Liquidity"}
          </Button>
        ) : (
          <Button 
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90"
            onClick={handleRemoveLiquidity}
            disabled={!selectedPoolId || removeLiquidityMutation.isPending}
          >
            {removeLiquidityMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing Liquidity...
              </>
            ) : "Remove Liquidity"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
