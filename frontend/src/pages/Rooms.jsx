import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../api"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Plus, Users, ArrowRight } from "lucide-react"

export function Rooms() {
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [showJoin, setShowJoin] = useState(false)

    const [newRoomName, setNewRoomName] = useState("")
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
            await api.post("/rooms/", { name: newRoomName })
            setNewRoomName("")
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
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    )

    const GooeyButton = ({ children, onClick, className }) => (
        <button className={`c-button c-button--gooey ${className}`} onClick={onClick}>
            {children}
            <span className="c-button__blobs">
                <div></div>
                <div></div>
                <div></div>
            </span>
        </button>
    )

    return (
        <div className="space-y-12 md:space-y-16 bg-black pb-32 md:pb-48 relative overflow-hidden px-6 md:px-12 lg:px-16">
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
                        <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] italic">Active Realm Directory_V2.5</span>
                    </div>
                    <div>
                        <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-black text-white italic uppercase tracking-tighter leading-none mb-2">YOUR QUEST ROOMS</h1>
                        <p className="text-white/60 text-sm md:text-base font-medium italic max-w-xl">Join a realm or create your own adventure within the global interface.</p>
                    </div>
                </div>
                <div className="flex gap-4 self-start sm:self-center">
                    <GooeyButton onClick={() => setShowJoin(!showJoin)}>Join Room</GooeyButton>
                    <GooeyButton onClick={() => setShowCreate(!showCreate)}>Create Room</GooeyButton>
                </div>
            </div>

            {showCreate && (
                <div className="mb-12 animate-in slide-in-from-top-4 border border-white/10 bg-white/[0.02] rounded-[3rem] p-12 relative overflow-hidden">
                    <h3 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-8">ENTER A UNIQUE NAME FOR YOUR ROOM</h3>
                    <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-6 items-center">
                        <Input
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="Room Name (e.g. CS101)"
                            required
                            className="flex-1 bg-black/50 border border-white/20 text-white placeholder:text-white/60 text-lg p-8 rounded-2xl focus:border-primary transition-all font-medium"
                        />
                        <GooeyButton type="submit">Create Realm</GooeyButton>
                    </form>
                </div>
            )}

            {showJoin && (
                <Card className="mb-6 animate-in slide-in-from-top-4 border-secondary/20 bg-secondary/5">
                    <h3 className="font-bold mb-4 text-white">Join Existing Room</h3>
                    <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-4">
                        <Input
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="Enter Room Code"
                            required
                            className="flex-1"
                        />
                        <GooeyButton type="submit">Join Realm</GooeyButton>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <Link key={room.id} to={`/rooms/${room.code}`}>
                        <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer group border-border/50">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <Users size={24} />
                                </div>
                                <span className="text-xs font-mono bg-surface px-2 py-1 rounded text-white/60 border border-border/50">
                                    {room.code}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{room.name}</h3>
                            <div className="flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                Enter Realm <ArrowRight size={14} />
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

            {rooms.length === 0 && (
                <div className="text-center py-24 bg-card border border-dashed border-border rounded-3xl">
                    <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 text-white/60">
                        <Plus size={32} />
                    </div>
                    <p className="text-white/60 text-lg">No rooms found.</p>
                    <p className="text-white/60 mb-8">Create or join one to begin your first quest!</p>
                </div>
            )}
        </div>
    )
}
