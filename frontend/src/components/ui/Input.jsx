import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function Input({ className, ...props }) {
    return (
        <input
            className={twMerge(
                "w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
                className
            )}
            {...props}
        />
    )
}
