import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import api from "../api"
import { useAuth } from "../context/AuthContext"
import { useApp } from "../context/AppContext"
import { Trophy, Calendar, Upload, CheckCircle, Zap, Shield, Plus, Target, ArrowRight, ChevronRight, Map } from "lucide-react"
import { clsx } from "clsx"

export function RoomDetails() {
    const { code } = useParams()
    const { user } = useAuth()
    const { refreshStats } = useApp()
    const [room, setRoom] = useState(null)
    const [tasks, setTasks] = useState([])
    const [leaderboard, setLeaderboard] = useState([])
    const [activeTab, setActiveTab] = useState("tasks")
    const [isAdmin, setIsAdmin] = useState(false)
    const [newTask, setNewTask] = useState({ title: "", type: "lecture", xp_value: 100, deadline: "" })
    const [uploading, setUploading] = useState(null)
    const [creating, setCreating] = useState(false)

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
            const roomRes = await api.get(`/rooms/${code}`)
            setRoom(roomRes.data)
            try {
                const tasksRes = await api.get(`/rooms/${code}/tasks`)
                setTasks(tasksRes.data || [])
            } catch (e) { setTasks([]) }
            try {
                const lbRes = await api.get(`/rooms/${code}/leaderboard`)
                setLeaderboard(lbRes.data || [])
            } catch (e) { setLeaderboard([]) }
        } catch (error) { console.error(error) }
    }

    const handleCreateTask = async (e) => {
        e.preventDefault()
        if (!newTask.title || !newTask.deadline) return
        setCreating(true)
        try {
            const deadlineDate = new Date(newTask.deadline)
            const { data: createdTask } = await api.post(`/rooms/${code}/tasks/`, { ...newTask, deadline: deadlineDate.toISOString() })
            setTasks(prev => [createdTask, ...prev])
            setNewTask({ title: "", type: "lecture", xp_value: 100, deadline: "" })
        } catch (err) { alert(err.response?.data?.detail || "Failed to create task") } finally { setCreating(false) }
    }

    const handleFileUpload = async (taskId, file) => {
        if (!file) return
        setUploading(taskId)
        const formData = new FormData()
        formData.append("file", file)
        try {
            await api.post(`/rooms/${code}/tasks/${taskId}/submit/`, formData)
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_submitted: true } : t))
            await refreshStats()
        } catch (err) { alert(err.response?.data?.detail || "Upload failed") } finally { setUploading(null) }
    }

    if (!room) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10 bg-black">
            <div className="w-16 h-16 md:w-20 md:h-20 relative">
                <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={24} />
            </div>
            <p className="text-primary font-black uppercase tracking-[0.6em] italic text-[10px]">Analyzing Sector Identity Matrix...</p>
        </div>
    )

    return (
        <div className="space-y-24 md:space-y-32 bg-black pb-32 md:pb-48 relative overflow-hidden px-6 md:px-12">
            {/* Studio Grid Background */}
            <div className="absolute inset-0 grid-overlay opacity-[0.05] pointer-events-none" />

            {/* Tactical Sector Hero */}
            <header className="space-y-8 md:space-y-12 relative z-10">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="h-[2px] w-12 md:w-24 bg-secondary" />
                    <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px] italic">Operational Sector_{room.code}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 md:gap-16">
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-8xl lg:text-[9rem] font-black text-white italic uppercase tracking-[calc(-0.06em)] leading-[0.9]">
                            {room.name} <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-white">{room.course_code}</span>
                        </h1>
                        <p className="text-white/40 text-xl md:text-3xl font-medium max-w-2xl italic leading-tight">
                            Strategic Command Interface for professional technical execution within the Origin Sector.
                        </p>
                    </div>
                    {isAdmin && (
                        <div className="p-8 md:p-10 bg-primary text-white rounded-2xl md:rounded-[3rem] shadow-[0_0_50px_hsla(var(--primary),0.3)] hover-lift flex flex-col items-center gap-4 shrink-0">
                            <Shield size={40} md:size={48} />
                            <span className="text-[10px] font-black uppercase tracking-widest italic opacity-60">Admin Unit</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Tactical Navigation Bar */}
            <div className="border-y border-white/5 flex relative z-10 bg-white/[0.01]">
                {[
                    { id: 'tasks', label: 'Operational Directives', icon: Target },
                    { id: 'leaderboard', label: 'Sector Standings', icon: Trophy }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex-1 p-8 md:p-12 font-black uppercase text-[10px] md:text-xs italic tracking-[0.5em] transition-all flex items-center justify-center gap-4 md:gap-6 group relative overflow-hidden",
                            activeTab === tab.id ? "bg-white text-black" : "text-white/40 hover:text-white"
                        )}
                    >
                        {activeTab === tab.id && <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />}
                        <tab.icon size={20} md:size={24} className={clsx("relative z-10 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-primary" : "text-white/20 group-hover:text-white")} />
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 relative z-10">
                <div className="lg:col-span-8 space-y-4">
                    {activeTab === 'tasks' ? (
                        tasks.length > 0 ? tasks.map((task, idx) => (
                            <div key={task.id} className="group flex flex-col md:flex-row items-stretch border border-white/5 bg-white/[0.02] p-8 md:p-16 transition-all duration-1000 hover:bg-white hover:text-black hover:border-transparent relative overflow-hidden">
                                <div className="absolute inset-y-0 left-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-700" />

                                <div className="flex-1 space-y-4 md:space-y-6">
                                    <div className="flex items-center gap-4 md:gap-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 italic transition-all">
                                        <span className="text-secondary group-hover:text-black">MISSION_{idx + 1}</span>
                                        <div className="h-[1px] w-6 md:w-8 bg-current" />
                                        <span>DIRECTIVE_{task.type}</span>
                                        <div className="h-[1px] w-6 md:w-8 bg-current" />
                                        <div className="flex items-center gap-2"><Calendar size={12} /> DL_{new Date(task.deadline).toLocaleDateString()}</div>
                                    </div>
                                    <h4 className="text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter leading-none group-hover:translate-x-6 transition-all duration-700">{task.title}</h4>
                                </div>

                                <div className="flex items-center justify-end md:w-72 lg:w-80 mt-8 md:mt-0">
                                    {task.is_submitted ? (
                                        <div className="flex items-center gap-3 md:gap-4 font-black italic uppercase text-[11px] md:text-[12px] tracking-widest text-primary group-hover:text-black">
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-black/10"><CheckCircle size={20} md:size={24} /></div>
                                            Verified Deployment
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer group/label">
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(task.id, e.target.files[0])} disabled={uploading === task.id} />
                                            <div className={clsx(
                                                "px-8 md:px-12 py-4 md:py-6 border-2 border-primary/30 group-hover:border-black rounded-full font-black italic text-[9px] md:text-[10px] uppercase tracking-[0.4em] flex items-center gap-3 md:gap-4 hover:bg-black hover:text-white transition-all shadow-xl",
                                                uploading === task.id && "animate-pulse opacity-50"
                                            )}>
                                                {uploading === task.id ? "Deploying Data_Sync" : "Initialize Solution"} <Upload size={16} md:size={18} />
                                            </div>
                                        </label>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="p-16 md:p-32 text-center border-2 border-dashed border-white/5 bg-white/[0.01] rounded-[2rem] md:rounded-[4rem]">
                                <Zap className="mx-auto mb-6 md:mb-8 text-white/10" size={48} md:size={64} />
                                <p className="text-white/20 font-black italic uppercase tracking-[0.6em] text-lg md:text-xl">Sector Chamber Silent_No Directives Issued</p>
                            </div>
                        )
                    ) : (
                        <div className="space-y-2">
                            {leaderboard.map((entry, idx) => (
                                <div key={entry.user_id} className="flex items-center justify-between p-8 md:p-14 border border-white/5 bg-white/[0.02] group hover:bg-primary hover:text-white transition-all duration-700 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center gap-8 md:gap-12 relative z-10">
                                        <span className="text-3xl md:text-5xl font-black italic opacity-20 group-hover:opacity-100 group-hover:translate-x-4 transition-all">0{idx + 1}</span>
                                        <div>
                                            <p className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">{entry.username}</p>
                                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-white/60 mt-2 italic">Specialized Tactical Rank</p>
                                        </div>
                                    </div>
                                    <div className="text-right relative z-10">
                                        <p className="text-3xl md:text-5xl font-black italic leading-none">{entry.total_xp}</p>
                                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/40 mt-3 italic">Operational XP</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <aside className="lg:col-span-4 space-y-12 md:space-y-16">
                    {isAdmin && (
                        <div className="p-8 md:p-12 lg:p-16 border-2 border-primary/20 bg-primary/5 rounded-[3rem] md:rounded-[4rem] space-y-8 md:space-y-12 group hover:border-primary transition-all duration-700 neon-glow-primary relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.05] pointer-events-none"><Zap size={150} /></div>
                            <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter relative z-10">Command <br /> <span className="text-primary">Directives.</span></h3>
                            <form onSubmit={handleCreateTask} className="space-y-8 md:space-y-10 relative z-10">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-primary uppercase tracking-[0.5em] ml-2 italic">Operation Alias</label>
                                    <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="w-full bg-black/40 border border-white/10 p-5 md:p-6 rounded-2xl text-white font-black italic uppercase text-xs md:text-sm placeholder:text-white/10 focus:border-primary transition-all" placeholder="MISSION_CODE_NAME" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-primary uppercase tracking-[0.5em] ml-2 italic">Time Deadline</label>
                                    <input type="datetime-local" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} className="w-full bg-black/40 border border-white/10 p-5 md:p-6 rounded-2xl text-white font-black italic uppercase text-xs md:text-sm focus:border-primary transition-all" />
                                </div>
                                <button type="submit" disabled={creating} className="w-full py-6 md:py-8 bg-primary text-white font-black uppercase text-[10px] md:text-xs tracking-[0.5em] italic rounded-full shadow-[0_0_40px_hsla(var(--primary),0.3)] hover:scale-105 active:scale-95 transition-all">
                                    {creating ? "Initing_Deployment..." : "Deploy Mission"}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="p-8 md:p-12 lg:p-16 bg-white/[0.01] border border-white/5 rounded-[3rem] md:rounded-[4rem] space-y-8 md:space-y-12 relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 p-8 md:p-12 opacity-[0.03] pointer-events-none"><Map size={150} /></div>
                        <h3 className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.6em] text-secondary italic">Sector Dynamics</h3>
                        <div className="space-y-8 md:space-y-10">
                            <div className="flex justify-between border-b border-white/5 pb-4 md:pb-6">
                                <span className="text-[9px] md:text-[10px] font-black uppercase text-white/20 italic tracking-widest">Operator Capacity</span>
                                <span className="font-black italic text-lg md:text-xl">{leaderboard.length.toLocaleString()} Units</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-4 md:pb-6">
                                <span className="text-[9px] md:text-[10px] font-black uppercase text-white/20 italic tracking-widest">Active Objectives</span>
                                <span className="font-black italic text-lg md:text-xl">{tasks.length} Directives</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}

