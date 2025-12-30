import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../api"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Plus, Users, ArrowRight, Globe, Lock, Info, Zap, X } from "lucide-react"
import { clsx } from "clsx"

export function Rooms() {
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [showJoin, setShowJoin] = useState(false)

    const [newRoom, setNewRoom] = useState({ name: "", description: "", is_public: true })
    const [joinCode, setJoinCode] = useState("")

    useEffect(() => {
        fetchRooms()
    }, [])

    const fetchRooms = async () => {
        try {
            const { data } = await api.get("/rooms/my")
            setRooms(data)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            await api.post("/rooms/", newRoom)
            setNewRoom({ name: "", description: "", is_public: true })
            setShowCreate(false)
            fetchRooms()
        } catch (err) {
            alert("Failed to create room")
        }
    }

    const handleJoin = async (e) => {
        e.preventDefault()
        try {
            await api.post("/rooms/join", null, { params: { code: joinCode } })
            setJoinCode("")
            setShowJoin(false)
            fetchRooms()
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to join room")
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10 bg-black">
            <div className="w-16 h-16 md:w-20 md:h-20 relative">
                <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={24} />
            </div>
            <p className="text-primary font-black uppercase tracking-[0.6em] italic text-[10px]">Loading Room Data...</p>
        </div>
    )

    const GooeyButton = ({ children, onClick, className, type = "button" }) => (
        <button type={type} className={clsx("c-button c-button--gooey", className)} onClick={onClick}>
            {children}
            <span className="c-button__blobs">
                <div></div>
                <div></div>
                <div></div>
            </span>
        </button>
    )

    return (
        <div className="space-y-12 md:space-y-16 bg-black pb-32 md:pb-48 relative overflow-hidden px-6 md:px-12 lg:px-16 min-h-screen">
            {/* Studio Grid Background */}
            <div className="absolute inset-0 grid-overlay opacity-[0.05] pointer-events-none" />

            {/* Goo Filter SVG */}
            <svg style={{ visibility: 'hidden', position: 'absolute' }} width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                        <feComposite in2="goo" in="SourceGraphic" result="mix" />
                    </filter>
                </defs>
            </svg>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative z-10 pt-4">
                <div className="space-y-6">
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="h-[2px] w-12 md:w-24 bg-primary" />
                        <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] italic">Active Room Directory</span>
                    </div>
                    <div>
                        <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-black text-white italic uppercase tracking-tighter leading-none mb-2">STUDY ROOMS</h1>
                        <p className="text-white/60 text-sm md:text-base font-medium italic max-w-xl">Join a room or create your own study space within the global interface.</p>
                    </div>
                </div>
                <div className="flex gap-4 self-start sm:self-center">
                    <GooeyButton onClick={() => setShowJoin(!showJoin)} className={clsx(showJoin && "opacity-50")}>Join Room</GooeyButton>
                    <GooeyButton onClick={() => setShowCreate(!showCreate)} className={clsx(showCreate && "opacity-50")}>Create New Room</GooeyButton>
                </div>
            </div>

            {/* Create Room Modal/Form Overlay */}
            {showCreate && (
                <div className="animate-in fade-in zoom-in-95 duration-300 border border-white/10 bg-white/[0.02] rounded-[3rem] p-12 md:p-16 relative overflow-hidden shadow-2xl backdrop-blur-3xl">
                    <button onClick={() => setShowCreate(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                        <X size={32} />
                    </button>
                    <div className="max-w-4xl space-y-12">
                        <div>
                            <h3 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">ROOM CREATION</h3>
                            <p className="text-white/60 font-medium italic">Define the details of your new study room.</p>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-2 italic">Room Name</label>
                                    <input
                                        value={newRoom.name}
                                        onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                                        placeholder="Enter Room Name (e.g. CS101 Study Room)"
                                        required
                                        className="w-full bg-black/50 border border-white/10 text-white placeholder:text-white/20 text-xl p-6 rounded-2xl focus:border-primary transition-all font-black italic uppercase"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] ml-2 italic">Privacy Protocol</label>
                                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {newRoom.is_public ? <Globe size={18} className="text-secondary" /> : <Lock size={18} className="text-red-500" />}
                                            <span className="text-sm font-black italic uppercase text-white">{newRoom.is_public ? "Public Access" : "Private Room"}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNewRoom({ ...newRoom, is_public: !newRoom.is_public })}
                                            className={clsx(
                                                "relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none",
                                                newRoom.is_public ? "bg-secondary" : "bg-white/10"
                                            )}
                                        >
                                            <span className={clsx(
                                                "inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300",
                                                newRoom.is_public ? "translate-x-7" : "translate-x-1"
                                            )} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] ml-2 italic">Room Description</label>
                                <textarea
                                    value={newRoom.description}
                                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                                    placeholder="Describe the purpose and goals of this study room..."
                                    rows={3}
                                    className="w-full bg-black/50 border border-white/10 text-white placeholder:text-white/20 text-sm p-6 rounded-2xl focus:border-primary transition-all font-medium resize-none"
                                />
                            </div>

                            <div className="pt-4">
                                <GooeyButton type="submit" className="w-full sm:w-auto px-12 py-6 text-sm">Create Room</GooeyButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showJoin && (
                <div className="animate-in slide-in-from-top-4 border border-secondary/20 bg-secondary/5 rounded-[2rem] p-10 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8 text-secondary">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">EXTERNAL SYNC</h3>
                            <p className="text-secondary/60 text-xs font-bold uppercase tracking-widest">Enter room decryption code to join.</p>
                        </div>
                        <button onClick={() => setShowJoin(false)} className="p-3 bg-secondary/10 rounded-full hover:bg-secondary hover:text-white transition-all"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-6">
                        <input
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="Enter Room Code (e.g. C7618AF4)"
                            required
                            className="flex-1 bg-black/50 border border-secondary/20 text-white placeholder:text-secondary/30 text-lg p-6 rounded-2xl focus:border-secondary transition-all font-black italic uppercase"
                        />
                        <GooeyButton type="submit" className="bg-secondary">Join Room</GooeyButton>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                {rooms.map((room) => (
                    <Link key={room.id} to={`/rooms/${room.code}`} className="group h-full">
                        <Card className="h-full border-white/5 bg-white/[0.02] p-10 rounded-[2.5rem] transition-all duration-500 hover:bg-white hover:border-white hover:scale-[1.03] hover:shadow-[0_0_80px_rgba(255,255,255,0.05)] flex flex-col gap-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-10 transition-opacity pointer-events-none">
                                <Users size={120} />
                            </div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:bg-black group-hover:text-white transition-all duration-500">
                                    <Users size={28} />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[10px] font-black italic tracking-widest bg-white/5 group-hover:bg-black/5 px-3 py-1.5 rounded-full text-white/40 group-hover:text-black/60 border border-white/5 transition-all">
                                        #{room.code}
                                    </span>
                                    {!room.is_public && (
                                        <div className="flex items-center gap-1.5 text-red-500/60 group-hover:text-red-500 text-[8px] font-black uppercase tracking-widest">
                                            <Lock size={10} /> Private
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <h3 className="text-3xl font-black text-white group-hover:text-black italic uppercase tracking-tighter leading-none transition-colors">{room.name}</h3>
                                {room.description && (
                                    <p className="text-white/40 group-hover:text-black/60 text-xs font-medium italic line-clamp-2 transition-colors">
                                        {room.description}
                                    </p>
                                )}
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/5 group-hover:border-black/10 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3 text-primary group-hover:text-black text-[10px] font-black uppercase tracking-[0.2em] italic">
                                    Enter Room <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

            {rooms.length === 0 && (
                <div className="text-center py-32 border-2 border-dashed border-white/10 bg-white/[0.01] rounded-[3rem] relative z-10">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-white/20">
                        <Plus size={48} />
                    </div>
                    <h4 className="text-3xl font-black italic uppercase tracking-widest text-white mb-4">No Active Rooms</h4>
                    <p className="text-white/40 text-lg mb-12 max-w-md mx-auto italic font-medium">Your room directory is currently empty. Create a new room or join an existing one.</p>
                    <GooeyButton onClick={() => setShowCreate(true)}>Create Room</GooeyButton>
                </div>
            )}
        </div>
    )
}
