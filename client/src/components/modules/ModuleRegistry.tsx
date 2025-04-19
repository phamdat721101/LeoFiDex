import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Check, Ban, Package, Clock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { apiRequest } from "@/lib/queryClient";

export function ModuleRegistry() {
  const { toast } = useToast();
  const { connected, isAdmin } = useWallet();
  const [activeTab, setActiveTab] = useState("registered");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [newModule, setNewModule] = useState({
    name: "",
    description: "",
    address: "",
    type: "fee",
  });
  
  const { data: modules, isLoading } = useQuery({
    queryKey: ['/api/modules'],
  });
  
  const registerModuleMutation = useMutation({
    mutationFn: async (moduleData: any) => {
      const res = await apiRequest("POST", "/api/modules", moduleData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/modules'] });
      
      toast({
        title: "Module registered",
        description: "The module has been successfully registered.",
      });
      
      // Reset form
      setNewModule({
        name: "",
        description: "",
        address: "",
        type: "fee",
      });
    },
    onError: (error) => {
      toast({
        title: "Error registering module",
        description: error.message || "Failed to register module. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const toggleModuleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const res = await apiRequest("PATCH", `/api/modules/${id}`, { enabled });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/modules'] });
      
      toast({
        title: "Module status updated",
        description: "The module status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating module",
        description: error.message || "Failed to update module status. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleRegisterModule = () => {
    if (!connected || !isAdmin) {
      toast({
        title: "Permission denied",
        description: "You need admin rights to register a new module.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newModule.name || !newModule.address || !newModule.type) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    registerModuleMutation.mutate(newModule);
  };
  
  const handleToggleModule = (id: string, currentStatus: boolean) => {
    toggleModuleMutation.mutate({
      id,
      enabled: !currentStatus
    });
  };
  
  const getModuleIcon = (type: string) => {
    switch(type) {
      case "fee":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "oracle":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "rangeOrder":
        return <Plus className="h-5 w-5 text-green-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getModuleTypeLabel = (type: string) => {
    switch(type) {
      case "fee":
        return "Fee Strategy";
      case "oracle":
        return "TWAP Oracle";
      case "rangeOrder":
        return "Range Order";
      default:
        return type;
    }
  };
  
  const filteredModules = modules?.filter((module: any) => {
    if (activeTab === "registered") return module.enabled;
    return !module.enabled;
  });
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Module Registry</CardTitle>
        <CardDescription>
          Manage plug-and-play extensions for the LeoFi protocol
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="registered">
              <Check className="h-4 w-4 mr-2" />
              Active Modules
            </TabsTrigger>
            <TabsTrigger value="disabled">
              <Ban className="h-4 w-4 mr-2" />
              Disabled Modules
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="registered" className="mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-6 bg-gray-100 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredModules?.length > 0 ? (
              <div className="space-y-4">
                {filteredModules.map((module: any) => (
                  <div 
                    key={module.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex">
                        <div className="bg-gray-100 p-2 rounded-lg mr-3">
                          {getModuleIcon(module.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{module.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700 mr-2">
                              {getModuleTypeLabel(module.type)}
                            </span>
                            <span className="text-xs font-mono text-gray-500">{module.address.slice(0, 10)}...{module.address.slice(-8)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Switch
                          checked={module.enabled}
                          onCheckedChange={() => handleToggleModule(module.id, module.enabled)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No active modules found
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="disabled" className="mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-6 bg-gray-100 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredModules?.length > 0 ? (
              <div className="space-y-4">
                {filteredModules.map((module: any) => (
                  <div 
                    key={module.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex">
                        <div className="bg-gray-100 p-2 rounded-lg mr-3">
                          {getModuleIcon(module.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{module.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700 mr-2">
                              {getModuleTypeLabel(module.type)}
                            </span>
                            <span className="text-xs font-mono text-gray-500">{module.address.slice(0, 10)}...{module.address.slice(-8)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Switch
                          checked={module.enabled}
                          onCheckedChange={() => handleToggleModule(module.id, module.enabled)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No disabled modules found
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {isAdmin && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Register New Module</h3>
            <div className="space-y-4 border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moduleName">Module Name</Label>
                  <Input
                    id="moduleName"
                    value={newModule.name}
                    onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                    placeholder="e.g., Dynamic Fee Oracle"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moduleType">Module Type</Label>
                  <Select 
                    value={newModule.type} 
                    onValueChange={(value) => setNewModule({...newModule, type: value})}
                  >
                    <SelectTrigger id="moduleType">
                      <SelectValue placeholder="Select module type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fee">Fee Strategy</SelectItem>
                      <SelectItem value="oracle">TWAP Oracle</SelectItem>
                      <SelectItem value="rangeOrder">Range Order</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="moduleAddress">Contract Address</Label>
                <Input
                  id="moduleAddress"
                  value={newModule.address}
                  onChange={(e) => setNewModule({...newModule, address: e.target.value})}
                  placeholder="0x..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="moduleDescription">Description</Label>
                <Input
                  id="moduleDescription"
                  value={newModule.description}
                  onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                  placeholder="Brief description of the module functionality"
                />
              </div>
              
              <Button
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90"
                onClick={handleRegisterModule}
                disabled={registerModuleMutation.isPending}
              >
                {registerModuleMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Registering...
                  </>
                ) : "Register Module"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
