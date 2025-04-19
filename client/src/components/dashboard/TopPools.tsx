import { Card, CardContent } from "@/components/ui/card";
import { TokenPairBadge } from "@/components/ui/token-badge";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { Link } from "wouter";

export function TopPools() {
  const { data: pools, isLoading } = useQuery({
    queryKey: ['/api/pools/top'],
  });

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-bold text-lg mb-4">Top Pools by TVL</h3>
        
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-b border-gray-200 py-3 flex justify-between animate-pulse">
                <div className="h-10 bg-gray-100 rounded w-24"></div>
                <div className="h-10 bg-gray-100 rounded w-16"></div>
              </div>
            ))}
          </>
        ) : pools && pools.length > 0 ? (
          <>
            {pools.map((pool: any, index: number) => (
              <div key={index} className={`${index < pools.length - 1 ? 'border-b border-gray-200' : ''} py-3 flex justify-between`}>
                <div className="flex items-center">
                  <TokenPairBadge 
                    token1={{
                      symbol: pool.token0.symbol,
                      color: pool.token0.color || '#3B82F6'
                    }}
                    token2={{
                      symbol: pool.token1.symbol,
                      color: pool.token1.color || '#10B981'
                    }}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">{pool.token0.symbol}-{pool.token1.symbol}</p>
                    <p className="text-xs text-gray-500">{pool.fee}% fee</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(pool.tvl)}</p>
                  <p className={`text-xs ${parseFloat(pool.apr) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(pool.apr)} APR
                  </p>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="py-6 text-center text-gray-500">No pools found</div>
        )}
        
        <Link href="/pools">
          <a className="w-full mt-4 text-orange-500 hover:text-red-500 font-medium text-sm flex items-center justify-center">
            View All Pools
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </Link>
      </CardContent>
    </Card>
  );
}
