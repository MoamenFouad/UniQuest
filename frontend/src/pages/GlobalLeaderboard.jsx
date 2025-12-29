import { useState, useEffect } from "react"
import api from "../api"
import { clsx } from "clsx"
import { Trophy, Zap, Shield, Search, TrendingUp, Map, Mail } from "lucide-react"

export function GlobalLeaderboard() {
    const [leaderboard, setLeaderboard] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLeaderboard()
    }, [])

    const fetchLeaderboard = async () => {
        try {
            const { data } = await api.get("/dashboard")
            setLeaderboard(data.top_adventurers || [])
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 bg-black">
            <div className="w-16 h-16 relative">
                <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={24} />
            </div>
            <p className="text-primary font-black uppercase tracking-[0.6em] text-[10px] italic">Synchronizing Global Council...</p>
        </div>
    )

    return (
        <div className="space-y-24 md:space-y-32 bg-black pb-32 md:pb-48 relative overflow-hidden">
            {/* Studio Grid Background */}
            <div className="absolute inset-0 grid-overlay opacity-[0.05] pointer-events-none" />

            {/* Cinematic Header */}
            <section className="space-y-8 md:space-y-12 relative z-10 px-6 md:px-12">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="h-[2px] w-12 md:w-24 bg-primary" />
                    <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] italic">kol shahr feeh gift lel top preformer</span>
                </div>
                <h1 className="text-5xl md:text-[7rem] lg:text-[9rem] font-black text-white italic uppercase tracking-[calc(-0.06em)] leading-[0.9] pr-16 overflow-visible">
                    THE <br /> <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary bg-[length:200%_auto] animate-[gradient_10s_linear_infinite] pr-4">LEADERBOARD.&nbsp;</span>
                </h1>
                <div className="max-w-3xl">
                    <p className="text-white/40 text-xl md:text-3xl font-medium italic leading-tight">
                        Kosh shoof meen da7e7 el app.
                    </p>
                </div>
            </section>

            {/* High-Production Ranking Matrix */}
            <section className="border-y border-white/5 relative z-10 bg-white/[0.01]">
                {leaderboard.map((entry, idx) => (
                    <div
                        key={entry.user_id}
                        className="group flex flex-col md:flex-row items-stretch border-b border-white/5 last:border-0 transition-all duration-1000 hover:bg-white/[0.04] relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="w-full md:w-32 lg:w-40 p-8 md:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 font-black text-4xl md:text-6xl italic transition-all group-hover:bg-primary group-hover:text-white lg:group-hover:px-16">
                            0{idx + 1}
                        </div>

                        <div className="flex-1 p-8 md:p-12 lg:p-16 flex items-center gap-8 md:gap-12 relative z-10">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-primary/20 bg-surface flex items-center justify-center font-black text-xl md:text-2xl italic group-hover:border-primary group-hover:rotate-12 transition-all shadow-[0_0_30px_hsla(var(--primary),0.2)]">
                                {entry.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="space-y-2 md:space-y-3">
                                <h4 className="text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter group-hover:text-white transition-all group-hover:translate-x-6">
                                    {entry.username}
                                </h4>
                                <div className="flex items-center gap-3 md:gap-4 opacity-30 group-hover:opacity-100 transition-all">
                                    <Mail size={12} className="text-primary" />
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] italic text-primary">{entry.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 lg:p-16 flex flex-col md:items-end justify-center relative z-10">
                            <div className="flex items-center gap-3 md:gap-4">
                                <TrendingUp size={20} className="text-primary/40 group-hover:text-primary transition-colors" />
                                <span className="text-4xl md:text-6xl lg:text-7xl font-black italic leading-none group-hover:scale-110 transition-transform origin-right">
                                    {entry.total_xp.toLocaleString()}
                                </span>
                            </div>
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mt-2 md:mt-4 italic group-hover:text-secondary transition-colors">Combat Capability_XP</span>
                        </div>
                    </div>
                ))}

                {leaderboard.length === 0 && (
                    <div className="p-24 md:p-48 text-center bg-black">
                        <Zap size={48} md:size={64} className="mx-auto mb-6 text-white/10" />
                        <p className="text-white/20 font-black uppercase tracking-[0.6em] italic text-lg md:text-xl">Council Chamber Silent_Initialize Ops</p>
                    </div>
                )}
            </section>

            {/* Tactical Meta Footer */}
            <section className="flex flex-col md:flex-row justify-between items-center px-8 md:px-12 gap-6 md:gap-8 relative z-10 opacity-30 italic font-black uppercase text-[9px] md:text-[10px] tracking-[0.6em]">
                <div className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-primary animate-ping" /> Synchronized Processing_Active</div>
                <div className="flex items-center gap-6 md:gap-8">
                    <span>Active Units: {leaderboard.length.toLocaleString()}</span>
                    <span>Protocol_V2.5.0</span>
                </div>
            </section>
        </div>
    )
}
