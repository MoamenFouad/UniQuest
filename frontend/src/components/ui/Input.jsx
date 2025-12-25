import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function Input({ className, ...props }) {
    return (
        <input
            className={twMerge(
                "w-full bg-card border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
                className
            )}
            {...props}
        />
    )
}
