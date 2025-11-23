import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, GraduationCap, Gamepad2, Layers, Plus, LogOut, Trophy, Activity, Flame, Crown, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Storage } from '../utils/storage';

export default function Dashboard() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        dailyStreak: 0,
        score: 0,
        learnedCount: 0,
        accuracy: 0
    });
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        try {
            const token = await Storage.getItem('token');
            const res = await axios.get('/api/user/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            const token = await Storage.getItem('token');
            await axios.delete('/api/account/delete', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Logout and redirect to login
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to delete account:', error);
            alert('Hesap silinirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const menuItems = [
        { title: 'En Çok Kullanılan Fiiller', path: '/flashcards/verb', icon: Layers, color: 'from-blue-500 to-cyan-500', desc: 'Master essential verbs' },
        { title: 'En Çok Kullanılan Sıfatlar', path: '/flashcards/adjective', icon: Layers, color: 'from-purple-500 to-pink-500', desc: 'Descriptive power' },
        { title: 'En Çok Kullanılan İsimler', path: '/flashcards/noun', icon: Layers, color: 'from-orange-500 to-red-500', desc: 'Building blocks' },
        { title: 'Bilmediğim Kelimeler', path: '/unknown-words', icon: BookOpen, color: 'from-emerald-500 to-teal-500', desc: 'Your personal list' },
        { title: 'Akademik Okuma Parçaları', path: '/reading', icon: GraduationCap, color: 'from-indigo-500 to-violet-500', desc: 'Advanced texts' },
        { title: 'Kelime Eşleştirme', path: '/games/match', icon: Gamepad2, color: 'from-rose-500 to-orange-500', desc: 'Test your memory' },
        { title: 'Kelime Testi', path: '/games/fill', icon: Gamepad2, color: 'from-amber-500 to-yellow-500', desc: 'Contextual practice' },
        { title: 'Liderlik Tablosu', path: '/leaderboard', icon: Trophy, color: 'from-yellow-400 to-amber-600', desc: 'Top students' },
    ];

    return (
        <div className="h-full flex flex-col overflow-hidden relative">
            {/* Background Ambient Glow */}
            < div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

            <header className="flex justify-between items-center mb-6 relative z-10">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent"
                    >
                        Hello, {user?.username}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 text-sm flex items-center gap-2"
                    >
                        <Flame className="w-4 h-4 text-orange-500" />
                        {loading ? 'Loading...' : `Daily Streak: ${stats.dailyStreak} Day${stats.dailyStreak !== 1 ? 's' : ''}`}
                        {user?.isPro && (
                            <span className="ml-2 flex items-center gap-1 text-yellow-400">
                                <Crown className="w-4 h-4" /> Pro
                            </span>
                        )}
                    </motion.p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Only show delete button for non-admin users */}
                    {user?.role !== 'admin' && (
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="p-2 hover:bg-red-500/20 rounded-xl transition-colors border border-red-500/20 hover:border-red-500/40"
                            title="Hesabı Sil"
                        >
                            <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                    )}
                    <button onClick={logout} className="p-2 hover:bg-white/10 rounded-xl transition-colors border border-white/5">
                        <LogOut className="w-6 h-6 text-gray-400" />
                    </button>
                </div>
            </header>

            {/* Pro Banner for Free Users */}
            {!user?.isPro && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-6 relative z-10"
                >
                    <Link to="/pro">
                        <div className="glass-panel p-4 rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                                        <Crown className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Pro'ya Yükselt</h3>
                                        <p className="text-xs text-gray-300">Tüm özelliklere sınırsız erişim - Sadece 29.99₺</p>
                                    </div>
                                </div>
                                <div className="text-yellow-400 font-bold">→</div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            )
            }

            {/* Stats Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-3 mb-8 relative z-10"
            >
                <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg">
                    <div className="flex items-center gap-2 mb-1 text-blue-400">
                        <Trophy className="w-4 h-4" />
                        <span className="text-xs font-medium">Score</span>
                    </div>
                    <p className="text-xl font-bold">
                        {loading ? '...' : stats.score.toLocaleString()}
                    </p>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg">
                    <div className="flex items-center gap-2 mb-1 text-purple-400">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-xs font-medium">Learned</span>
                    </div>
                    <p className="text-xl font-bold">
                        {loading ? '...' : stats.learnedCount}
                    </p>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg">
                    <div className="flex items-center gap-2 mb-1 text-emerald-400">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-medium">Accuracy</span>
                    </div>
                    <p className="text-xl font-bold">
                        {loading ? '...' : `${stats.accuracy}%`}
                    </p>
                </div>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-4 overflow-y-auto pb-24 pr-2 -mr-2 custom-scrollbar relative z-10"
            >
                {menuItems.map((item, index) => (
                    <motion.div key={index} variants={item}>
                        <Link to={item.path}>
                            <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all group cursor-pointer h-full">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2 group-hover:text-white transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                    {item.desc}
                                </p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {/* Delete Account Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-500/20 rounded-full">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Hesabı Sil</h2>
                            </div>

                            <div className="space-y-3 mb-6">
                                <p className="text-gray-300">
                                    Hesabınızı silmek üzeresiniz. Bu işlem <strong className="text-red-400">geri alınamaz</strong>.
                                </p>
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                    <p className="text-sm text-gray-300">Silinecek veriler:</p>
                                    <ul className="text-sm text-gray-400 mt-2 space-y-1 list-disc list-inside">
                                        <li>Tüm ilerleme kayıtları</li>
                                        <li>Bilinmeyen kelimeler listeniz</li>
                                        <li>Sınav sonuçlarınız</li>
                                        <li>Liderlik tablosu verileriniz</li>
                                        <li>Hesap bilgileriniz</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors font-semibold disabled:opacity-50"
                                >
                                    {deleteLoading ? 'Siliniyor...' : 'Hesabı Sil'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
