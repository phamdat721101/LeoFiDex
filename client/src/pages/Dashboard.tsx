import { StatCards } from "@/components/dashboard/StatCards";
import { VolumeChart } from "@/components/dashboard/VolumeChart";
import { TopPools } from "@/components/dashboard/TopPools";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex -mb-px overflow-x-auto hide-scrollbar">
          <Button 
            variant="ghost" 
            className="whitespace-nowrap px-4 py-2 font-medium text-orange-500 border-b-2 border-orange-500"
          >
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="whitespace-nowrap px-4 py-2 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            onClick={() => setLocation("/pools")}
          >
            Create Pool
          </Button>
          <Button 
            variant="ghost" 
            className="whitespace-nowrap px-4 py-2 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            onClick={() => setLocation("/swap")}
          >
            Swap
          </Button>
          <Button 
            variant="ghost" 
            className="whitespace-nowrap px-4 py-2 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            onClick={() => setLocation("/liquidity")}
          >
            Provide Liquidity
          </Button>
          <Button 
            variant="ghost" 
            className="whitespace-nowrap px-4 py-2 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            onClick={() => setLocation("/modules")}
          >
            Module Registry
          </Button>
        </nav>
      </div>
      
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex space-x-2 mt-2 md:mt-0">
            <div className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>Ethereum</span>
            </div>
            <select className="bg-white border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block p-1 px-3">
              <option>Last 24h</option>
              <option>Last 7d</option>
              <option>Last 30d</option>
              <option>All time</option>
            </select>
          </div>
        </div>
        
        {/* Stats Cards */}
        <StatCards />
        
        {/* Chart and Top Pools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <VolumeChart />
          <TopPools />
        </div>
        
        {/* Recent Transactions */}
        <RecentTransactions />
      </section>
    </div>
  );
}
