import { useAuth } from "../context/AuthContext"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Link } from "react-router-dom"
import { Trophy, Flame, Target, ArrowRight, Users, Crown } from "lucide-react"

export function Dashboard() {
    const { user } = useAuth()

    const stats = [
        { label: "Total XP", value: "1,250", icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
        { label: "Day Streak", value: "3", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
        { label: "Quests Done", value: "12", icon: Target, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    ]

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                    Welcome back, {user?.username}! 👋
                </h1>
                <p className="text-slate-400 text-lg">
                    Ready to continue your learning journey?
                </p>
            </div>

            {/* Stats Grid - 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Card
                        key={stat.label}
                        className={`flex items-center gap-4 bg-card border ${stat.border} shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer`}
                        hoverEffect
                    >
                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Features Grid - 3 Equal Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quest Card */}
                <Card className="bg-gradient-to-br from-indigo-950 to-violet-950 border-indigo-500/30 relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16 transition-all group-hover:bg-primary/20" />

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary-light text-xs font-bold border border-primary/30">
                                NEXT QUEST
                            </div>
                            <Target className="w-5 h-5 text-primary-light" />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-3">
                            Algorithms & Data Structures
                        </h2>

                        <p className="text-slate-300 text-sm mb-6 flex-grow">
                            New lecture available in Room 304. Complete the quiz to earn 50 XP and unlock achievements.
                        </p>

                        <Link to="/rooms" className="mt-auto">
                            <Button
                                variant="primary"
                                className="w-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300"
                            >
                                Start Quest <ArrowRight size={18} />
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Study Rooms Card */}
                <Card className="bg-card border-white/10 shadow-xl hover:shadow-2xl relative overflow-hidden group transition-all duration-300">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -ml-16 -mb-16 transition-all group-hover:bg-emerald-500/20" />

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Study Rooms</h2>
                            <Users className="w-5 h-5 text-emerald-400" />
                        </div>

                        <div className="mb-3">
                            <span className="text-3xl font-bold text-emerald-400">5</span>
                            <span className="text-slate-300 text-sm ml-2">Active Sessions</span>
                        </div>

                        <p className="text-slate-400 text-sm mb-6 flex-grow">
                            Join your peers in collaborative study sessions and boost your learning together.
                        </p>

                        <Link to="/rooms" className="mt-auto">
                            <Button
                                variant="outline"
                                className="w-full border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-white transition-all duration-300"
                            >
                                Browse Rooms
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Leaderboard Card */}
                <Card className="bg-card border-white/10 shadow-xl hover:shadow-2xl relative overflow-hidden group transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full -mr-16 -mt-16 transition-all group-hover:bg-yellow-500/20" />

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Leaderboard</h2>
                            <Crown className="w-5 h-5 text-yellow-500" />
                        </div>

                        <div className="space-y-3 flex-grow mb-4">
                            {[1, 2, 3].map((rank) => (
                                <div
                                    key={rank}
                                    className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:bg-black/60 hover:border-white/10 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${rank === 1 ? 'bg-yellow-500 text-black' :
                                                rank === 2 ? 'bg-slate-300 text-black' :
                                                    rank === 3 ? 'bg-orange-700 text-white' : 'bg-slate-700'
                                            }`}>
                                            {rank}
                                        </div>
                                        <span className="text-sm font-medium text-slate-200">Student {rank}</span>
                                    </div>
                                    <span className="text-sm font-bold text-primary-light">{1000 - (rank * 50)} XP</span>
                                </div>
                            ))}
                        </div>

                        <Link to="/leaderboard" className="mt-auto">
                            <Button
                                variant="outline"
                                className="w-full border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/50 text-white transition-all duration-300"
                            >
                                View Full Rankings
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    )
}
