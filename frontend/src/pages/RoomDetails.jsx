import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import api from "../api"
import { useAuth } from "../context/AuthContext"
import { useApp } from "../context/AppContext"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Trophy, Calendar, Upload, CheckCircle } from "lucide-react"
import { clsx } from "clsx"

export function RoomDetails() {
    const { code } = useParams()
    const { user, loading } = useAuth()
    const { refreshStats } = useApp()
    const [room, setRoom] = useState(null)
    const [tasks, setTasks] = useState([])
    const [leaderboard, setLeaderboard] = useState([])
    const [activeTab, setActiveTab] = useState("tasks")
    const [isAdmin, setIsAdmin] = useState(false)

    // Admin form
    const [newTask, setNewTask] = useState({ title: "", type: "lecture", xp_value: 100, deadline: "" })

    // Upload state
    const [uploading, setUploading] = useState(null)

    useEffect(() => {
        fetchData()
    }, [code])

    useEffect(() => {
        if (room && user) {
            // Strict role determination: user is admin based on room ownership.
            // Using loose equality (==) to handle potential string/number mismatches safely.
            const isCreator = room.admin_id == user.id
            setIsAdmin(isCreator)
        }
    }, [room, user])

    const fetchData = async () => {
        try {
            // Fetch room details first to establish context
            const roomRes = await api.get(`/rooms/${code}`)
            setRoom(roomRes.data)

            // Then fetch other data independently so one failure doesn't block the room load
            try {
                const tasksRes = await api.get(`/rooms/${code}/tasks`)
                setTasks(tasksRes.data || [])
            } catch (e) {
                console.warn("Failed to load tasks", e)
                setTasks([])
            }

            try {
                const lbRes = await api.get(`/rooms/${code}/leaderboard`)
                setLeaderboard(lbRes.data || [])
            } catch (e) {
                console.warn("Failed to load leaderboard", e)
                setLeaderboard([])
            }

        } catch (error) {
            console.error("Failed to fetch room details:", error);
        }
    }

    // Create state
    const [creating, setCreating] = useState(false)

    const handleCreateTask = async (e) => {
        e.preventDefault()
        if (!newTask.title || !newTask.deadline) return

        setCreating(true)
        try {
            // Safe date handling
            const deadlineDate = new Date(newTask.deadline)
            if (isNaN(deadlineDate.getTime())) {
                alert("Invalid deadline date")
                setCreating(false)
                return
            }

            const { data: createdTask } = await api.post(`/rooms/${code}/tasks/`, {
                ...newTask,
                deadline: deadlineDate.toISOString()
            })

            // Optimistic update: Add new task to list immediately
            setTasks(prev => [createdTask, ...prev])

            // Reset form
            setNewTask({ title: "", type: "lecture", xp_value: 100, deadline: "" })

        } catch (err) {
            console.error(err)
            alert(err.response?.data?.detail || "Failed to create task")
        } finally {
            setCreating(false)
        }
    }

    // Fix: Ensure deadline is treated as UTC
    const parseDeadline = (deadlineStr) => {
        if (!deadlineStr) return null
        // If it doesn't end in Z, assume it's UTC and append Z
        const iso = deadlineStr.endsWith("Z") ? deadlineStr : `${deadlineStr}Z`
        return new Date(iso)
    }

    const getDeadlineStatus = (deadlineStr) => {
        const deadline = parseDeadline(deadlineStr)
        if (!deadline) return null

        const now = new Date()
        const diffHours = (deadline - now) / (1000 * 60 * 60)

        if (diffHours < 0) return { label: "Overdue", color: "text-red-500", bg: "bg-red-500/10" }
        if (diffHours < 24) return { label: "Due Soon", color: "text-amber-500", bg: "bg-amber-500/10" }
        return { label: deadline.toLocaleDateString(), color: "text-slate-400", bg: "bg-slate-800" }
    }

    const handleUpload = async (taskId, file) => {
        if (!file) return
        const formData = new FormData()
        formData.append("file", file)

        setUploading(taskId)
        try {
            await api.post(`/submissions/${taskId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            alert("Quest Completed! XP Awarded.")

            // Fix: Update local state instead of full refetch
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, completed: true } : t
            ))

            // Refresh global stats for dashboard update
            refreshStats()
        } catch (err) {
            alert(err.response?.data?.detail || "Upload failed")
        } finally {
            setUploading(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Room {code}</h1>
                <div className="flex bg-card p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab("tasks")}
                        className={clsx(
                            "px-4 py-2 rounded-lg font-medium transition-colors",
                            activeTab === "tasks" ? "bg-primary text-white" : "text-slate-400 hover:text-white"
                        )}
                    >
                        Quests
                    </button>
                    <button
                        onClick={() => setActiveTab("leaderboard")}
                        className={clsx(
                            "px-4 py-2 rounded-lg font-medium transition-colors",
                            activeTab === "leaderboard" ? "bg-primary text-white" : "text-slate-400 hover:text-white"
                        )}
                    >
                        Leaderboard
                    </button>
                </div>
            </div>

            {activeTab === "tasks" ? (
                <div className="space-y-6">
                    {isAdmin && (
                        <Card className="border border-primary/20 bg-primary/5">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary rounded-lg text-white">
                                    <CheckCircle size={20} />
                                </div>
                                <h3 className="font-bold text-white text-lg">Create New Quest</h3>
                            </div>

                            <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-6 space-y-1">
                                    <label className="text-xs font-medium text-slate-400 ml-1">Quest Title</label>
                                    <Input
                                        placeholder="e.g. Week 1: Introduction"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-3 space-y-1">
                                    <label className="text-xs font-medium text-slate-400 ml-1">Type</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                        value={newTask.type}
                                        onChange={(e) => setNewTask({ ...newTask, type: e.target.value, xp_value: e.target.value === 'lecture' ? 100 : 75 })}
                                    >
                                        <option value="lecture">Lecture (100 XP)</option>
                                        <option value="assignment">Assignment (75 XP)</option>
                                    </select>
                                </div>

                                <div className="md:col-span-3 space-y-1">
                                    <label className="text-xs font-medium text-slate-400 ml-1">Deadline</label>
                                    <Input
                                        type="datetime-local"
                                        value={newTask.deadline}
                                        onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                        required
                                        className="text-white [color-scheme:dark]"
                                    />
                                </div>

                                <div className="md:col-span-12 flex justify-end mt-2">
                                    <Button type="submit" className="w-full md:w-auto px-8" disabled={creating}>
                                        {creating ? "Creating..." : "Create Quest"}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    <div className="grid gap-4">
                        {tasks.map((task) => {
                            const status = getDeadlineStatus(task.deadline)
                            const deadlineDate = parseDeadline(task.deadline)
                            const isExpired = deadlineDate && deadlineDate < new Date()

                            return (
                                <Card key={task.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6 hover:border-slate-600 transition-colors group">
                                    <div className="flex items-start gap-4">
                                        <div className={clsx(
                                            "p-3 rounded-xl shrink-0 mt-1",
                                            task.type === 'lecture' ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                                        )}>
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={clsx(
                                                    "text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                                    task.type === 'lecture' ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                                                )}>
                                                    {task.type}
                                                </span>
                                                {status && (
                                                    <span className={clsx(
                                                        "text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1",
                                                        status.bg, status.color
                                                    )}>
                                                        {status.label === 'Overdue' || status.label === 'Due Soon' ? '⚠️ ' : '🕒 '}
                                                        {status.label}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-white text-xl mb-1 group-hover:text-primary transition-colors">{task.title}</h3>
                                            {task.deadline && (
                                                <p className="text-sm text-slate-400">
                                                    Due: {parseDeadline(task.deadline).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden md:block">
                                            <p className="font-bold text-yellow-400">{task.xp_value} XP</p>
                                            <p className="text-xs text-slate-500">REWARD</p>
                                        </div>

                                        <div className="relative">
                                            {!isExpired && !task.completed && (
                                                <input
                                                    type="file"
                                                    id={`file-${task.id}`}
                                                    className="hidden"
                                                    onChange={(e) => handleUpload(task.id, e.target.files[0])}
                                                    disabled={uploading === task.id}
                                                />
                                            )}

                                            {task.completed ? (
                                                <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2">
                                                    <CheckCircle size={18} />
                                                    <span>Completed</span>
                                                </div>
                                            ) : isExpired ? (
                                                <div className="bg-slate-800 text-slate-500 px-4 py-2 rounded-lg flex items-center gap-2 cursor-not-allowed">
                                                    <Calendar size={18} />
                                                    <span>Expired</span>
                                                </div>
                                            ) : (
                                                <label
                                                    htmlFor={`file-${task.id}`}
                                                    className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                                >
                                                    {uploading === task.id ? (
                                                        <span>Uploading...</span>
                                                    ) : (
                                                        <>
                                                            <Upload size={18} />
                                                            <span>Submit Proof</span>
                                                        </>
                                                    )}
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                        {tasks.length === 0 && (
                            <div className="text-center py-10 text-slate-500">
                                <p className="text-lg mb-2">Room is empty.</p>
                                {isAdmin ? (
                                    <p>Create your first lecture or assignment above.</p>
                                ) : (
                                    <p>No active quests to complete.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
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
                                <tr key={entry.user_id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50">
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
                                    <td className="p-4 font-medium">{entry.username}</td>
                                    <td className="p-4 text-right font-bold text-primary">{entry.total_xp} XP</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </div>
    )
}
