import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useApp } from "../context/AppContext"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Trophy, LogOut, Menu, X } from "lucide-react"
import { clsx } from "clsx"

export function Layout({ children }) {
    const { logout, user } = useAuth()
    const { stats } = useApp()
    const location = useLocation()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: Users, label: "Rooms", path: "/rooms" },
        { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    ]

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-slate-800 rounded-lg text-white"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed lg:sticky top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 ease-in-out",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">
                        U
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        UniQuest
                    </span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={clsx(
                                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-indigo-500/10 text-indigo-400 font-medium"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
                                )}
                                <Icon className={clsx("w-5 h-5", isActive && "text-indigo-400")} />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-indigo-400 border border-slate-700">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.username || 'Student'}</p>
                            <p className="text-xs text-slate-500 truncate">
                                Lvl {stats.level} • {stats.xp.toLocaleString()} XP
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 bg-slate-950 p-4 lg:p-8 overflow-y-auto h-screen scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                <div className="max-w-6xl mx-auto pt-12 lg:pt-0">
                    {children}
                </div>
            </main>
        </div>
    )
}
