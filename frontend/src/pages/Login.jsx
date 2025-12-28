import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { ShieldCheck, User, Mail, Lock, AlertCircle, Eye, EyeOff, Zap, ArrowRight, Shield } from "lucide-react"
import { clsx } from "clsx"

export function Login() {
    const { login, signup, loginWithSocial } = useAuth()
    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        username: "", email: "", password: "", confirm_password: "", student_id: "", identifier: ""
    })
    const [error, setError] = useState("")
    const [isConnecting, setIsConnecting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 6000)
            return () => clearTimeout(timer)
        }
    }, [error])

    const handleSocialLogin = async (provider) => {
        setError(""); setIsConnecting(true)
        try { await loginWithSocial(provider) }
        catch (err) { setError(`Connection Failed: ${err.code || err.message}`) }
        finally { setIsConnecting(false) }
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(""); setIsLoading(true)
        try {
            if (isLogin) { await login(formData.identifier, formData.password) }
            else {
                if (formData.password !== formData.confirm_password) { setError("Security Breach: Password mismatch"); setIsLoading(false); return }
                await signup({ username: formData.username, email: formData.email, password: formData.password, student_id: formData.student_id })
            }
        } catch (err) { setError(err.response?.data?.detail || "Authentication sequence failed.") }
        finally { setIsLoading(false) }
    }

    return (
        <div className="min-h-screen bg-black flex flex-col md:flex-row items-stretch selection:bg-primary selection:text-white font-sans overflow-hidden">
            {/* Studio Grid Background */}
            <div className="fixed inset-0 grid-overlay opacity-[0.05] pointer-events-none" />

            {/* Left: Branding & Visuals */}
            <div className="hidden md:flex md:w-1/2 bg-black relative items-center justify-center p-12 lg:p-24">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[200px] animate-pulse" />

                <div className="relative z-10 space-y-8 md:space-y-10 max-w-lg overflow-visible">
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] w-12 bg-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Student Portal</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black text-white italic leading-[0.9] tracking-tighter uppercase overflow-visible pb-4">
                        UNIQUEST <br /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">HUB.</span>
                    </h1>
                    <p className="text-white/60 text-xl md:text-2xl font-medium mt-8 md:mt-12 leading-relaxed">Collaborate, manage assets, and track your university journey.</p>
                </div>
            </div>

            {/* Right: Auth Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative overflow-hidden bg-black/40 backdrop-blur-3xl">
                {/* Visual Accent */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-[100px]" />

                <div className="w-full max-w-md space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 relative z-10">
                    <div className="space-y-6">
                        <div className="flex bg-white/5 p-1 rounded-full border border-white/5 w-fit">
                            <button onClick={() => setIsLogin(true)} className={clsx("px-8 md:px-10 py-3 md:py-4 rounded-full text-xs font-bold uppercase tracking-wide transition-all", isLogin ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white")}>Sign In</button>
                            <button onClick={() => setIsLogin(false)} className={clsx("px-8 md:px-10 py-3 md:py-4 rounded-full text-xs font-bold uppercase tracking-wide transition-all", !isLogin ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white")}>Sign Up</button>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome <span className="text-primary">Back</span></h3>
                    </div>

                    {error && (
                        <div className="p-4 md:p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 animate-in slide-in-from-top-4">
                            <AlertCircle size={20} className="shrink-0" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                        {isLogin ? (
                            <div className="space-y-6 md:space-y-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-primary uppercase tracking-wider ml-2">Email or Username</label>
                                    <input name="identifier" value={formData.identifier} onChange={(e) => setFormData({ ...formData, identifier: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-6 md:px-8 py-4 text-white focus:outline-none focus:border-primary/50 font-medium text-sm md:text-base placeholder:text-white/20 transition-all" placeholder="Enter your email" required />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-primary uppercase tracking-wider ml-2">Password</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-6 md:px-8 py-4 text-white focus:outline-none focus:border-primary/50 font-medium text-sm md:text-base placeholder:text-white/20 transition-all" placeholder="Enter your password" required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary transition-colors">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="username" placeholder="Username" onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 md:px-6 py-4 text-white font-medium text-sm placeholder:text-white/20 focus:border-primary/50 transition-all" required />
                                    <input name="email" placeholder="Email Address" onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 md:px-6 py-4 text-white font-medium text-sm placeholder:text-white/20 focus:border-primary/50 transition-all" required />
                                </div>
                                <input name="student_id" placeholder="Student ID (Optional)" onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-6 md:px-8 py-4 text-white font-medium text-sm placeholder:text-white/20 focus:border-primary/50 transition-all" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="password" name="password" placeholder="Password" onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 md:px-6 py-4 text-white font-medium text-sm placeholder:text-white/20 focus:border-primary/50 transition-all" required />
                                    <input type="password" name="confirm_password" placeholder="Confirm Password" onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 md:px-6 py-4 text-white font-medium text-sm placeholder:text-white/20 focus:border-primary/50 transition-all" required />
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className="w-full py-4 bg-white text-black rounded-xl font-bold uppercase tracking-wider text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 shadow-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10">{isLoading ? "Connecting..." : isLogin ? "Login to Portal" : "Create Account"}</span>
                            <ArrowRight size={18} className="relative z-10" />
                        </button>
                    </form>

                    <div className="pt-8 md:pt-12 border-t border-white/5">
                        <p className="text-center text-[10px] text-white/30 font-bold uppercase tracking-widest mb-6 md:mb-10">Or continue with</p>
                        {/* Social Login Buttons - Explicit SVGs */}
                        <div className="flex justify-center gap-6">
                            <button onClick={() => handleSocialLogin('google')} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-white/10 flex items-center justify-center bg-white hover:bg-white text-white hover:text-black transition-all hover:scale-110 active:scale-90 hover:rotate-6 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(66,133,244,0.4)] relative group overflow-hidden">
                                <svg className="w-6 h-6 md:w-8 md:h-8 z-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </button>
                            <button onClick={() => handleSocialLogin('facebook')} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-white/10 flex items-center justify-center bg-white hover:bg-white text-[#1877F2] transition-all hover:scale-110 active:scale-90 hover:rotate-6 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(24,119,242,0.4)] relative group overflow-hidden">
                                <svg className="w-6 h-6 md:w-8 md:h-8 z-10" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </button>
                            <button onClick={() => handleSocialLogin('apple')} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-white/10 flex items-center justify-center bg-white hover:bg-white text-black transition-all hover:scale-110 active:scale-90 hover:rotate-6 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] relative group overflow-hidden">
                                <svg className="w-6 h-6 md:w-8 md:h-8 z-10" viewBox="0 0 384 512" fill="currentColor">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

