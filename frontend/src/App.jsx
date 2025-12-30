import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import { Login } from "./pages/Login"
import { Layout } from "./components/Layout"
import { Dashboard } from "./pages/Dashboard"
import { Rooms } from "./pages/Rooms"
import { RoomDetails } from "./pages/RoomDetails"
import { GlobalLeaderboard } from "./pages/GlobalLeaderboard"
import ScrollToTop from "./components/ScrollToTop"

function PrivateRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-white gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-slate-400 font-medium animate-pulse">Entering the Realm...</p>
        </div>
    )

    if (!user) return <Navigate to="/login" />

    return <Layout>{children}</Layout>
}

export default function App() {
    const { user, loading } = useAuth()

    if (loading) return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-white gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-slate-400 font-medium animate-pulse">Entering the Realm...</p>
        </div>
    )

    return (
        <BrowserRouter>
            <ScrollToTop />
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
