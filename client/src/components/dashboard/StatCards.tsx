import { StatsCard } from "@/components/ui/stats-card";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, LayoutGrid, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

export function StatCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse h-[124px]"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatsCard
        title="Total Value Locked"
        value={formatCurrency(stats?.tvl || 0)}
        icon={<DollarSign className="h-5 w-5 text-gray-600" />}
        trend={{
          value: formatPercentage(stats?.tvlChange || 0),
          positive: (stats?.tvlChange || 0) > 0
        }}
        description="vs last period"
      />
      
      <StatsCard
        title="Active Pools"
        value={stats?.pools?.toString() || "0"}
        icon={<LayoutGrid className="h-5 w-5 text-gray-600" />}
        trend={{
          value: `+${stats?.newPools || 0}`,
          positive: true
        }}
        description="new this period"
      />
      
      <StatsCard
        title="Trading Volume"
        value={formatCurrency(stats?.volume || 0)}
        icon={<TrendingUp className="h-5 w-5 text-gray-600" />}
        trend={{
          value: formatPercentage(stats?.volumeChange || 0),
          positive: (stats?.volumeChange || 0) > 0
        }}
        description="vs last period"
      />
      
      <StatsCard
        title="Fees Generated"
        value={formatCurrency(stats?.fees || 0)}
        icon={<Wallet className="h-5 w-5 text-gray-600" />}
        trend={{
          value: formatPercentage(stats?.feesChange || 0),
          positive: (stats?.feesChange || 0) > 0
        }}
        description="vs last period"
      />
    </div>
  );
}
