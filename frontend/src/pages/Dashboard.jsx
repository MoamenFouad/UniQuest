import { useAuth } from "../context/AuthContext"
import { Card } from "../components/ui/Card"
import { Link } from "react-router-dom"
import { Trophy, Flame, Target, ArrowRight } from "lucide-react"

export function Dashboard() {
    const { user } = useAuth()

    // Mock data for MVP visuals
    const stats = [
        { label: "Total XP", value: "1,250", icon: Trophy, color: "text-yellow-400" },
        { label: "Day Streak", value: "3", icon: Flame, color: "text-orange-500" },
        { label: "Quests Done", value: "12", icon: Target, color: "text-primary" },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.username}</h1>
                <p className="text-slate-400">Your adventure continues.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-slate-800 ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="bg-gradient-to-r from-indigo-900 to-purple-900 border-none relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-2">Ready for your next quest?</h2>
                    <p className="text-indigo-200 mb-6 max-w-lg">
                        Check your rooms to find new lectures and assignments. Complete them to earn XP and multiplier bonuses!
                    </p>
                    <Link to="/rooms">
                        <button className="bg-white text-indigo-900 px-6 py-2 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2">
                            Go to Rooms <ArrowRight size={18} />
                        </button>
                    </Link>
                </div>
            </Card>
        </div>
    )
}
