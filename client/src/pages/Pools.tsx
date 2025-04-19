import { CreatePool } from "@/components/pools/CreatePool";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Pools() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex -mb-px overflow-x-auto hide-scrollbar">
          <Button 
            variant="ghost" 
            className="whitespace-nowrap px-4 py-2 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            onClick={() => setLocation("/")}
          >
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="whitespace-nowrap px-4 py-2 font-medium text-orange-500 border-b-2 border-orange-500"
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create Pool</h1>
          <p className="text-gray-500 mt-1">Deploy a new liquidity pool with custom parameters</p>
        </div>
        
        <CreatePool />
      </section>
    </div>
  );
}
