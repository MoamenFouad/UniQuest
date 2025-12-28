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

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Your Quest Rooms</h1>
                    <p className="text-slate-400">Join a realm or create your own adventure.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setShowJoin(!showJoin)}>Join Room</Button>
                    <Button onClick={() => setShowCreate(!showCreate)}>Create Room</Button>
                </div>
            </div>

            {showCreate && (
                <Card className="mb-6 animate-in slide-in-from-top-4 border-primary/20 bg-primary/5">
                    <h3 className="font-bold mb-4 text-white">Create a New Room</h3>
                    <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
                        <Input
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="Room Name (e.g. CS101)"
                            required
                            className="flex-1"
                        />
                        <Button type="submit">Create Realm</Button>
                    </form>
                </Card>
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
                        <Button type="submit" variant="primary" className="bg-secondary hover:bg-secondary/90 shadow-secondary/20">Join Realm</Button>
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
                                <span className="text-xs font-mono bg-surface px-2 py-1 rounded text-slate-400 border border-border/50">
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
                    <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                        <Plus size={32} />
                    </div>
                    <p className="text-slate-400 text-lg">No rooms found.</p>
                    <p className="text-slate-600 mb-8">Create or join one to begin your first quest!</p>
                </div>
            )}
        </div>
    )
}
