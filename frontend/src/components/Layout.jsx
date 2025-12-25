import { useAuth } from "../context/AuthContext"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Trophy, LogOut } from "lucide-react"
import { clsx } from "clsx"

export function Layout({ children }) {
    const { logout, user } = useAuth()
    const location = useLocation()

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: Users, label: "Rooms", path: "/rooms" },
        { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    ]

    return (
        <div className="min-h-screen bg-dark w-full flex text-white">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-card border-r border-slate-800 flex flex-col z-50">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-lg">
                        U
                    </div>
                    <span className="hidden lg:block font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        UniQuest
                    </span>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                <Icon className={clsx("w-6 h-6", isActive && "text-primary")} />
                                <span className="hidden lg:block">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="hidden lg:block">
                            <p className="text-sm font-medium">{user?.username}</p>
                            <p className="text-xs text-slate-500">Lvl 1 Student</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden lg:block text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
