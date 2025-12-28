import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useApp } from "../context/AppContext"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Trophy, LogOut, Menu, X, ChevronRight, Settings, Zap, Map } from "lucide-react"
import { clsx } from "clsx"

export function Layout({ children }) {
    const { logout, user, updateProfile } = useAuth()
    const { stats } = useApp()
    const location = useLocation()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
    const [isPrefsModalOpen, setIsPrefsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [editData, setEditData] = useState({
        username: "", email: "", student_id: "", old_password: "", password: "", confirm_password: ""
    })
    const [prefsError, setPrefsError] = useState("")
    const [prefsSuccess, setPrefsSuccess] = useState("")

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navItems = [
        { icon: LayoutDashboard, label: "Intelligence", path: "/" },
        { icon: Users, label: "Sectors", path: "/rooms" },
        { icon: Trophy, label: "Council", path: "/leaderboard" },
    ]

    const handleStartEdit = () => {
        setEditData({ username: user?.username || "", email: user?.email || "", student_id: user?.student_id || "", old_password: "", password: "", confirm_password: "" })
        setIsEditing(true)
        setPrefsError("")
        setPrefsSuccess("")
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setPrefsError("")
        setPrefsSuccess("")
        try {
            const dataToUpdate = {}
            if (editData.username !== user.username) dataToUpdate.username = editData.username
            if (editData.email !== user.email) dataToUpdate.email = editData.email
            if (editData.student_id !== user.student_id) dataToUpdate.student_id = editData.student_id
            if (editData.password) {
                if (!editData.old_password) { setPrefsError("Old password required"); return }
                if (editData.password !== editData.confirm_password) { setPrefsError("Passwords mismatch"); return }
                dataToUpdate.old_password = editData.old_password
                dataToUpdate.password = editData.password
                dataToUpdate.confirm_password = editData.confirm_password
            }
            await updateProfile(dataToUpdate)
            setPrefsSuccess("Identity updated successfully!")
            setIsEditing(false)
        } catch (err) { setPrefsError(err.response?.data?.detail || "Update failed") }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col selection:bg-primary selection:text-white relative">
            {/* Minimalist Floating HUD Header */}
            <header className={clsx(
                "fixed top-0 left-0 right-0 z-[50] px-6 md:px-12 lg:px-16 transition-all duration-700 h-20 md:h-24 flex items-center justify-between",
                scrolled ? "h-16 md:h-20 bg-black/80 backdrop-blur-3xl border-b border-primary/20" : "bg-transparent"
            )}>
                <div className="flex items-center gap-16">
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-2xl italic tracking-tighter shadow-[0_0_20px_hsla(var(--primary),0.3)] group-hover:scale-110 group-hover:rotate-6 transition-all">
                            UQ
                        </div>
                        <div className="hidden lg:block overflow-hidden h-6">
                            <span className="font-black text-2xl tracking-tighter uppercase italic block group-hover:-translate-y-full transition-transform duration-500">UniQuest</span>
                            <span className="font-black text-2xl tracking-tighter uppercase italic block text-primary transition-transform duration-500">Origin_Hub</span>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-10">
                    <nav className="hidden lg:flex items-center gap-12">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "text-[10px] font-black uppercase tracking-[0.5em] transition-all hover:text-primary italic",
                                    location.pathname === item.path ? "text-primary flex items-center gap-2" : "text-white/40"
                                )}
                            >
                                {location.pathname === item.path && <div className="w-1 h-1 rounded-full bg-primary animate-pulse shadow-[0_0_5px_hsla(var(--primary),0.8)]" />}
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="h-6 w-[1px] bg-white/10 hidden lg:block" />

                    <button
                        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                        className="flex items-center gap-5 group py-2"
                    >
                        <div className="flex flex-col items-end leading-none hidden md:block">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Operator</p>
                            <p className="text-sm font-black italic uppercase text-white group-hover:text-primary transition-colors">{user?.username}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full border-2 border-primary/20 bg-surface flex items-center justify-center font-black text-sm hover:border-primary hover:bg-primary hover:text-white transition-all shadow-[0_0_15px_hsla(var(--primary),0.2)]">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                        {isAccountMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsAccountMenuOpen(false)} />
                                <div className="absolute top-[calc(100%+20px)] right-8 w-72 bg-black border border-primary/20 p-6 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-[60] overflow-hidden animate-in fade-in slide-in-from-top-6">
                                    <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none"><Zap size={100} /></div>
                                    <div className="border-b border-white/5 pb-6 mb-4">
                                        <p className="text-2xl font-black italic uppercase leading-none">{user?.username}</p>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-3 italic">Verified Specialized Unit</p>
                                    </div>
                                    <div className="space-y-2">
                                        <button onClick={() => { setIsAccountMenuOpen(false); setIsPrefsModalOpen(true); }} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all group/btn">
                                            <span className="flex items-center gap-4"><Settings size={16} className="text-primary/60 group-hover/btn:rotate-90 transition-transform" /> Identity Protocol</span>
                                            <ChevronRight size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                        </button>
                                        <button onClick={() => { setIsAccountMenuOpen(false); logout(); }} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all group/btn">
                                            <span className="flex items-center gap-4"><LogOut size={16} /> Terminate Sync</span>
                                            <X size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-3 bg-white/5 rounded-2xl text-white/60 hover:text-white transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* Mobile Slide-in Hub */}
            <div className={clsx("fixed inset-0 z-[100] flex transition-all duration-1000 pointer-events-none", isSidebarOpen && "pointer-events-auto")}>
                <div className={clsx("absolute inset-0 bg-black/95 backdrop-blur-3xl transition-opacity duration-1000", isSidebarOpen ? "opacity-100" : "opacity-0")} onClick={() => setIsSidebarOpen(false)} />
                <div className={clsx("relative w-full h-full flex flex-col p-12 transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]", isSidebarOpen ? "translate-y-0" : "translate-y-full")}>
                    <div className="fixed inset-0 grid-overlay opacity-[0.1] pointer-events-none" />
                    <div className="flex justify-between items-center mb-24 relative z-10">
                        <span className="font-black text-5xl italic tracking-tighter">UQ<span className="text-primary">.</span></span>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-6 rounded-full border border-primary/20 hover:bg-primary transition-all"><X size={32} /></button>
                    </div>
                    <nav className="flex flex-col gap-10 relative z-10">
                        {navItems.map((item, idx) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className="group flex flex-col items-start"
                            >
                                <span className="text-[12px] font-black text-primary uppercase tracking-[0.5em] mb-2 italic opacity-40 group-hover:opacity-100 transition-opacity">0{idx + 1} System</span>
                                <span className="text-7xl md:text-8xl font-black italic uppercase tracking-[calc(-0.06em)] group-hover:translate-x-8 transition-all duration-700">
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Operational Surface */}
            <main className="flex-1 pt-24 relative z-[1]">
                {children}
            </main>

            {/* Production Grade Footer */}
            <footer className="px-6 md:px-12 lg:px-24 py-20 md:py-32 border-t border-white/5 relative z-[1] overflow-hidden bg-surface/20">
                <div className="absolute bottom-0 right-0 p-32 opacity-[0.02] pointer-events-none"><Map size={350} /></div>
                <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-end gap-16 md:gap-20">
                    <div className="space-y-8">
                        <span className="font-black text-6xl italic tracking-tighter">UQ<span className="text-primary">.</span></span>
                        <p className="text-white/30 font-black uppercase tracking-[0.4em] text-[10px] italic max-w-sm leading-relaxed">Defining technical predators via deployment-based legacy forge system v2.5.0</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-16 lg:gap-32 w-full lg:w-auto">
                        <div className="space-y-6">
                            <p className="text-[10px] font-black uppercase text-primary tracking-[0.5em] italic">Intelligence</p>
                            <div className="flex flex-col gap-4 text-sm font-black italic text-white/40">
                                <a href="#" className="hover:text-white transition-colors">GitHub</a>
                                <a href="#" className="hover:text-white transition-colors">Discord</a>
                                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            </div>
                        </div>
                        <div className="space-y-6 text-right md:text-left">
                            <p className="text-[10px] font-black uppercase text-primary tracking-[0.5em] italic">Directives</p>
                            <div className="flex flex-col gap-4 text-sm font-black italic text-white/40">
                                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                                <a href="#" className="hover:text-white transition-colors">Terms</a>
                                <a href="#" className="hover:text-white transition-colors">Security</a>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/10 text-right">© 2025 UNIQUEST ORIGINS GLOBAL COUNCIL</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Identity Sync Hub (Pref Modal) */}
            {isPrefsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => !isEditing && setIsPrefsModalOpen(false)} />
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-black border border-primary/20 rounded-[2rem] md:rounded-[4rem] overflow-hidden animate-in zoom-in-95 duration-700 flex flex-col md:flex-row shadow-[0_40px_100px_rgba(0,0,0,0.9)]">
                        <div className="md:w-1/3 bg-primary p-8 md:p-12 text-white flex flex-col justify-between relative">
                            <div className="absolute top-0 left-0 p-8 md:p-12 opacity-10 pointer-events-none rotate-12"><Zap size={150} fill="white" /></div>
                            <div className="relative z-10 space-y-6">
                                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-primary font-black italic text-4xl shadow-2xl">{user?.username?.[0]?.toUpperCase()}</div>
                                <h3 className="text-4xl font-black italic uppercase leading-none tracking-tighter">{user?.username}</h3>
                            </div>
                            <div className="relative z-10 p-6 bg-black/20 rounded-3xl backdrop-blur-md">
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">Sync Rank</p>
                                <p className="text-xl font-black italic uppercase">Level {stats.level} Specialist</p>
                            </div>
                        </div>

                        <div className="md:w-2/3 p-12 lg:p-20 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-16">
                                <h3 className="text-3xl font-black italic uppercase italic tracking-tighter">Sync Integrity</h3>
                                <button onClick={() => setIsPrefsModalOpen(false)} className="p-4 rounded-2xl bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-all"><X size={24} /></button>
                            </div>

                            {prefsError && <p className="mb-8 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 font-black italic uppercase tracking-[0.2em] text-[10px]">{prefsError}</p>}
                            {prefsSuccess && <p className="mb-8 p-6 bg-green-500/5 border border-green-500/20 rounded-2xl text-green-500 font-black italic uppercase tracking-[0.2em] text-[10px]">{prefsSuccess}</p>}

                            <form onSubmit={handleUpdateProfile} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-2 italic">Operator Alias</label>
                                        <input value={isEditing ? editData.username : user?.username} readOnly={!isEditing} onChange={(e) => setEditData({ ...editData, username: e.target.value })} className="w-full bg-white/5 border border-white/5 p-6 rounded-2xl text-white font-black italic uppercase text-sm focus:border-primary/50" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-2 italic">Security Mail</label>
                                        <input value={isEditing ? editData.email : user?.email} readOnly={!isEditing} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="w-full bg-white/5 border border-white/5 p-6 rounded-2xl text-white font-black italic uppercase text-sm focus:border-primary/50" />
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div className="space-y-10 pt-8 border-t border-white/5 animate-in fade-in duration-700">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] ml-2 italic">Root Key Authorization (Old Key)</label>
                                            <input type="password" value={editData.old_password} onChange={(e) => setEditData({ ...editData, old_password: e.target.value })} className="w-full bg-red-500/5 border border-red-500/10 p-6 rounded-2xl text-white italic" placeholder="••••••••" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-2 italic">Define New Key</label>
                                                <input type="password" value={editData.password} onChange={(e) => setEditData({ ...editData, password: e.target.value })} className="w-full bg-white/5 border border-white/5 p-6 rounded-2xl text-white italic" placeholder="••••••••" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-2 italic">Confirm Matrix Key</label>
                                                <input type="password" value={editData.confirm_password} onChange={(e) => setEditData({ ...editData, confirm_password: e.target.value })} className="w-full bg-white/5 border border-white/5 p-6 rounded-2xl text-white italic" placeholder="••••••••" />
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button type="submit" className="flex-1 py-6 bg-white text-black font-black uppercase text-[10px] tracking-[0.5em] italic rounded-2xl hover:bg-primary hover:text-white transition-all shadow-2xl">Execute Integrity Update</button>
                                            <button type="button" onClick={() => setIsEditing(false)} className="px-10 py-6 bg-white/5 font-black uppercase text-[10px] tracking-[0.5em] italic rounded-2xl hover:bg-white/10 transition-all">Abort Sync</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button type="button" onClick={handleStartEdit} className="w-full py-6 bg-white text-black font-black uppercase text-[10px] tracking-[0.5em] italic rounded-2xl hover:bg-primary hover:text-white transition-all group flex items-center justify-center gap-6">
                                        <Settings size={20} className="group-hover:rotate-90 transition-transform" /> Initialize Identity Edit
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
