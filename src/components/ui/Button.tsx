// src/components/ui/Button.tsx
import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-400/30 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800",
    ghost: "bg-transparent hover:bg-zinc-100 text-zinc-900",
    danger: "bg-red-600 text-white hover:bg-red-500",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
