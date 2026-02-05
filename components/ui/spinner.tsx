import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-6 w-6 border-[3px]",
};

export function Spinner({ className, size = "md" }: Props) {
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-slate-200 border-t-indigo-500",
        sizes[size],
        className
      )}
      aria-label="Loading"
    />
  );
}
