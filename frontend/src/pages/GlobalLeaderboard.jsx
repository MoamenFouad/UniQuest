import { useState, useEffect } from "react"
import api from "../api"
import { Card } from "../components/ui/Card"
import { clsx } from "clsx"
import { Trophy } from "lucide-react"

export function GlobalLeaderboard() {
    const [leaderboard, setLeaderboard] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLeaderboard()
    }, [])

    const fetchLeaderboard = async () => {
        try {
            const { data } = await api.get("/rooms/global/leaderboard")
            setLeaderboard(data)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-white p-8">Loading rankings...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
                    <Trophy size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Global Leaderboard</h1>
                    <p className="text-slate-400">Top adventurers across all realms</p>
                </div>
            </div>

            <Card>
                <table className="w-full text-left text-white">
                    <thead className="text-slate-500 border-b border-slate-700">
                        <tr>
                            <th className="p-4">Rank</th>
                            <th className="p-4">Adventurer</th>
                            <th className="p-4 text-right">Total XP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((entry) => (
                            <tr key={entry.user_id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
                                <td className="p-4">
                                    <div className={clsx(
                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                                        entry.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                                            entry.rank === 2 ? "bg-slate-300/20 text-slate-300" :
                                                entry.rank === 3 ? "bg-amber-700/20 text-amber-700" : "text-slate-500"
                                    )}>
                                        #{entry.rank}
                                    </div>
                                </td>
                                <td className="p-4 font-medium flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                        {entry.username[0].toUpperCase()}
                                    </div>
                                    {entry.username}
                                </td>
                                <td className="p-4 text-right">
                                    <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                        {entry.total_xp.toLocaleString()} XP
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {leaderboard.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        No adventurers found. Be the first to complete a quest!
                    </div>
                )}
            </Card>
        </div>
    )
}
