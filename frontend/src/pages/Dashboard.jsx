import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useApp } from "../context/AppContext"
import { Trophy, Flame, Target, ArrowRight, TrendingUp, Zap, ChevronRight, Map, Shield } from "lucide-react"
import { clsx } from "clsx"

export function Dashboard() {
    const { user } = useAuth()
    const { stats, leaderboard } = useApp()

    const currentLevelXp = (stats.level - 1) * 100
    const progressInLevel = stats.xp - currentLevelXp
    const progressPercent = (progressInLevel / 100) * 100
    const topLeaderboard = leaderboard.slice(0, 5)

    const universityQuotes = [
        "khosh e3ml upload besor3a el streak hatroo7",
        "bs ba2olak eh kont 7adart el mo7adra w akhadt XP"
    ]

    useEffect(() => {
        if (window.gsap) {
            const gsap = window.gsap
            const ScrollTrigger = window.ScrollTrigger
            gsap.registerPlugin(ScrollTrigger)

            // Hero Cinematic Reveal
            const tl = gsap.timeline()
            tl.fromTo(".hero-title-part",
                { opacity: 0, y: 150, skewY: 7 },
                { opacity: 1, y: 0, skewY: 0, duration: 1.8, stagger: 0.15, ease: "expo.out" }
            )
            tl.fromTo(".hero-sub",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=1"
            )

            // Section Scrollers
            gsap.utils.toArray(".gsap-reveal").forEach((section) => {
                gsap.fromTo(section,
                    { opacity: 0, scale: 0.98, y: 40 },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 1.4,
                        ease: "power4.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 90%",
                            toggleActions: "play none none none"
                        }
                    }
                )
            })

            // Scroll indicator parallax
            gsap.to(".scroll-indicator", {
                y: -150,
                opacity: 0,
                scrollTrigger: {
                    trigger: ".hero-section",
                    start: "top top",
                    end: "bottom center",
                    scrub: 1
                }
            })
        }
    }, [])

    return (
        <div className="bg-black relative">
            {/* Studio Grid Background */}
            <div className="fixed inset-0 grid-overlay opacity-[0.03] pointer-events-none z-0" />

            {/* 1. Epic Hero Section */}
            <section className="hero-section relative min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden z-[10]">
                {/* Visual Auras */}
                <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[180px] animate-pulse z-[0]" />
                <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[180px] animate-pulse z-[0]" />

                <div className="relative text-center space-y-8 max-w-7xl">
                    <div className="hero-sub flex items-center justify-center gap-4 mb-4">
                        <div className="h-[1px] w-12 bg-primary/50" />
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary italic">Academic Progress Tracking</span>
                        <div className="h-[1px] w-12 bg-primary/50" />
                    </div>

                    <h1 className="text-[12vw] md:text-[10rem] lg:text-[13rem] font-black leading-[0.8] tracking-tighter italic uppercase flex flex-col">
                        <span className="hero-title-part overflow-hidden block">LEVEL UP</span>
                        <span className="hero-title-part overflow-hidden block bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary bg-[length:200%_auto] animate-[gradient_8s_linear_infinite]">YOUR STUDIES.</span>
                    </h1>

                    <div className="hero-sub flex flex-col md:flex-row items-center justify-center gap-12 pt-16">
                        <Link to="/rooms" className="group relative w-72">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-60 transition duration-1000"></div>
                            <button className="relative w-full py-8 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] italic rounded-full transition-transform active:scale-95 hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]">Create Room</button>
                        </Link>

                        {/* Interactive Divider Line */}
                        <div className="hidden md:flex h-24 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent items-center justify-center relative">
                            <div className="absolute w-[1px] h-12 bg-primary/50 blur-[2px] animate-pulse" />
                        </div>

                        <div className="w-72">
                            <button
                                onClick={() => document.getElementById('operational-grid')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full py-8 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.4em] text-[10px] italic rounded-full hover:bg-white/10 transition-all border-b-2 border-primary/20 hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                            >
                                My Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                {/* SCROLL Indicator */}
                <div className="scroll-indicator absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60 italic">Explore Platform</span>
                    <div className="scroll-indicator-line" />
                </div>
            </section>

            {/* 2. Motivation Engine (High-Impact Marquee) */}
            <section className="gsap-reveal relative z-[10] border-y border-white/5 py-20 bg-primary/[0.01] overflow-hidden">
                <div className="animate-marquee flex items-center gap-32 whitespace-nowrap">
                    {[...universityQuotes, ...universityQuotes].map((quote, i) => (
                        <div key={i} className="flex items-center gap-16">
                            <Zap className="text-primary/40" size={32} />
                            <p className="text-5xl md:text-7xl font-black text-white/60 italic uppercase tracking-tighter transition-all cursor-default select-none hover:text-primary hover:opacity-100">
                                {quote}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Operational Grid */}
            <section id="operational-grid" className="gsap-reveal max-w-[1800px] mx-auto p-8 md:p-24 lg:p-32 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-[10] items-start">
                {/* Left Side: Stats & Personal Meta */}
                <div className="lg:col-span-7 space-y-12 md:space-y-16">
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="h-[2px] w-12 md:w-20 bg-primary" />
                            <span className="text-primary font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px] italic">Identity Verified</span>
                        </div>
                        <h2 className="text-6xl md:text-8xl lg:text-[9rem] font-black text-white italic tracking-[calc(-0.06em)] leading-[0.8] uppercase">
                            YOUR <br /> <span className="text-white/60">PROGRESS.</span>
                        </h2>
                    </div>

                    <div className="minimal-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 hover-lift relative group overflow-hidden neon-glow-primary">
                        <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                            <Map size={250} />
                        </div>
                        <div className="flex justify-between items-start mb-12 md:mb-16 relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 md:mb-4">Student Profile</p>
                                <h4 className="text-4xl md:text-6xl font-black text-white italic uppercase">{user?.username}</h4>
                            </div>
                            <div className="p-4 md:p-6 bg-primary text-white rounded-2xl md:rounded-3xl shadow-[0_0_30px_hsla(var(--primary),0.4)]">
                                <Shield size={28} />
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Current Level: <span className="text-white">{stats.level}</span></p>
                                <p className="text-4xl font-black italic text-white">{progressInLevel} <span className="text-xs text-primary/60 not-italic">/ 100 XP</span></p>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Quick Stats Matrix */}
                <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
                    <div className="grid grid-cols-2 gap-6 md:gap-8">
                        <div className="minimal-card rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 flex flex-col justify-between group hover:border-secondary/30 transition-all aspect-square">
                            <Flame className="text-secondary/20 group-hover:text-secondary group-hover:scale-110 transition-all" size={28} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Study Streak</p>
                                <p className="text-3xl md:text-5xl font-black text-white italic">{stats.streak} Days</p>
                            </div>
                        </div>
                        <div className="minimal-card rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 flex flex-col justify-between group hover:border-primary/30 transition-all aspect-square">
                            <TrendingUp className="text-primary/20 group-hover:text-primary group-hover:scale-110 transition-all" size={28} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Global Rank</p>
                                <p className="text-3xl md:text-5xl font-black text-white italic">#{stats.rank || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full max-w-[600px] min-h-[280px] rounded-[32px] bg-[#f5f5f5] p-10 shadow-2xl overflow-hidden flex flex-col justify-between group select-none mx-auto hover:shadow-black/50 transition-shadow duration-500">
                        {/* Header: Title & Trophy */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3 group/title cursor-default">
                                <h3 className="text-[28px] font-black italic uppercase tracking-tighter text-black leading-none">
                                    Study Rooms
                                </h3>
                                <div className="text-4xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/title:-translate-y-2 group-hover/title:rotate-12 group-hover/title:scale-125 group-hover/title:drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] filter drop-shadow-md pb-2">
                                    🏆
                                </div>
                            </div>

                            {/* Top Right Icon Button */}
                            <div className="w-[44px] h-[44px] bg-black rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-500 hover:rotate-180 cursor-pointer">
                                <Target size={20} />
                            </div>
                        </div>

                        {/* Footer: Browse Button */}
                        <div className="relative z-10 pt-8">
                            <Link to="/rooms">
                                <button className="w-full bg-black text-white rounded-full py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:bg-neutral-900 group/btn text-sm">
                                    Browse Rooms
                                    <ArrowRight size={18} className="transition-transform duration-300 group-hover/btn:translate-x-2" />
                                </button>
                            </Link>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-gradient-to-br from-black/5 to-transparent rounded-full blur-[40px] pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* 4. The Council Preview */}
            <section className="gsap-reveal max-w-[1800px] mx-auto p-8 md:p-24 lg:p-32 relative z-[10]">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 md:mb-20 gap-8">
                    <h2 className="text-5xl md:text-7xl lg:text-[8rem] font-black text-white italic leading-[0.8] uppercase tracking-tighter">
                        GLOBAL <br /> <span className="text-white/60 text-[4rem] md:text-[6rem] lg:text-[10rem]">RANKINGS.</span>
                    </h2>
                    <Link to="/leaderboard" className="group">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60 group-hover:text-primary transition-colors flex items-center gap-4 italic mb-4">View Full Leaderboard <ArrowRight size={14} /></span>
                    </Link>
                </div>

                <div className="space-y-px bg-white/5 rounded-[3rem] overflow-hidden border border-white/5 neon-glow-secondary">
                    {topLeaderboard.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between p-10 md:p-14 bg-black hover:bg-white/[0.03] transition-all group">
                            <div className="flex items-center gap-10">
                                <span className="text-4xl font-black italic text-white/60 group-hover:text-secondary group-hover:translate-x-2 transition-all">0{i + 1}</span>
                                <div>
                                    <p className="text-3xl font-black text-white italic uppercase tracking-tighter">{entry.username}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-secondary mt-1">Verified Member</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black italic text-white leading-none">{entry.total_xp}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mt-2 italic">Points</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Production Outro */}
            <section className="gsap-reveal p-8 md:p-24 lg:p-32 z-[10] relative">
                <div className="bg-white/5 border border-white/10 rounded-[5rem] p-16 md:p-32 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative z-10 space-y-12">
                        <h2 className="text-8xl md:text-[12rem] font-black text-white italic leading-[0.8] tracking-[calc(-0.06em)] uppercase">
                            ACHIEVE <br /> <span className="text-white/60">MORE.</span>
                        </h2>
                        <div className="max-w-3xl mx-auto">
                            <p className="text-white/60 text-2xl md:text-3xl font-medium italic leading-tight mb-16">
                                Join or create a room with your friends and start winning.
                            </p>
                            <Link to="/rooms">
                                <button className="px-20 py-10 bg-white text-black font-black uppercase tracking-[0.6em] text-xs italic rounded-full shadow-[0_0_80px_hsla(var(--primary),0.3)] hover:scale-105 active:scale-95 transition-all">
                                    Get Started Now
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
