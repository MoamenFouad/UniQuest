import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.get('/dashboard');
            setDashboardData(data);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const refreshStats = useCallback(() => {
        return fetchDashboard();
    }, [fetchDashboard]);

    // Provide backward-compatible stats object
    const stats = dashboardData ? {
        xp: dashboardData.total_xp,
        level: dashboardData.level,
        streak: dashboardData.current_streak,
        questsDone: dashboardData.quests_completed,
        lastSubmission: dashboardData.recent_activities?.[0] ? {
            title: dashboardData.recent_activities[0].quest_title,
            date: new Date(dashboardData.recent_activities[0].timestamp)
        } : null,
        rank: dashboardData.global_rank
    } : {
        xp: 0,
        level: 1,
        streak: 0,
        questsDone: 0,
        lastSubmission: null
    };

    const leaderboard = dashboardData?.top_adventurers || [];

    return (
        <AppContext.Provider value={{
            stats,
            leaderboard,
            dashboardData,
            loading,
            refreshStats
        }}>
            {children}
        </AppContext.Provider>
    );
};
