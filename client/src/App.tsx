import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Web3Provider } from "@/components/web3/Web3Provider.simple";
import Dashboard from "@/pages/Dashboard";
import Pools from "@/pages/Pools";
import Swap from "@/pages/Swap";
import Liquidity from "@/pages/Liquidity";
import Modules from "@/pages/Modules";
import Documentation from "@/pages/Documentation";
import NotFound from "@/pages/not-found";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/pools" component={Pools} />
      <Route path="/swap" component={Swap} />
      <Route path="/liquidity" component={Liquidity} />
      <Route path="/modules" component={Modules} />
      <Route path="/docs" component={Documentation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <TooltipProvider>
          <div className="flex flex-col h-screen bg-gray-50">
            <Header toggleMobileMenu={toggleMobileMenu} />
            {isMobileMenuOpen && <MobileMenu />}
            <main className="flex-1 overflow-y-auto">
              <Router />
            </main>
            <Footer />
            <Toaster />
          </div>
        </TooltipProvider>
      </Web3Provider>
    </QueryClientProvider>
  );
}

export default App;
