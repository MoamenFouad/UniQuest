import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api"
import { useAuth } from "../context/AuthContext"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Trophy, Calendar, Upload, CheckCircle, Share2, Copy, LogOut, Archive } from "lucide-react"
import { clsx } from "clsx"

export function RoomDetails() {
    const { code } = useParams()
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const [room, setRoom] = useState(null)
    const [tasks, setTasks] = useState([])
    const [leaderboard, setLeaderboard] = useState([])
    const [activeTab, setActiveTab] = useState("tasks")
    const [isAdmin, setIsAdmin] = useState(false)
    const [mySubmissions, setMySubmissions] = useState([]) // Track completed quests
    const [copied, setCopied] = useState(false)

    // Admin form
    const [newTask, setNewTask] = useState({ title: "", type: "lecture", xp_value: 100, deadline: "" })

    // Upload state
    const [uploading, setUploading] = useState(null)

    useEffect(() => {
        fetchData()
    }, [code])

    useEffect(() => {
        if (room && user) {
            const isCreator = room.admin_id == user.id
            setIsAdmin(isCreator)
        }
    }, [room, user])

    const fetchData = async () => {
        try {
            // Fetch room details first to establish context
            const roomRes = await api.get(`/rooms/${code}`)
            setRoom(roomRes.data)
            console.log("Room data:", roomRes.data)

            // Fetch user's submissions to track completed quests
            try {
                const submissionsRes = await api.get('/submissions/my')
                console.log("My submissions:", submissionsRes.data)
                setMySubmissions(submissionsRes.data || [])
            } catch (e) {
                console.warn("Failed to load submissions", e)
                setMySubmissions([])
            }

            // Then fetch other data independently so one failure doesn't block the room load
            try {
                const tasksRes = await api.get(`/rooms/${code}/tasks`)
                console.log("Tasks fetched:", tasksRes.data)
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

    const getDeadlineStatus = (deadlineStr) => {
        if (!deadlineStr) return null
        const deadline = new Date(deadlineStr)
        const now = new Date()
        const diffHours = (deadline - now) / (1000 * 60 * 60)

        if (diffHours < 0) return { label: "Overdue", color: "text-red-500", bg: "bg-red-500/10" }
        if (diffHours < 24) return { label: "Due Soon", color: "text-amber-500", bg: "bg-amber-500/10" }
        return { label: new Date(deadlineStr).toLocaleDateString(), color: "text-slate-400", bg: "bg-slate-800" }
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
            fetchData() // Refresh logic
        } catch (err) {
            alert(err.response?.data?.detail || "Upload failed")
        } finally {
            setUploading(null)
        }
    }

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShareRoom = () => {
        const shareUrl = `${window.location.origin}/rooms/${code}`
        if (navigator.share) {
            navigator.share({
                title: `Join ${room?.name || 'Room'} on UniQuest`,
                text: `Join my study room with code: ${code}`,
                url: shareUrl
            })
        } else {
            navigator.clipboard.writeText(shareUrl)
            alert("Room link copied to clipboard!")
        }
    }

    const handleLeaveRoom = async () => {
        if (!confirm("Are you sure you want to leave this room?")) return

        try {
            await api.post(`/rooms/${code}/leave`)
            alert("Left room successfully")
            navigate("/rooms")
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to leave room")
        }
    }

    const handleArchiveRoom = async () => {
        try {
            if (room?.is_archived) {
                await api.post(`/rooms/${code}/unarchive`)
                alert("Room unarchived successfully")
            } else {
                await api.post(`/rooms/${code}/archive`)
                alert("Room archived successfully")
            }
            fetchData() // Refresh to update button state
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to update archive status")
        }
    }

    return (
        <div className="space-y-6">
            {/* Room Header with Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{room?.name || `Room ${code}`}</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">Room Code:</span>
                        <code className="bg-card px-3 py-1 rounded-lg text-primary-light font-mono text-sm border border-white/10">
                            {code}
                        </code>
                        <button
                            onClick={handleCopyCode}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
                            title="Copy room code"
                        >
                            {copied ? <CheckCircle size={18} className="text-green-400" /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <Button
                            onClick={handleShareRoom}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Share2 size={18} />
                            Share Room
                        </Button>
                    )}
                    <Button
                        onClick={handleArchiveRoom}
                        variant="outline"
                        className={clsx(
                            "flex items-center gap-2",
                            room?.is_archived
                                ? "border-green-500/30 hover:bg-green-500/10 text-green-400"
                                : "border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400"
                        )}
                    >
                        <Archive size={18} />
                        {room?.is_archived ? "Unarchive" : "Archive"}
                    </Button>
                    {!isAdmin && (
                        <Button
                            onClick={handleLeaveRoom}
                            variant="outline"
                            className="flex items-center gap-2 border-red-500/30 hover:bg-red-500/10 text-red-400"
                        >
                            <LogOut size={18} />
                            Leave Room
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-card p-1 rounded-xl w-fit">
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
                            // Check if user has already submitted this quest
                            const isCompleted = mySubmissions.some(sub => sub.task_id === task.id)

                            return (
                                <Card key={task.id} className={clsx(
                                    "flex flex-col md:flex-row md:items-center justify-between p-6 gap-6 transition-colors group",
                                    isCompleted ? "border-green-500/30 bg-green-500/5" : "hover:border-slate-600"
                                )}>
                                    <div className="flex items-start gap-4">
                                        <div className={clsx(
                                            "p-3 rounded-xl shrink-0 mt-1",
                                            isCompleted ? "bg-green-500/20 text-green-400" :
                                                task.type === 'lecture' ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                                        )}>
                                            {isCompleted ? <CheckCircle size={24} /> : <Calendar size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                {isCompleted && (
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-green-500/20 text-green-400">
                                                        ✓ COMPLETED
                                                    </span>
                                                )}
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
                                            <h3 className={clsx(
                                                "font-bold text-xl mb-1 transition-colors",
                                                isCompleted ? "text-green-400" : "text-white group-hover:text-primary"
                                            )}>{task.title}</h3>
                                            {task.deadline && (
                                                <p className="text-sm text-slate-400">
                                                    Due: {new Date(task.deadline).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden md:block">
                                            <p className={clsx(
                                                "font-bold",
                                                isCompleted ? "text-green-400" : "text-yellow-400"
                                            )}>{task.xp_value} XP</p>
                                            <p className="text-xs text-slate-500">{isCompleted ? "EARNED" : "REWARD"}</p>
                                        </div>

                                        <div className="relative">
                                            {isCompleted ? (
                                                <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2 border border-green-500/30">
                                                    <CheckCircle size={18} />
                                                    <span className="font-medium">Submitted</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <input
                                                        type="file"
                                                        id={`file-${task.id}`}
                                                        className="hidden"
                                                        onChange={(e) => handleUpload(task.id, e.target.files[0])}
                                                        disabled={uploading === task.id}
                                                    />
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
                                                </>
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
