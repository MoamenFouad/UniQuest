import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useApp } from "../context/AppContext"
import { Card } from "../components/ui/Card"
import { Trophy, Flame, Target, ArrowRight, TrendingUp, Clock } from "lucide-react"
import { clsx } from "clsx"

export function Dashboard() {
    const { user } = useAuth()
    const { stats, leaderboard, loading } = useApp()

    // Calculate level progress
    const currentLevelXp = (stats.level - 1) * 100
    const nextLevelXp = stats.level * 100
    const progressInLevel = stats.xp - currentLevelXp
    const progressPercent = (progressInLevel / 100) * 100

    const heroStats = [
        {
            label: "Total XP",
            value: stats.xp.toLocaleString(),
            icon: Trophy,
            color: "text-yellow-400",
            bg: "bg-yellow-400/10",
            ring: "ring-yellow-400/20"
        },
        {
            label: "Active Days",
            value: stats.streak,
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            ring: "ring-orange-500/20"
        },
        {
            label: "Quests Done",
            value: stats.questsDone,
            icon: Target,
            color: "text-indigo-400",
            bg: "bg-indigo-400/10",
            ring: "ring-indigo-400/20"
        },
    ]

    const topLeaderboard = leaderboard.slice(0, 5)

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div>
                <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.username}</h1>
                <p className="text-slate-400 text-lg">Your adventure continues. Keep climbing!</p>
            </div>

            {/* Hero Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {heroStats.map((stat) => (
                    <Card
                        key={stat.label}
                        className={clsx(
                            "group relative overflow-hidden border-slate-800/50 hover:border-slate-700 transition-all duration-300 hover:scale-[1.02]",
                            loading && "animate-pulse"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative p-6 flex items-center gap-6">
                            <div className={clsx(
                                "p-5 rounded-2xl ring-2",
                                stat.bg,
                                stat.color,
                                stat.ring
                            )}>
                                <stat.icon size={32} strokeWidth={2} />
                            </div>
                            <div className="flex-1">
                                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">
                                    {stat.label}
                                </p>
                                {loading ? (
                                    <div className="h-10 w-24 bg-slate-800 rounded-lg" />
                                ) : (
                                    <p className="text-4xl font-bold text-white tracking-tight">
                                        {stat.value}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Level Progress Section */}
            <Card className="border-slate-800/50">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp size={20} className="text-indigo-400" />
                                Level {stats.level}
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                                {100 - progressInLevel} XP to Level {stats.level + 1}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">{progressInLevel} / 100</p>
                            <p className="text-xs text-slate-500">XP in current level</p>
                        </div>
                    </div>
                    <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mini Leaderboard */}
                <Card className="border-slate-800/50">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Trophy size={20} className="text-yellow-400" />
                                Top Adventurers
                            </h3>
                            <Link to="/leaderboard">
                                <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                                    View All <ArrowRight size={14} />
                                </button>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-12 bg-slate-800 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : topLeaderboard.length > 0 ? (
                            <div className="space-y-2">
                                {topLeaderboard.map((entry) => (
                                    <div
                                        key={entry.user_id}
                                        className={clsx(
                                            "flex items-center gap-4 p-3 rounded-lg transition-colors",
                                            entry.user_id === user?.id ? "bg-indigo-500/10 border border-indigo-500/20" : "hover:bg-slate-800/50"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                            entry.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                                                entry.rank === 2 ? "bg-slate-300/20 text-slate-300" :
                                                    entry.rank === 3 ? "bg-amber-700/20 text-amber-700" : "bg-slate-700 text-slate-400"
                                        )}>
                                            #{entry.rank}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">
                                                {entry.username}
                                                {entry.user_id === user?.id && (
                                                    <span className="text-xs text-indigo-400 ml-2">(You)</span>
                                                )}
                                            </p>
                                        </div>
                                        <p className="text-sm font-bold text-indigo-400">{entry.total_xp} XP</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-8">No leaderboard data yet</p>
                        )}
                    </div>
                </Card>

                {/* Activity Section */}
                <Card className="border-slate-800/50">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                            <Clock size={20} className="text-green-400" />
                            Recent Activity
                        </h3>

                        {stats.lastSubmission ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                    <p className="text-sm text-slate-400 mb-1">Last Quest Completed</p>
                                    <p className="text-white font-medium mb-2">{stats.lastSubmission.title}</p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(stats.lastSubmission.date).toLocaleString()}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-800">
                                    <Link to="/rooms">
                                        <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                                            Find More Quests <ArrowRight size={18} />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-500 mb-6">No quests completed yet</p>
                                <Link to="/rooms">
                                    <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mx-auto shadow-lg shadow-indigo-500/20">
                                        Start Your First Quest  <ArrowRight size={18} />
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* CTA Card */}
            <Card className="bg-gradient-to-r from-indigo-900 to-violet-900 border-none relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity transform translate-y-12 translate-x-12">
                    <Target size={300} />
                </div>
                <div className="relative z-10 p-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Ready to level up?</h2>
                    <p className="text-indigo-200 mb-6 max-w-lg leading-relaxed">
                        Complete quests, earn XP, and climb the leaderboard. Every submission counts!
                    </p>
                    <Link to="/rooms">
                        <button className="bg-white text-indigo-950 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 hover:scale-105 transition-all flex items-center gap-2 shadow-xl">
                            Browse Rooms <ArrowRight size={18} />
                        </button>
                    </Link>
                </div>
            </Card>
        </div>
    )
}
