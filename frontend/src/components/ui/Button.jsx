import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function Button({
    children,
    className,
    variant = 'primary',
    size = 'md',
    ...props
}) {
    const variants = {
        primary: 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/30 border border-primary/20 hover:brightness-110',
        secondary: 'bg-white/10 text-white backdrop-blur-md border border-white/10 hover:bg-white/20',
        outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10',
        ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5',
        danger: 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-6 py-2.5 text-sm',
        lg: 'px-8 py-3.5 text-base',
        icon: 'p-2'
    }

    return (
        <button
            className={twMerge(
                clsx(
                    'relative rounded-xl font-medium transition-all duration-300',
                    'active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
                    'flex items-center justify-center gap-2',
                    'hover:shadow-xl hover:-translate-y-0.5', // Hover float effect
                    variants[variant],
                    sizes[size],
                    className
                )
            )}
            {...props}
        >
            {children}
        </button>
    )
}
