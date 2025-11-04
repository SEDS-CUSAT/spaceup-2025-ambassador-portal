"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  default:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#5b21b6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#7c3aed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/18 bg-transparent px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-white/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b21b6] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-60",
  ghost:
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b21b6] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-60",
};

const Button = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const baseClasses = buttonVariants[variant] ?? buttonVariants.default;
  return <button ref={ref} className={cn(baseClasses, className + " hover:cursor-pointer")} {...props} />;
});

Button.displayName = "Button";

export { Button };
