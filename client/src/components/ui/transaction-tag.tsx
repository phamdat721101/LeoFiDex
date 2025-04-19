import { cn } from "@/lib/utils";

type TransactionType = "swap" | "add" | "remove";

interface TransactionTagProps {
  type: TransactionType;
  className?: string;
}

const typeConfig: Record<TransactionType, { bg: string; text: string; label: string }> = {
  swap: {
    bg: "bg-blue-500 bg-opacity-10",
    text: "text-blue-500",
    label: "Swap"
  },
  add: {
    bg: "bg-green-500 bg-opacity-10",
    text: "text-green-500",
    label: "Add"
  },
  remove: {
    bg: "bg-red-500 bg-opacity-10",
    text: "text-red-500",
    label: "Remove"
  }
};

export function TransactionTag({ type, className }: TransactionTagProps) {
  const config = typeConfig[type];
  
  return (
    <span className={cn(
      "px-2 py-1 rounded-full text-xs",
      config.bg,
      config.text,
      className
    )}>
      {config.label}
    </span>
  );
}
