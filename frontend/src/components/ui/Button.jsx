import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function Button({ className, variant = "primary", ...props }) {
    const variants = {
        primary: "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25",
        secondary: "bg-surface hover:bg-border text-white border border-border",
        outline: "bg-transparent border border-border hover:bg-surface text-slate-300",
        ghost: "bg-transparent hover:bg-surface text-slate-300",
    }

    return (
        <button
            className={twMerge(
                "px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}
