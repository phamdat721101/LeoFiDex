import { Card, CardContent } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/formatters";

type TimeRange = "1D" | "1W" | "1M" | "ALL";

export function VolumeChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("1D");
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/charts/volume', timeRange],
  });

  const handleRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-orange-500">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="lg:col-span-2">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Trading Volume</h3>
          <div className="flex text-sm">
            {(['1D', '1W', '1M', 'ALL'] as TimeRange[]).map(range => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                className={timeRange === range ? "bg-gradient-to-r from-red-500 to-orange-500 text-white" : "text-gray-500 hover:text-gray-800"}
                onClick={() => handleRangeChange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="h-64 w-full">
          {isLoading ? (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
              <div className="text-center text-gray-500">
                <p className="text-sm mb-2">Loading chart data...</p>
              </div>
            </div>
          ) : data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value"
                  stroke="#F97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-sm mb-2">No data available</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
