import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function Button({ className, variant = "primary", ...props }) {
    const variants = {
        primary: "bg-primary hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30",
        secondary: "bg-card hover:bg-slate-700 text-white border border-slate-700",
        outline: "bg-transparent border border-slate-600 hover:bg-slate-800 text-slate-300",
        ghost: "bg-transparent hover:bg-slate-800 text-slate-300",
    }

    return (
        <button
            className={twMerge(
                "px-4 py-2 rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}
