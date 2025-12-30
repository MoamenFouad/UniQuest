import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api"
import { format } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

const EGYPT_TIMEZONE = 'Africa/Cairo'
import { useAuth } from "../context/AuthContext"
import { useApp } from "../context/AppContext"
import { Trophy, Calendar, Upload, CheckCircle, Zap, Shield, Plus, Target, ArrowRight, ChevronRight, Map, Mail, LogOut, X, Settings, Users, Info, ShieldCheck, ShieldAlert, Trash2, Globe, Lock, Clock, AlertTriangle, Sword, Crown, CheckCircle2, FileStack } from "lucide-react"
import { clsx } from "clsx"

export function RoomDetails() {
    const { code } = useParams()
    const { user } = useAuth()
    const { refreshStats } = useApp()
    const navigate = useNavigate()
    const [room, setRoom] = useState(null)
    const [tasks, setTasks] = useState([])
    const [leaderboard, setLeaderboard] = useState([])
    const [members, setMembers] = useState([])
    const [isAdmin, setIsAdmin] = useState(false)
    const [newTask, setNewTask] = useState({ title: "", type: "lecture", deadline: "", xp_value: 0 })
    const [editRoom, setEditRoom] = useState({ name: "", description: "", is_public: true })
    const [feedback, setFeedback] = useState({ message: "", type: "" })
    const [taskToDelete, setTaskToDelete] = useState(null)
    const [showLeaveModal, setShowLeaveModal] = useState(false)
    const [showDeleteRoomModal, setShowDeleteRoomModal] = useState(false)
    const [uploading, setUploading] = useState(null)
    const [creating, setCreating] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [taskSubmissions, setTaskSubmissions] = useState([])
    const [loadingSubmissions, setLoadingSubmissions] = useState(false)

    useEffect(() => {
        fetchData()
    }, [code])

    useEffect(() => {
        if (members.length > 0 && user) {
            const member = members.find(m => m.user_id === user.id)
            const adminStatus = member?.is_admin || false
            console.log('Admin status:', adminStatus, 'User:', user.id, 'Member:', member)
            setIsAdmin(adminStatus)
        }
    }, [members, user])

    useEffect(() => {
        if (showSubmissionsModal && selectedTask) {
            fetchSubmissions()
        }
    }, [showSubmissionsModal, selectedTask])

    const fetchSubmissions = async () => {
        setLoadingSubmissions(true)
        try {
            const { data } = await api.get(`/rooms/${code}/tasks/${selectedTask.id}/submissions`)
            setTaskSubmissions(data)
        } catch (err) { console.error(err) } finally { setLoadingSubmissions(false) }
    }

    const fetchData = async () => {
        try {
            const [roomRes, tasksRes, lbRes, membersRes] = await Promise.all([
                api.get(`/rooms/${code}`),
                api.get(`/rooms/${code}/tasks`).catch(() => ({ data: [] })),
                api.get(`/rooms/${code}/leaderboard`).catch(() => ({ data: [] })),
                api.get(`/rooms/${code}/members`).catch(() => ({ data: [] }))
            ])
            setRoom(roomRes.data)
            setEditRoom({
                name: roomRes.data.name,
                description: roomRes.data.description || "",
                is_public: roomRes.data.is_public
            })
            setTasks(tasksRes.data)
            setLeaderboard(lbRes.data)
            setMembers(membersRes.data)
        } catch (error) { console.error(error) }
    }

    const handleUpdateRoom = async (e) => {
        e.preventDefault()
        setUpdating(true)
        try {
            const { data } = await api.patch(`/rooms/${code}`, editRoom)
            setRoom(data)
            setShowSettingsModal(false)
        } catch (err) { alert(err.response?.data?.detail || "Failed to update room") } finally { setUpdating(false) }
    }

    const handleUpdateMemberRole = async (targetUserId, currentIsAdmin) => {
        try {
            const { data } = await api.patch(`/rooms/${code}/members/${targetUserId}/role`, { is_admin: !currentIsAdmin })
            setMembers(prev => prev.map(m => m.user_id === targetUserId ? data : m))
        } catch (err) { alert(err.response?.data?.detail || "Failed to update role") }
    }

    const handleDeleteRoom = () => setShowDeleteRoomModal(true)
    const confirmDeleteRoom = async () => {
        try {
            await api.delete(`/rooms/${code}`)
            navigate("/rooms")
        } catch (err) { alert(err.response?.data?.detail || "Failed to delete room") }
    }

    const handleCreateTask = async (e) => {
        e.preventDefault()
        if (!newTask.title || !newTask.deadline) return

        setCreating(true)
        try {
            const payload = { ...newTask }
            if (payload.deadline) {
                // CRITICAL: Treat the selected date/time AS IF it's already in Egypt timezone (Force UTC+2)
                // Manual Input Calculation: UTC = Wall Time - 2 Hours
                // This ensures Input(X) -> Store(X-2) -> Display(X-2+2) -> Result(X)
                const dateObj = new Date(payload.deadline)

                const utcDate = new Date(Date.UTC(
                    dateObj.getFullYear(),
                    dateObj.getMonth(),
                    dateObj.getDate(),
                    dateObj.getHours() - 2, // Explicitly subtract 2 hours (Egypt Offset)
                    dateObj.getMinutes(),
                    0
                ))

                payload.deadline = utcDate.toISOString()
                payload.deadlineTimezone = EGYPT_TIMEZONE
            }
            const { data: createdTask } = await api.post(`/rooms/${code}/tasks/`, payload)
            setTasks(prev => [createdTask, ...prev])
            setNewTask({ title: "", type: "lecture", deadline: "", xp_value: 0 })
            setShowTaskModal(false)
        } catch (err) { alert(err.response?.data?.detail || "Failed to create task") } finally { setCreating(false) }
    }

    const handleLeaveRoom = () => setShowLeaveModal(true)
    const confirmLeaveRoom = async () => {
        try {
            await api.post(`/rooms/${code}/leave`)
            navigate("/rooms")
            refreshStats()
        } catch (err) { alert(err.response?.data?.detail || "Failed to leave room") }
    }

    const handleDeleteTask = (taskId) => {
        console.log('Setting task to delete:', taskId)
        setTaskToDelete(taskId)
    }

    const confirmDeleteTask = async () => {
        if (!taskToDelete) return
        console.log('Confirming delete for task:', taskToDelete)

        try {
            await api.delete(`/rooms/${code}/tasks/${taskToDelete}`)
            setTasks(prev => prev.filter(t => t.id !== taskToDelete))

            // Show Success Feedback
            setFeedback({ message: "Task Deleted Successfully", type: "success" })
            setTimeout(() => setFeedback({ message: "", type: "" }), 3000)
        } catch (err) {
            // Show Error Feedback
            setFeedback({ message: err.response?.data?.detail || "Failed to delete task", type: "error" })
            setTimeout(() => setFeedback({ message: "", type: "" }), 3000)
        } finally {
            setTaskToDelete(null)
        }
    }

    const handleVerifySubmission = async (submissionId, status) => {
        try {
            await api.post(`/rooms/${code}/tasks/${selectedTask.id}/submissions/${submissionId}/verify?status=${status}`)
            await Promise.all([
                fetchSubmissions(),
                fetchData(),
                refreshStats()
            ])
        } catch (err) { alert(err.response?.data?.detail || "Failed to verify submission") }
    }

    const handleFileUpload = async (taskId, file) => {
        if (!file) return
        setUploading(taskId)
        const formData = new FormData()
        formData.append("file", file)
        try {
            await api.post(`/rooms/${code}/tasks/${taskId}/submit/`, formData)
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_submitted: true, submission_status: 'pending' } : t))
            await refreshStats()
        } catch (err) { alert(err.response?.data?.detail || "Upload failed") } finally { setUploading(null) }
    }

    if (!room) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10 bg-black">
            <div className="w-16 h-16 md:w-20 md:h-20 relative">
                <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={24} />
            </div>
            <p className="text-primary font-black uppercase tracking-[0.6em] italic text-[10px]">Loading Room Data...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-black relative overflow-hidden flex flex-col">
            {/* Studio Grid Background */}
            <div className="fixed inset-0 grid-overlay opacity-[0.05] pointer-events-none" />

            {/* Manage Room Button - Top Right (Admins Only) */}
            {isAdmin && (
                <div className="absolute top-8 right-8 md:top-12 md:right-12 z-50">
                    <button
                        onClick={() => setShowSettingsModal(true)}
                        className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white hover:text-black transition-all shadow-lg group"
                    >
                        <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Room Settings</span>
                    </button>
                </div>
            )}

            <div className="flex-1 w-full max-w-[1920px] mx-auto p-8 md:p-12 lg:p-16 space-y-12 relative z-10">

                {/* Header Section (Compact) */}
                <header className="space-y-4 text-left pt-6 md:pt-8 w-full">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-[calc(-0.04em)] leading-none">
                            {room.name}
                        </h1>
                        <p className="text-white/60 text-lg md:text-xl font-medium italic max-w-2xl leading-relaxed">
                            {room.description || "Collaborate on tasks with your room"}
                        </p>
                    </div>
                </header>

                {/* Main Content Grid: 75/25 Split */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 items-start h-full pb-32">

                    {/* Left Box: Tasks & Objectives (Primary Focus - 75%) */}
                    <div className="lg:col-span-3 flex flex-col gap-8 h-full">
                        <div className="flex items-center justify-between border-b border-white/10 pb-6">
                            <div className="flex items-center gap-4">
                                <Target size={24} className="text-primary" />
                                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">Tasks & Objectives</h2>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 ml-4 py-1 px-3 border border-white/10 rounded-full">{tasks.length} Active</span>
                            </div>

                            {/* Create Task Button (Inside Tasks Box - Admin Only) */}
                            {isAdmin && (
                                <button
                                    onClick={() => setShowTaskModal(true)}
                                    className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] group"
                                >
                                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">New Task</span>
                                </button>
                            )}
                        </div>

                        {/* Feedback Message */}
                        {feedback.message && (
                            <div className={clsx(
                                "p-4 rounded-xl border font-black italic uppercase tracking-widest text-xs flex items-center gap-3 animate-in slide-in-from-top-2 fade-in",
                                feedback.type === 'success'
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                                    : "bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                            )}>
                                {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                {feedback.message}
                            </div>
                        )}



                        <div className="space-y-4">
                            {tasks.length > 0 ? tasks.map((task, idx) => (
                                <div key={task.id} className="group border border-white/5 bg-white/[0.02] p-8 md:p-10 rounded-3xl transition-all duration-500 hover:bg-white hover:text-black hover:scale-[1.005] hover:shadow-2xl relative overflow-hidden">
                                    <div className="absolute inset-y-0 left-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />

                                    <div className="flex flex-col gap-6 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-secondary group-hover:text-black">{task.type}</span>
                                                    <span>•</span>
                                                    <span className="text-white/40 group-hover:text-black/60">TASK_{idx + 1}</span>
                                                </div>
                                                <h4 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">{task.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 bg-white/5 group-hover:bg-black/5 px-4 py-2 rounded-full border border-white/5 transition-colors">
                                                        <Clock size={12} />
                                                        {(() => {
                                                            if (!task.deadline) return 'No Deadline';
                                                            // Manual UTC+2 Force Calculation
                                                            const d = new Date(task.deadline);
                                                            // Add 2 hours to get Egypt "Wall Clock" in UTC components
                                                            const egyptVal = new Date(d.getTime() + (2 * 60 * 60 * 1000));

                                                            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                                                            const month = months[egyptVal.getUTCMonth()];
                                                            const day = String(egyptVal.getUTCDate()).padStart(2, '0');
                                                            const year = egyptVal.getUTCFullYear();
                                                            let hours = egyptVal.getUTCHours();
                                                            const ampm = hours >= 12 ? 'PM' : 'AM';
                                                            hours = hours % 12 || 12;
                                                            const minutes = String(egyptVal.getUTCMinutes()).padStart(2, '0');

                                                            return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
                                                        })()} (EGY)
                                                    </div>
                                                    <div className="text-[8px] font-black uppercase tracking-widest text-primary italic pr-2">
                                                        +{task.xp_value} XP REWARD
                                                    </div>
                                                </div>
                                                {isAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            console.log('Delete button clicked for task:', task.id);
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleDeleteTask(task.id);
                                                        }}
                                                        className="relative z-[100] p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                                                        title="Delete Task"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Inline Delete Confirmation */}
                                            {taskToDelete === task.id && (
                                                <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5 animate-in slide-in-from-top-2 fade-in">
                                                    <div className="flex flex-col gap-3">
                                                        <p className="text-xs font-black italic uppercase tracking-wide text-red-500">
                                                            Do You Wish to Delete "{task.title}"?
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={confirmDeleteTask}
                                                                className="flex-1 px-4 py-2 bg-red-500 text-white text-xs font-black uppercase rounded-lg hover:bg-red-600 transition-all"
                                                            >
                                                                Delete
                                                            </button>
                                                            <button
                                                                onClick={() => setTaskToDelete(null)}
                                                                className="flex-1 px-4 py-2 bg-white/10 text-white text-xs font-black uppercase rounded-lg hover:bg-white/20 transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-4 border-t border-dashed border-white/10 group-hover:border-black/10 gap-4">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowSubmissionsModal(true);
                                                    }}
                                                    className="px-6 py-3 bg-white/5 hover:bg-white text-white hover:text-black rounded-xl font-black italic text-[9px] uppercase tracking-[0.2em] transition-all border border-white/10"
                                                >
                                                    View Submissions
                                                </button>
                                            )}
                                            {task.submission_status === "verified" ? (
                                                <div className="flex items-center gap-3 font-black italic uppercase text-[10px] tracking-widest text-primary group-hover:text-black">
                                                    <CheckCircle size={16} /> Verified
                                                </div>
                                            ) : task.submission_status === "pending" ? (
                                                <div className="flex items-center gap-3 font-black italic uppercase text-[10px] tracking-widest text-emerald-500 group-hover:text-emerald-600 bg-emerald-500/10 px-6 py-3 rounded-xl border border-emerald-500/20">
                                                    <CheckCircle size={16} /> Submitted
                                                </div>
                                            ) : task.is_expired ? (
                                                <div className="flex items-center gap-3 font-black italic uppercase text-[10px] tracking-widest text-white/60 group-hover:text-black/40">
                                                    <Zap size={16} /> Expired
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer">
                                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(task.id, e.target.files[0])} disabled={uploading === task.id} />
                                                    <div className={clsx(
                                                        "px-8 py-4 border border-primary/30 group-hover:border-black rounded-xl font-black italic text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-black hover:text-white transition-all shadow-lg",
                                                        uploading === task.id && "animate-pulse opacity-50"
                                                    )}>
                                                        {uploading === task.id ? "Syncing..." : "Submit Work"} <Upload size={14} />
                                                    </div>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-24 text-center border-2 border-dashed border-white/5 bg-white/[0.01] rounded-[2rem]">
                                    <Zap className="mx-auto mb-6 text-white/60" size={48} />
                                    <p className="text-white/60 font-black italic uppercase tracking-[0.4em] text-lg">No Active Tasks</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Box: Leaderboard (Sidebar - 25%) */}
                    <div className="lg:col-span-1 flex flex-col gap-8 h-full bg-white/[0.01] border-l border-white/5 pl-0 lg:pl-12">
                        <div className="flex items-center justify-between border-b border-white/10 pb-6">
                            <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
                                <Trophy size={20} className="text-secondary" />
                                ROOM LEADERBOARD
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {leaderboard.map((entry, idx) => (
                                <div key={entry.user_id} className="flex items-center justify-between p-4 border border-white/5 bg-white/[0.02] rounded-xl group hover:bg-primary hover:text-white transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-black italic text-white/60 group-hover:text-white transition-all w-6 text-center">0{idx + 1}</span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black italic uppercase tracking-tight truncate max-w-[100px] md:max-w-[140px]">{entry.username}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-lg font-black italic leading-none">{entry.total_xp}</p>
                                        <p className="text-[7px] font-black uppercase tracking-widest text-white/60 group-hover:text-white/60 mt-px">XP</p>
                                    </div>
                                </div>
                            ))}
                            {leaderboard.length === 0 && (
                                <div className="p-12 text-center border-2 border-dashed border-white/5 bg-white/[0.01] rounded-[1.5rem]">
                                    <Map className="mx-auto mb-4 text-white/60" size={32} />
                                    <p className="text-white/60 font-black italic uppercase tracking-[0.4em] text-xs">Sector Empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Exit Room Section - Button OR Inline Confirmation */}
                {!showLeaveModal ? (
                    /* 1. Show Button if NOT confirming */
                    <div className="relative z-10">
                        <style>{`
                        .exit-room-button {
                            position: relative;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                            width: 200px;
                            height: 48px;
                            margin: 50px auto 30px auto;
                            background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
                            color: #FFFFFF;
                            border: 2px solid rgba(255, 255, 255, 0.1);
                            border-radius: 10px;
                            font-family: inherit;
                            font-size: 15px;
                            font-weight: 600;
                            letter-spacing: 0.5px;
                            text-transform: uppercase;
                            cursor: pointer;
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
                            user-select: none;
                        }
                        .exit-room-button:hover {
                            background: linear-gradient(135deg, #B91C1C 0%, #991B1B 100%);
                            transform: translateY(-3px);
                            box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3);
                            border-color: rgba(255, 255, 255, 0.2);
                        }
                        .exit-room-button:active {
                            transform: translateY(-1px);
                            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2);
                        }
                    `}</style>
                        <button className="exit-room-button" onClick={handleLeaveRoom}>
                            <LogOut size={18} />
                            EXIT ROOM
                        </button>
                    </div>
                ) : (
                    /* 2. Show Inline Confirmation Card if confirming */
                    <div className="w-full max-w-xl mx-auto mt-12 mb-8 bg-[#050505] border border-red-500/20 rounded-[2rem] p-8 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)] animate-in slide-in-from-bottom-4 fade-in duration-300">
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
                                <LogOut size={32} />
                            </div>

                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Exit Room?</h3>
                                <p className="text-white/60 text-xs font-medium leading-relaxed">
                                    Are you sure you want to leave?<br />
                                    Your XP will remain, but you lose access to tasks.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={confirmLeaveRoom}
                                    className="flex-1 py-4 bg-red-500 text-white font-black uppercase text-[10px] tracking-[0.3em] italic rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setShowLeaveModal(false)}
                                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-[0.3em] italic rounded-xl hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Room Settings Modal */}
                {showSettingsModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowSettingsModal(false)} />
                        <div className="relative w-full max-w-6xl bg-[#050505] border border-white/10 rounded-[3rem] p-12 md:p-16 overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none"><Settings size={300} /></div>

                            <div className="flex justify-between items-start mb-12 relative z-10">
                                <div>
                                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Room Settings</h3>
                                    <p className="text-white/60 text-sm font-medium mt-2">Modify room details and settings.</p>
                                </div>
                                <button onClick={() => setShowSettingsModal(false)} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><X size={24} /></button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10 overflow-y-auto pr-4 custom-scrollbar">
                                {/* Left Side: General Settings */}
                                <div className="space-y-12">
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-4 text-primary">
                                            <Info size={20} />
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] italic">Room Details</h4>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Room Name</label>
                                                <input
                                                    value={editRoom.name}
                                                    onChange={(e) => setEditRoom({ ...editRoom, name: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-bold italic uppercase placeholder:text-white/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Room Description</label>
                                                <textarea
                                                    rows={4}
                                                    value={editRoom.description}
                                                    onChange={(e) => setEditRoom({ ...editRoom, description: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-medium text-sm placeholder:text-white/20 focus:border-primary transition-all resize-none"
                                                    placeholder="Describe the purpose of this study room..."
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-8">
                                        <div className="flex items-center gap-4 text-secondary">
                                            <Globe size={20} />
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] italic">Privacy Protocol</h4>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    {editRoom.is_public ? <Globe size={14} className="text-secondary" /> : <Lock size={14} className="text-red-500" />}
                                                    <span className="text-sm font-black italic uppercase text-white">{editRoom.is_public ? "Public Access" : "Restricted Sector"}</span>
                                                </div>
                                                <p className="text-[10px] text-white/40 font-medium">Toggle visibility on the global lobby discovery list.</p>
                                            </div>
                                            <button
                                                onClick={() => setEditRoom({ ...editRoom, is_public: !editRoom.is_public })}
                                                className={clsx(
                                                    "relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none",
                                                    editRoom.is_public ? "bg-secondary" : "bg-white/10"
                                                )}
                                            >
                                                <span className={clsx(
                                                    "inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300",
                                                    editRoom.is_public ? "translate-x-7" : "translate-x-1"
                                                )} />
                                            </button>
                                        </div>
                                    </section>

                                    <button
                                        onClick={handleUpdateRoom}
                                        disabled={updating}
                                        className="w-full py-6 bg-white text-black font-black uppercase text-[10px] tracking-[0.5em] italic rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                                    >
                                        {updating ? "Syncing..." : "Update Room Details"}
                                    </button>
                                </div>

                                {/* Right Side: Member Management */}
                                <div className="space-y-12">
                                    <section className="space-y-8 h-full flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-primary">
                                                <Users size={20} />
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] italic">Room Members</h4>
                                            </div>
                                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{members.length} Members</span>
                                        </div>

                                        <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                            {members.map(m => (
                                                <div key={m.user_id} className="flex items-center justify-between p-5 border border-white/5 bg-white/[0.03] rounded-2xl group hover:border-white/20 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className={clsx(
                                                            "w-10 h-10 rounded-full flex items-center justify-center font-black italic",
                                                            m.is_admin ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-white/40 border border-white/10"
                                                        )}>
                                                            {m.username[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black italic uppercase text-white truncate max-w-[120px]">{m.username}</p>
                                                            <p className="text-[9px] font-medium text-white/40">{m.is_admin ? "Admin" : "Member"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {m.user_id !== user.id && (
                                                            <button
                                                                onClick={() => handleUpdateMemberRole(m.user_id, m.is_admin)}
                                                                className={clsx(
                                                                    "p-3 rounded-xl transition-all",
                                                                    m.is_admin ? "text-primary bg-primary/10 hover:bg-primary hover:text-white" : "text-white/20 bg-white/5 hover:bg-white/10 hover:text-white"
                                                                )}
                                                                title={m.is_admin ? "Demote to Member" : "Promote to Admin"}
                                                            >
                                                                {m.is_admin ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-12 mt-auto border-t border-white/5">
                                            <button
                                                onClick={handleDeleteRoom}
                                                className="w-full flex items-center justify-center gap-4 py-6 border border-red-500/20 bg-red-500/5 text-red-500 font-black uppercase text-[10px] tracking-[0.5em] italic rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                            >
                                                <Trash2 size={16} /> Delete Room
                                            </button>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Task Modal */}
                {showTaskModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowTaskModal(false)} />
                        <div className="relative w-full max-w-2xl bg-[#050505] border border-primary/20 rounded-[3rem] p-12 md:p-16 overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)] animate-in zoom-in-95 duration-300">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none"><Plus size={200} /></div>

                            <div className="flex justify-between items-start mb-12 relative z-10">
                                <div>
                                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Create Task</h3>
                                    <p className="text-white/60 text-sm font-medium mt-2">Create a new task for all room members.</p>
                                </div>
                                <button onClick={() => setShowTaskModal(false)} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleCreateTask} className="space-y-8 relative z-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-2 italic">Task Title</label>
                                    <input
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-white font-black italic uppercase text-lg placeholder:text-white/20 focus:border-primary transition-all"
                                        placeholder="Enter task name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-2 italic">Task Type</label>
                                        <select
                                            value={newTask.type}
                                            onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                                            className="w-full bg-white/10 border border-white/20 p-6 rounded-2xl text-white font-black italic uppercase text-sm focus:border-primary transition-all appearance-none cursor-pointer outline-none"
                                            style={{ colorScheme: 'dark' }}
                                        >
                                            <option value="lecture" className="bg-[#050505] text-white">Lecture</option>
                                            <option value="assignment" className="bg-[#050505] text-white">Assignment</option>
                                            <option value="project" className="bg-[#050505] text-white">Project</option>
                                            <option value="quiz" className="bg-[#050505] text-white">Quiz</option>
                                            <option value="lab" className="bg-[#050505] text-white">Lab</option>
                                            <option value="other" className="bg-[#050505] text-white">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-2 italic">Due Date (Cairo Time)</label>
                                        <input
                                            type="datetime-local"
                                            value={newTask.deadline}
                                            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                            className="w-full bg-white/10 border border-white/20 p-6 rounded-2xl text-white font-black italic uppercase text-sm focus:border-primary transition-all color-scheme-dark cursor-pointer outline-none"
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                        />
                                    </div>
                                </div>

                                <button type="submit" disabled={creating} className="w-full py-8 bg-primary text-white font-black uppercase text-xs tracking-[0.5em] italic rounded-2xl shadow-[0_0_b0px_hsla(var(--primary),0.4)] hover:scale-[1.02] active:scale-95 transition-all mt-4">
                                    {creating ? "Syncing..." : "Create Task"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {/* Manage Submissions Modal */}
                {showSubmissionsModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setShowSubmissionsModal(false)} />
                        <div className="relative w-full max-w-4xl bg-[#050505] border border-white/10 rounded-[3rem] p-12 md:p-16 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none"><FileText size={300} /></div>

                            <div className="flex justify-between items-start mb-12 relative z-10">
                                <div>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Submissions List</h3>
                                    <p className="text-white/60 text-sm font-medium mt-2">Manage and verify student work for <span className="text-primary">{selectedTask?.title}</span>.</p>
                                </div>
                                <button onClick={() => setShowSubmissionsModal(false)} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><X size={24} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar relative z-10 space-y-4">
                                {loadingSubmissions ? (
                                    <div className="p-20 text-center">
                                        <Zap className="mx-auto mb-6 text-primary animate-pulse" size={48} />
                                        <p className="text-white/40 font-black italic uppercase tracking-widest text-xs">Scanning Submissions...</p>
                                    </div>
                                ) : taskSubmissions.length > 0 ? taskSubmissions.map(sub => (
                                    <div key={sub.id} className="p-8 border border-white/5 bg-white/[0.02] rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-white/20 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black italic text-primary text-xl border border-primary/20">
                                                {sub.username[0].toUpperCase()}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-lg font-black italic uppercase text-white">{sub.username}</p>
                                                <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest leading-none">Submitted {new Date(sub.timestamp).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <a
                                                href={sub.file_path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-3 bg-white/5 hover:bg-white text-white hover:text-black rounded-xl font-black italic text-[9px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 border border-white/10"
                                            >
                                                <FileText size={14} /> View File
                                            </a>

                                            {sub.status === "pending" ? (
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleVerifySubmission(sub.id, "verified")}
                                                        className="px-6 py-3 bg-primary text-white rounded-xl font-black italic text-[9px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg"
                                                    >
                                                        Verify
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerifySubmission(sub.id, "rejected")}
                                                        className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black italic text-[9px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={clsx(
                                                    "px-6 py-3 rounded-xl font-black italic text-[9px] uppercase tracking-[0.2em] border",
                                                    sub.status === "verified" ? "text-primary border-primary/20 bg-primary/5" : "text-red-500 border-red-500/20 bg-red-500/5"
                                                )}>
                                                    {sub.status}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                        <Map className="mx-auto mb-6 text-white/20" size={48} />
                                        <p className="text-white/40 font-black italic uppercase tracking-[0.4em] text-sm">No Submissions Found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Room Confirmation Modal */}
                {showDeleteRoomModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowDeleteRoomModal(false)} />
                        <div className="relative w-full max-w-xl bg-[#050505] border border-red-500/20 rounded-[3rem] p-12 overflow-hidden shadow-[0_0_100px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-300">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none text-red-500"><Trash2 size={200} /></div>

                            <div className="relative z-10 text-center space-y-8">
                                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                    <Trash2 size={48} />
                                </div>

                                <div>
                                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">Delete Room?</h3>
                                    <div className="space-y-4">
                                        <p className="text-white/60 text-sm font-medium leading-relaxed">
                                            This action is <span className="text-red-500 font-bold">irreversible</span>.
                                        </p>
                                        <p className="text-white/40 text-xs font-medium uppercase tracking-widest bg-white/5 p-4 rounded-xl border border-white/5">
                                            All tasks, submissions, and member progress within this room will be permanently erased.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={confirmDeleteRoom}
                                        className="flex-1 py-6 bg-red-500 text-white font-black uppercase text-[10px] tracking-[0.5em] italic rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                                    >
                                        Confirm Delete
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteRoomModal(false)}
                                        className="flex-1 py-6 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-[0.5em] italic rounded-2xl hover:bg-white/10 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}