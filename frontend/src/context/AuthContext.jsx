import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { googleProvider, facebookProvider, appleProvider, socialLogin as firebaseSocialLogin, auth, linkWithPopup, unlink } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setUser(data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (identifier, password) => {
        const { data } = await api.post('/auth/login', { identifier, password });
        setUser(data);
    };

    const signup = async (userData) => {
        const { data } = await api.post('/auth/signup', userData);
        setUser(data);
    };

    const loginWithSocial = async (providerType) => {
        let provider;
        if (providerType === 'google') provider = googleProvider;
        else if (providerType === 'facebook') provider = facebookProvider;
        else if (providerType === 'apple') provider = appleProvider;

        const { idToken, providerId } = await firebaseSocialLogin(provider);
        const { data } = await api.post('/auth/firebase-login', {
            id_token: idToken,
            provider: providerType
        });
        setUser(data);
        return data;
    };

    const linkSocialAccount = async (providerType) => {
        let provider;
        if (providerType === 'google') provider = googleProvider;
        else if (providerType === 'facebook') provider = facebookProvider;
        else if (providerType === 'apple') provider = appleProvider;

        const result = await linkWithPopup(auth.currentUser, provider);
        const idToken = await result.user.getIdToken();

        // Update choice on backend
        const { data } = await api.post('/auth/firebase-login', {
            id_token: idToken,
            provider: providerType
        });
        setUser(data);
    };

    const unlinkSocialAccount = async () => {
        // This is a simplified version, usually you'd check which index to unlink
        // or just unlink all firebase if they have a traditional login
        await unlink(auth.currentUser, auth.currentUser.providerData[0].providerId);
        // Refresh me
        const { data } = await api.get('/auth/me');
        setUser(data);
    };

    const updateProfile = async (userData) => {
        const { data } = await api.put('/auth/me', userData);
        setUser(data);
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user, login, signup, updateProfile, logout, loading,
            loginWithSocial, linkSocialAccount, unlinkSocialAccount
        }}>
            {children}
        </AuthContext.Provider>
    );
};
