import * as React from "react";
import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
  "flex w-full rounded-xl border-2 border-slate-400 bg-white px-5 py-4 text-sm transition-all shadow-sm",
  "placeholder:text-slate-400 disabled:opacity-50",
  "focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:ring-offset-0 focus:shadow-md",
  "aria-invalid:border-red-500 focus:aria-invalid:border-red-500",
  className
)}

      {...props}
    />
  );
}

export { Input };