import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            
            if (token && savedUser) {
                try {
                    // Verify token is still valid by making a test request
                    // Or just use the saved user and let API handle auth errors
                    setUser(JSON.parse(savedUser));
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    // Set up axios interceptor to handle auth errors
                    axios.interceptors.response.use(
                        response => response,
                        error => {
                            if (error.response?.status === 401 || error.response?.status === 403) {
                                // Token expired or invalid
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                delete axios.defaults.headers.common['Authorization'];
                                setUser(null);
                            }
                            return Promise.reject(error);
                        }
                    );
                } catch (error) {
                    console.error('Error verifying token:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
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

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            await axios.post('/api/auth/register', userData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
