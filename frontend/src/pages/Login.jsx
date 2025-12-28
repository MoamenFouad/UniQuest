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
            <div className="hidden md:flex md:w-1/2 bg-black border-r border-white/5 relative items-center justify-center p-12 lg:p-24 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[200px] animate-pulse" />

                <div className="relative z-10 space-y-8 md:space-y-10 max-w-lg">
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] w-12 bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary italic">Initialization Matrix</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black text-white italic leading-[0.9] tracking-tighter uppercase">
                        UNIQUEST <br /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">ORIGINS.</span>
                    </h1>
                    <p className="text-white/40 text-xl md:text-2xl font-medium italic mt-8 md:mt-12 leading-relaxed">Secure operational gateway for the global technical council.</p>
                </div>
            </div>

            {/* Right: Auth Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative overflow-hidden bg-black/40 backdrop-blur-3xl">
                {/* Visual Accent */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-[100px]" />

                <div className="w-full max-w-md space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 relative z-10">
                    <div className="space-y-6">
                        <div className="flex bg-white/5 p-1 rounded-full border border-white/5 w-fit">
                            <button onClick={() => setIsLogin(true)} className={clsx("px-8 md:px-10 py-3 md:py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all italic", isLogin ? "bg-primary text-white shadow-[0_0_20px_hsla(var(--primary),0.3)]" : "text-white/40 hover:text-white")}>Authorize</button>
                            <button onClick={() => setIsLogin(false)} className={clsx("px-8 md:px-10 py-3 md:py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all italic", !isLogin ? "bg-primary text-white shadow-[0_0_20px_hsla(var(--primary),0.3)]" : "text-white/40 hover:text-white")}>Initialize</button>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">Access <span className="text-primary">Key_</span></h3>
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
                                    <label className="text-[11px] font-black text-primary uppercase tracking-[0.5em] ml-2 italic">Operator Identity</label>
                                    <input name="identifier" value={formData.identifier} onChange={(e) => setFormData({ ...formData, identifier: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 md:px-8 py-5 md:py-6 text-white focus:outline-none focus:border-primary/50 font-black italic text-sm md:text-base placeholder:text-white/10 transition-all" placeholder="UNI_CODE_OR_MAIL" required />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-primary uppercase tracking-[0.5em] ml-2 italic">Authorization Key</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 md:px-8 py-5 md:py-6 text-white focus:outline-none focus:border-primary/50 font-black italic text-sm md:text-base placeholder:text-white/10 transition-all" placeholder="••••••••" required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary transition-colors">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="username" placeholder="ALIAS" onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="bg-white/5 border border-white/5 rounded-2xl px-4 md:px-6 py-4 md:py-5 text-white font-black italic text-xs md:text-sm placeholder:text-white/10 focus:border-primary/50 transition-all" required />
                                    <input name="email" placeholder="SECURE_EMAIL" onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-white/5 border border-white/5 rounded-2xl px-4 md:px-6 py-4 md:py-5 text-white font-black italic text-xs md:text-sm placeholder:text-white/10 focus:border-primary/50 transition-all" required />
                                </div>
                                <input name="student_id" placeholder="STUDENT_COUNCIL_ID (OPTIONAL)" onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 md:px-8 py-4 md:py-5 text-white font-black italic text-xs md:text-sm placeholder:text-white/10 focus:border-primary/50 transition-all" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="password" name="password" placeholder="NEW_ACCESS_KEY" onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bg-white/5 border border-white/5 rounded-2xl px-4 md:px-6 py-4 md:py-5 text-white font-black italic text-xs md:text-sm placeholder:text-white/10 focus:border-primary/50 transition-all" required />
                                    <input type="password" name="confirm_password" placeholder="CONFIRM_KEY" onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} className="bg-white/5 border border-white/5 rounded-2xl px-4 md:px-6 py-4 md:py-5 text-white font-black italic text-xs md:text-sm placeholder:text-white/10 focus:border-primary/50 transition-all" required />
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className="w-full py-6 md:py-8 bg-white text-black rounded-full font-black uppercase tracking-[0.5em] text-[10px] md:text-xs italic hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10">{isLoading ? "SYNCING..." : isLogin ? "INIT_AUTHORIZATION" : "INIT_PROTOCOL"}</span>
                            <ArrowRight size={18} className="relative z-10" />
                        </button>
                    </form>

                    <div className="pt-8 md:pt-12 border-t border-white/5">
                        <p className="text-center text-[10px] text-white/20 font-black uppercase tracking-[0.4em] mb-6 md:mb-10 italic">Synchronize via Global Provider</p>
                        {/* Social Login Buttons - Explicit SVGs */}
                        <button onClick={() => handleSocialLogin('google')} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white hover:border-white text-white hover:text-black transition-all hover:scale-110 active:scale-90 relative group">
                            <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg>
                        </button>
                        <button onClick={() => handleSocialLogin('facebook')} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] text-white transition-all hover:scale-110 active:scale-90 relative group">
                            <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </button>
                        <button onClick={() => handleSocialLogin('apple')} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white hover:border-white text-white hover:text-black transition-all hover:scale-110 active:scale-90 relative group">
                            <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.29-1.23 3.57-1.23.46 0 1.7.21 2.37.94-.54.32-1.25.88-1.28 1.85-.04 2.16 2.39 3.01 2.72 3.81.36.94.9 2.22 1.48 4.08-.66 1.49-1.88 3.01-2.94 2.78zM13.03 5.37c-3.13-.39-4.8 1.93-4.59 4.14 2.3 0 4.67-2.3 4.59-4.14z" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

