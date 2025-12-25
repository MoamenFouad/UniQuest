import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function Card({ className, children, ...props }) {
    return (
        <div
            className={twMerge(
                "bg-card border border-slate-700/50 rounded-2xl p-6 shadow-xl",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
