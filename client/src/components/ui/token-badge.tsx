import { cn } from "@/lib/utils";

interface TokenBadgeProps {
  symbol: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-5 h-5 text-xs",
  md: "w-6 h-6 text-xs",
  lg: "w-8 h-8 text-sm"
};

export function TokenBadge({ symbol, color, size = "md", className }: TokenBadgeProps) {
  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center text-white font-medium",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {symbol.charAt(0).toUpperCase()}
    </div>
  );
}

interface TokenPairBadgeProps {
  token1: {
    symbol: string;
    color: string;
  };
  token2: {
    symbol: string;
    color: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TokenPairBadge({ token1, token2, size = "md", className }: TokenPairBadgeProps) {
  return (
    <div className={cn("flex -space-x-2", className)}>
      <TokenBadge symbol={token1.symbol} color={token1.color} size={size} />
      <TokenBadge symbol={token2.symbol} color={token2.color} size={size} />
    </div>
  );
}
