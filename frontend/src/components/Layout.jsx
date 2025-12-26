import { useAuth } from "../context/AuthContext"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, Users, Trophy, LogOut, Target, User, Settings, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export function Layout({ children }) {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const navItems = [
        { path: "/", label: "Dashboard", icon: Home },
        { path: "/rooms", label: "Study Rooms", icon: Users },
        { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    ]

    return (
        <div className="min-h-screen w-full bg-dark text-slate-200 flex">
            {/* Permanent Sidebar - Always Visible */}
            <aside className="w-64 bg-sidebar border-r border-white/10 flex flex-col fixed h-full z-50">
                {/* Logo/Brand */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl text-white">UniQuest</h1>
                            <p className="text-xs text-slate-400">Learning Platform</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? "text-white bg-primary shadow-lg shadow-primary/25"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive && "text-white"}`} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Main Content Area - Offset by sidebar width */}
            <div className="flex-1 ml-64">
                {/* Top Header with User Account Dropdown */}
                <header className="h-16 bg-dark border-b border-white/10 flex items-center justify-end px-8 sticky top-0 z-40">
                    <div className="relative" ref={dropdownRef}>
                        {/* Account Button */}
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-all"
                        >
                            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-primary-light font-bold text-sm">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-white text-sm">{user?.username}</p>
                                <p className="text-xs text-slate-400">{user?.email}</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slide-up">
                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false)
                                            // Navigate to profile page when implemented
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        <User className="w-5 h-5" />
                                        <span className="font-medium">Profile</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false)
                                            // Navigate to settings page when implemented
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        <Settings className="w-5 h-5" />
                                        <span className="font-medium">Settings</span>
                                    </button>
                                    <div className="border-t border-white/10 my-2"></div>
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false)
                                            handleLogout()
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
