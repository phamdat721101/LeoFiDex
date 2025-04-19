import { Card, CardContent } from "@/components/ui/card";
import { TokenPairBadge } from "@/components/ui/token-badge";
import { TransactionTag } from "@/components/ui/transaction-tag";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatTimeAgo } from "@/lib/formatters";
import { ExternalLink } from "lucide-react";

export function RecentTransactions() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions/recent'],
  });

  const getTransactionType = (type: string): "swap" | "add" | "remove" => {
    if (type === "add") return "add";
    if (type === "remove") return "remove";
    return "swap";
  };

  const getExplorerUrl = (txHash: string) => {
    // This would normally be configured based on the current network
    return `https://etherscan.io/tx/${txHash}`;
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Recent Transactions</h3>
          <a href="/transactions" className="text-orange-500 hover:text-red-500 font-medium text-sm">View All</a>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pool</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-6 w-16 bg-gray-100 rounded"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-6 w-24 bg-gray-100 rounded"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-10 w-32 bg-gray-100 rounded"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-6 w-16 bg-gray-100 rounded"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-6 w-24 bg-gray-100 rounded"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-6 w-20 bg-gray-100 rounded"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-6 w-6 bg-gray-100 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : transactions && transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <TransactionTag type={getTransactionType(tx.type)} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TokenPairBadge 
                          token1={{
                            symbol: tx.pool.token0.symbol,
                            color: tx.pool.token0.color || '#3B82F6'
                          }}
                          token2={{
                            symbol: tx.pool.token1.symbol,
                            color: tx.pool.token1.color || '#10B981'
                          }}
                          size="sm"
                          className="mr-2"
                        />
                        <span>{tx.pool.token0.symbol}-{tx.pool.token1.symbol}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{tx.amount0} {tx.pool.token0.symbol}</span>
                        {tx.type !== "swap" ? (
                          <span className="text-xs text-gray-500">+ {tx.amount1} {tx.pool.token1.symbol}</span>
                        ) : (
                          <span className="text-xs text-gray-500">for {tx.amount1} {tx.pool.token1.symbol}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {formatCurrency(tx.value)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs">{tx.account}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500 text-sm">
                      {formatTimeAgo(new Date(tx.timestamp))}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <a href={getExplorerUrl(tx.txHash)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-orange-500">
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
