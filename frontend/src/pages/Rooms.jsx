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

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Your Quest Rooms</h1>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setShowJoin(!showJoin)}>Join Room</Button>
                    <Button onClick={() => setShowCreate(!showCreate)}>Create Room</Button>
                </div>
            </div>

            {showCreate && (
                <Card className="mb-6 animate-in slide-in-from-top-4">
                    <h3 className="font-bold mb-4 text-white">Create a New Room</h3>
                    <form onSubmit={handleCreate} className="flex gap-4">
                        <Input
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="Room Name (e.g. CS101)"
                            required
                        />
                        <Button type="submit">Create</Button>
                    </form>
                </Card>
            )}

            {showJoin && (
                <Card className="mb-6 animate-in slide-in-from-top-4">
                    <h3 className="font-bold mb-4 text-white">Join Existing Room</h3>
                    <form onSubmit={handleJoin} className="flex gap-4">
                        <Input
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="Enter Room Code"
                            required
                        />
                        <Button type="submit">Join</Button>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <Link key={room.id} to={`/rooms/${room.code}`}>
                        <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Users size={24} />
                                </div>
                                <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">
                                    {room.code}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{room.name}</h3>
                            <p className="text-slate-400 text-sm">Tap to enter realm</p>
                        </Card>
                    </Link>
                ))}
            </div>

            {rooms.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    <p>No rooms found. Create or join one to begin!</p>
                </div>
            )}
        </div>
    )
}
