import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card } from "../components/ui/Card"

export function Login() {
    const { login } = useAuth()
    const [username, setUsername] = useState("")
    const [studentId, setStudentId] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!username || !studentId) return
        await login(username, studentId)
    }

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px]" />

            <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-card/80 border-slate-700/50">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2">
                        UniQuest
                    </h1>
                    <p className="text-slate-400">Wait, it's all a game?</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Username</label>
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="AdventurerName"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Student ID</label>
                        <Input
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="12345678"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full py-3 text-lg">
                        Start Adventure
                    </Button>
                </form>
            </Card>
        </div>
    )
}
