import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Storage } from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            const token = await Storage.getItem('token');
            const savedUser = await Storage.getItem('user');

            if (token && savedUser) {
                try {
                    // Verify token is still valid by making a test request
                    // Or just use the saved user and let API handle auth errors
                    setUser(JSON.parse(savedUser));
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Set up axios interceptor to handle auth errors
                    axios.interceptors.response.use(
                        response => response,
                        async error => {
                            if (error.response?.status === 401 || error.response?.status === 403) {
                                // Token expired or invalid
                                await Storage.removeItem('token');
                                await Storage.removeItem('user');
                                delete axios.defaults.headers.common['Authorization'];
                                setUser(null);
                            }
                            return Promise.reject(error);
                        }
                    );
                } catch (error) {
                    console.error('Error verifying token:', error);
                    await Storage.removeItem('token');
                    await Storage.removeItem('user');
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            const { token, user } = res.data;

            await Storage.setItem('token', token);
            await Storage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Login failed';
            return { success: false, error: errorMessage };
        }
    };

    const register = async (userData) => {
        try {
            await axios.post('/api/auth/register', userData);
            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        await Storage.removeItem('token');
        await Storage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

