import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import { Login } from "./pages/Login"
import { Layout } from "./components/Layout"
import { Dashboard } from "./pages/Dashboard"
import { Rooms } from "./pages/Rooms"
import { RoomDetails } from "./pages/RoomDetails"
import { GlobalLeaderboard } from "./pages/GlobalLeaderboard"

function PrivateRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center text-white">Loading...</div>

    if (!user) return <Navigate to="/login" />

    return <Layout>{children}</Layout>
}

export default function App() {
    const { user, loading } = useAuth()

    if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center text-white">Loading...</div>

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

                <Route path="/" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />

                <Route path="/rooms" element={
                    <PrivateRoute>
                        <Rooms />
                    </PrivateRoute>
                } />

                <Route path="/rooms/:code" element={
                    <PrivateRoute>
                        <RoomDetails />
                    </PrivateRoute>
                } />

                <Route path="/leaderboard" element={
                    <PrivateRoute>
                        <GlobalLeaderboard />
                    </PrivateRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}
