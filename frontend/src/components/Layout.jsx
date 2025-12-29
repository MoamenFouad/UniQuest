import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useApp } from "../context/AppContext"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Trophy, LogOut, Menu, X, ChevronRight, Settings, Zap, Map, Shield, Target, Eye, EyeOff } from "lucide-react"
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
    const [profilePicture, setProfilePicture] = useState(null)
    const [profilePicturePreview, setProfilePicturePreview] = useState(null)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navItems = [
        { icon: LayoutDashboard, label: "Home", path: "/" },
        { icon: Users, label: "Rooms", path: "/rooms" },
        { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
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
                        <div className="hidden lg:block h-7 overflow-hidden">
                            <span className="font-black text-2xl tracking-tighter uppercase italic block group-hover:-translate-y-full transition-all duration-500 pr-4">UniQuest</span>
                            <span className="font-black text-2xl tracking-tighter uppercase italic block text-hollow transition-all duration-500 group-hover:-translate-y-full pr-4">UniQuest</span>
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
                            <p className="text-sm font-bold uppercase text-white group-hover:text-primary transition-colors">{user?.username}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full border-2 border-primary/20 bg-surface flex items-center justify-center font-black text-sm hover:border-primary hover:bg-primary hover:text-white transition-all shadow-[0_0_15px_hsla(var(--primary),0.2)] overflow-hidden">
                            {user?.profile_picture ? (
                                <img src={user.profile_picture} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                user?.username?.[0]?.toUpperCase()
                            )}
                        </div>
                        {/* Sidebar Trigger (Avatar) - Dropdown Removed */}
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

            {/* Right Sidebar: Account Hub */}
            <div className={clsx("fixed inset-0 z-[100] transition-all duration-700", isAccountMenuOpen ? "pointer-events-auto" : "pointer-events-none")}>
                {/* Backdrop */}
                <div
                    className={clsx("absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-700", isAccountMenuOpen ? "opacity-100" : "opacity-0")}
                    onClick={() => setIsAccountMenuOpen(false)}
                />

                {/* Sidebar Panel */}
                <div className={clsx("absolute top-0 right-0 h-full w-full md:w-[480px] bg-[#050505] border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]", isAccountMenuOpen ? "translate-x-0" : "translate-x-full")}>

                    {/* Header */}
                    <div className="p-8 md:p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-white/80">Account Center</h2>
                        <button onClick={() => setIsAccountMenuOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 group/hub">
                        {/* Profile Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-8 text-center group-hover/hub:border-primary/20 transition-colors">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12"><Zap size={150} /></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px] mb-6 shadow-xl">
                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                        {user?.profile_picture ? (
                                            <img src={user.profile_picture} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-black italic text-white">{user?.username?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">{user?.username}</h3>
                                <p className="text-sm font-medium text-white/40 mb-6">{user?.email}</p>
                                <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                                    Student
                                </span>
                            </div>
                        </div>

                        {/* Menu Actions */}
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-white/20 uppercase tracking-widest pl-2 mb-2">Preferences</p>

                            <button onClick={() => { setIsAccountMenuOpen(false); setIsPrefsModalOpen(true); }} className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group/item text-left">
                                <div className="p-3 rounded-xl bg-black text-white group-hover/item:text-primary transition-colors">
                                    <Settings size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">Profile Settings</p>
                                    <p className="text-xs text-white/40 mt-1">Update personal information</p>
                                </div>
                                <ChevronRight size={16} className="ml-auto text-white/20 group-hover/item:text-white transition-colors" />
                            </button>
                        </div>

                        {/* Danger Zone */}
                        <div className="pt-8 border-t border-white/5">
                            <button onClick={() => { setIsAccountMenuOpen(false); logout(); }} className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all font-bold uppercase tracking-wider text-xs">
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
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
                        <p className="text-white/30 font-black uppercase tracking-[0.4em] text-[10px] italic max-w-sm leading-relaxed">Empowering students with advanced learning tools v2.5.0</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-16 lg:gap-32 w-full lg:w-auto">
                        <div className="space-y-6">
                            <p className="text-[10px] font-black uppercase text-primary tracking-[0.5em] italic">Resources</p>
                            <div className="flex flex-col gap-4 text-sm font-black italic text-white/40">
                                <a href="#" className="hover:text-white transition-colors">GitHub</a>
                                <a href="#" className="hover:text-white transition-colors">Discord</a>
                                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            </div>
                        </div>
                        <div className="space-y-6 text-right md:text-left">
                            <p className="text-[10px] font-black uppercase text-primary tracking-[0.5em] italic">Legal</p>
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
                                {/* Profile Picture Upload */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-2 italic">Profile Picture</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px] shadow-xl">
                                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                                {profilePicturePreview || user?.profile_picture ? (
                                                    <img src={profilePicturePreview || user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl font-black italic text-white">{user?.username?.[0]?.toUpperCase()}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        setProfilePicture(file)
                                                        const reader = new FileReader()
                                                        reader.onloadend = () => setProfilePicturePreview(reader.result)
                                                        reader.readAsDataURL(file)
                                                    }
                                                }}
                                                className="hidden"
                                                id="profile-picture-upload"
                                                disabled={!isEditing}
                                            />
                                            <label
                                                htmlFor="profile-picture-upload"
                                                className={`inline-block px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-[10px] tracking-[0.3em] italic transition-all ${isEditing ? 'cursor-pointer hover:bg-white/10 hover:border-primary/30' : 'opacity-50 cursor-not-allowed'
                                                    }`}
                                            >
                                                Choose Image
                                            </label>
                                            {profilePicturePreview && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProfilePicture(null)
                                                        setProfilePicturePreview(null)
                                                    }}
                                                    className="ml-4 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 font-black uppercase text-[10px] tracking-[0.3em] italic hover:bg-red-500/20 transition-all"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

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
                                        {/* Change Password Button or Password Fields */}
                                        {!isChangingPassword ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsChangingPassword(true)}
                                                className="w-full py-6 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-[0.4em] italic rounded-2xl hover:bg-white/10 hover:border-primary/30 transition-all flex items-center justify-center gap-4"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                                Change Password
                                            </button>
                                        ) : (
                                            <div className="space-y-6 animate-in fade-in duration-500">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-sm font-black text-primary uppercase tracking-widest italic">Password Change</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsChangingPassword(false)
                                                            setEditData({ ...editData, old_password: "", password: "", confirm_password: "" })
                                                        }}
                                                        className="text-white/40 hover:text-red-500 transition-colors"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>

                                                {/* Step 1: Old Password */}
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ml-2 italic flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">1</span>
                                                        Current Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showOldPassword ? "text" : "password"}
                                                            value={editData.old_password}
                                                            onChange={(e) => setEditData({ ...editData, old_password: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 p-6 pr-14 rounded-2xl text-white italic focus:border-primary/50 focus:bg-white/10 transition-all"
                                                            placeholder="Enter current password"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                                        >
                                                            {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Step 2: New Password */}
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ml-2 italic flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">2</span>
                                                        New Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showNewPassword ? "text" : "password"}
                                                            value={editData.password}
                                                            onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 p-6 pr-14 rounded-2xl text-white italic focus:border-primary/50 focus:bg-white/10 transition-all"
                                                            placeholder="Enter new password"
                                                            disabled={!editData.old_password}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                                            disabled={!editData.old_password}
                                                        >
                                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Step 3: Confirm Password */}
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ml-2 italic flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">3</span>
                                                        Confirm New Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            value={editData.confirm_password}
                                                            onChange={(e) => setEditData({ ...editData, confirm_password: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 p-6 pr-14 rounded-2xl text-white italic focus:border-primary/50 focus:bg-white/10 transition-all"
                                                            placeholder="Confirm new password"
                                                            disabled={!editData.password}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                                            disabled={!editData.password}
                                                        >
                                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-4 pt-4">
                                            <button type="submit" className="flex-1 py-6 bg-white text-black font-black uppercase text-[10px] tracking-[0.5em] italic rounded-2xl hover:bg-primary hover:text-white transition-all shadow-2xl">Save Changes</button>
                                            <button type="button" onClick={() => { setIsEditing(false); setIsChangingPassword(false); }} className="px-10 py-6 bg-white/5 font-black uppercase text-[10px] tracking-[0.5em] italic rounded-2xl hover:bg-white/10 transition-all">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button type="button" onClick={handleStartEdit} className="w-full py-6 bg-white text-black font-black uppercase text-[10px] tracking-[0.5em] italic rounded-2xl hover:bg-primary hover:text-white transition-all group flex items-center justify-center gap-6">
                                        <Settings size={20} className="group-hover:rotate-90 transition-transform" /> Edit Profile
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
