import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function Card({ children, className, hoverEffect = false, ...props }) {
    return (
        <div
            className={twMerge(
                clsx(
                    "glass-card rounded-2xl p-6",
                    hoverEffect && "transition-all duration-300 hover:bg-card/80 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10",
                    className
                )
            )}
            {...props}
        >
            {children}
        </div>
    )
}
