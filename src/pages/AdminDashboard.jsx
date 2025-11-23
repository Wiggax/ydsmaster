import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, BookOpen, Activity, Settings, LogOut, Trash2, RefreshCw, UserPlus, Crown, X, Search, Key, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Storage } from '../utils/storage';

const AdminDashboard = () => {

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        users: 0,
        words: 0,
        texts: 0,
        totalUnknownWords: 0,
        activeUsers: 0
    });
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [resetting, setResetting] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        isPro: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Filter users based on search query
        if (searchQuery.trim() === '') {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = users.filter(u =>
                u.username.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                (u.phone && u.phone.includes(query))
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = await Storage.getItem('token');
            const [statsRes, usersRes] = await Promise.all([
                axios.get('/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('/api/admin/users', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setFilteredUsers(usersRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
            if (error.response?.status === 403 || error.response?.status === 401) {
                logout();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (deleteConfirm !== userId) {
            setDeleteConfirm(userId);
            return;
        }

        try {
            const token = await Storage.getItem('token');
            await axios.delete(`/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u.id !== userId));
            setStats(prev => ({ ...prev, users: prev.users - 1 }));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert(error.response?.data?.error || 'Failed to delete user');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const token = await Storage.getItem('token');
            const res = await axios.post('/api/admin/users', newUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers([...users, res.data.user]);
            setStats(prev => ({ ...prev, users: prev.users + 1 }));
            setShowCreateModal(false);
            setNewUser({ username: '', email: '', password: '', phone: '', isPro: false });
        } catch (error) {
            console.error('Failed to create user:', error);
            alert(error.response?.data?.error || 'Failed to create user');
        }
    };

    const handleTogglePro = async (userId) => {
        try {
            const token = await Storage.getItem('token');
            const res = await axios.patch(`/api/admin/users/${userId}/toggle-pro`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.map(u => u.id === userId ? { ...u, isPro: res.data.isPro } : u));
        } catch (error) {
            console.error('Failed to toggle Pro status:', error);
            alert(error.response?.data?.error || 'Failed to update Pro status');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const token = await Storage.getItem('token');
            const res = await axios.patch(`/api/admin/users/${userId}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.map(u => u.id === userId ? { ...u, role: res.data.role } : u));
        } catch (error) {
            console.error('Failed to update role:', error);
            alert(error.response?.data?.error || 'Failed to update role');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetting(true);
        try {
            const token = await Storage.getItem('token');
            const res = await axios.post(`/api/admin/users/${selectedUser.id}/reset-password`, {
                newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`✅ Şifre başarıyla sıfırlandı!\n\nKullanıcı: ${selectedUser.username}\nYeni Şifre: ${res.data.newPassword}\n\nBu şifreyi kullanıcıya iletin.`);
            setShowResetModal(false);
            setSelectedUser(null);
            setNewPassword('');
        } catch (error) {
            console.error('Failed to reset password:', error);
            alert(error.response?.data?.error || 'Failed to reset password');
        } finally {
            setResetting(false);
        }
    };

    const openResetModal = async (u) => {
        setSelectedUser(u);
        setNewPassword('');
        setShowResetModal(true);
    };

    const handleLogout = async () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-500">
                            Admin Panel
                        </h1>
                        <p className="text-gray-400">Welcome back, {user?.username}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="glass-panel p-6 rounded-2xl border border-white/10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                                        <Users size={24} />
                                    </div>
                                    <h3 className="text-lg font-semibold">Total Users</h3>
                                </div>
                                <p className="text-3xl font-bold">{stats.users}</p>
                                <p className="text-sm text-gray-400 mt-2">{stats.activeUsers} active</p>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl border border-white/10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                                        <BookOpen size={24} />
                                    </div>
                                    <h3 className="text-lg font-semibold">Total Words</h3>
                                </div>
                                <p className="text-3xl font-bold">{stats.words}</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    {stats.wordsByType?.verb || 0} verbs, {stats.wordsByType?.adjective || 0} adjectives, {stats.wordsByType?.noun || 0} nouns
                                </p>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl border border-white/10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                                        <Activity size={24} />
                                    </div>
                                    <h3 className="text-lg font-semibold">Unknown Words</h3>
                                </div>
                                <p className="text-3xl font-bold text-green-400">{stats.totalUnknownWords}</p>
                                <p className="text-sm text-gray-400 mt-2">Total saved by users</p>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl border border-white/10 mb-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">All Users</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        Create User
                                    </button>
                                    <button
                                        onClick={fetchData}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        title="Refresh"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by username, email, or phone..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary transition-colors"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-400" />
                                        </button>
                                    )}
                                </div>
                                {searchQuery && (
                                    <p className="text-sm text-gray-400 mt-2">
                                        Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-gray-400 border-b border-white/10">
                                            <th className="pb-4 px-4">Username</th>
                                            <th className="pb-4 px-4">Email</th>
                                            <th className="pb-4 px-4">Security Q</th>
                                            <th className="pb-4 px-4">Role</th>
                                            <th className="pb-4 px-4">Pro Status</th>
                                            <th className="pb-4 px-4">Unknown Words</th>
                                            <th className="pb-4 px-4">Progress</th>
                                            <th className="pb-4 px-4">Last Login</th>
                                            <th className="pb-4 px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {filteredUsers.map((u) => (
                                                <motion.tr
                                                    key={u.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="border-b border-white/5 hover:bg-white/5"
                                                >
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            {u.username}
                                                            {u.isDeleted && (
                                                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-full border border-red-500/20">
                                                                    Deleted
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-400">{u.email}</td>
                                                    <td className="py-4 px-4">
                                                        {u.securityQuestion ? (
                                                            <div className="flex items-center gap-1 text-xs text-green-400">
                                                                <Shield className="w-3 h-3" />
                                                                <span title={u.securityQuestion}>Set</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-500">None</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <select
                                                            value={u.role || 'user'}
                                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                            disabled={u.id === user.id || u.isDeleted}
                                                            className={`px-2 py-1 rounded text-xs border-none focus:ring-0 cursor-pointer ${u.role === 'admin'
                                                                ? 'bg-purple-500/20 text-purple-400'
                                                                : 'bg-gray-500/20 text-gray-400'
                                                                } ${u.isDeleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            <option value="user" className="bg-gray-800 text-gray-300">User</option>
                                                            <option value="admin" className="bg-gray-800 text-purple-400">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <button
                                                            onClick={() => handleTogglePro(u.id)}
                                                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition-colors ${u.isPro
                                                                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                                                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                                                                }`}
                                                        >
                                                            <Crown className="w-3 h-3" />
                                                            {u.isPro ? 'Pro' : 'Free'}
                                                        </button>
                                                    </td>
                                                    <td className="py-4 px-4">{u.stats?.unknownWordsCount || 0}</td>
                                                    <td className="py-4 px-4">{u.stats?.progressCount || 0}</td>
                                                    <td className="py-4 px-4 text-gray-400 text-sm">
                                                        {u.lastLogin
                                                            ? new Date(u.lastLogin).toLocaleDateString()
                                                            : 'Never'}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => openResetModal(u)}
                                                                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                                title="Reset Password"
                                                            >
                                                                <Key className="w-4 h-4" />
                                                            </button>
                                                            {u.role !== 'admin' && !u.isDeleted && (
                                                                <button
                                                                    onClick={() => handleDeleteUser(u.id, u.username)}
                                                                    className={`p-2 rounded-lg transition-colors ${deleteConfirm === u.id
                                                                        ? 'bg-red-500/30 text-red-400 hover:bg-red-500/40'
                                                                        : 'text-gray-400 hover:bg-red-500/20 hover:text-red-400'
                                                                        }`}
                                                                    title={deleteConfirm === u.id ? 'Click again to confirm' : 'Delete user'}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                                {filteredUsers.length === 0 && (
                                    <div className="text-center text-gray-400 py-8">
                                        {searchQuery ? 'No users found matching your search' : 'No users found'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Create User Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-panel p-6 rounded-2xl border border-white/10 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">Create New User</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={newUser.phone}
                                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isPro"
                                        checked={newUser.isPro}
                                        onChange={(e) => setNewUser({ ...newUser, isPro: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="isPro" className="text-sm flex items-center gap-1">
                                        <Crown className="w-4 h-4 text-yellow-400" />
                                        Grant Pro Access
                                    </label>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                                    >
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reset Password Modal */}
            <AnimatePresence>
                {showResetModal && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowResetModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-panel p-6 rounded-2xl border border-white/10 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <Key className="w-5 h-5 text-blue-400" />
                                    <h3 className="text-xl font-semibold">Reset Password</h3>
                                </div>
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-sm text-gray-300">
                                    <strong>User:</strong> {selectedUser.username}
                                </p>
                                <p className="text-sm text-gray-300 mt-1">
                                    <strong>Email:</strong> {selectedUser.email}
                                </p>
                                {selectedUser.securityQuestion && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <p className="text-xs text-gray-400 mb-1">Security Question:</p>
                                        <p className="text-sm text-gray-300">{selectedUser.securityQuestion}</p>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">New Password</label>
                                    <input
                                        type="text"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="Enter new password"
                                        required
                                        minLength={6}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowResetModal(false)}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={resetting}
                                        className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {resetting ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
