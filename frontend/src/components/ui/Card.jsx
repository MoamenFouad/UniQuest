import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function Card({ className, children, ...props }) {
    return (
        <div
            className={twMerge(
                "bg-card border border-border rounded-2xl p-6 shadow-xl",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
