import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  description?: string;
  className?: string;
}

export function StatsCard({ title, value, icon, trend, description, className }: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          <div className="bg-gray-100 p-2 rounded-lg">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="flex items-center">
            <span className={`flex items-center text-sm ${trend.positive ? 'text-green-500' : 'text-yellow-500'}`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={trend.positive 
                    ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
                    : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  } 
                />
              </svg>
              {trend.value}
            </span>
            {description && <span className="text-gray-500 text-sm ml-2">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
