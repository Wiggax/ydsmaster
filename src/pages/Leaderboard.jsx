import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Medal, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Storage } from '../utils/storage';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = await Storage.getItem('token');
                const res = await axios.get('/api/user/leaderboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLeaders(res.data);
                setError(null);
            } catch (error) {
                console.error('Failed to fetch leaderboard', error);
                setError('Failed to load leaderboard. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankIcon = (index) => {

        if (index === 0) return <Trophy className="w-6 h-6 text-yellow-400" />;
        if (index === 1) return <Medal className="w-6 h-6 text-gray-300" />;
        if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
        return <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>;
    };

    if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

    if (error) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-red-400">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="h-full flex flex-col max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">
                        Leaderboard
                    </h1>
                    <p className="text-sm text-gray-400">Top performing students</p>
                </div>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 grid gap-2">
                    {leaders.map((user, index) => {
                        const isCurrentUser = user.id === currentUser?.id;

                        return (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`
                                    flex items-center gap-4 p-4 rounded-xl border transition-all
                                    ${isCurrentUser
                                        ? 'bg-primary/20 border-primary/50 shadow-lg shadow-primary/10'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-dark/50 border border-white/10">
                                    {getRankIcon(index)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold ${isCurrentUser ? 'text-primary' : 'text-white'}`}>
                                            {user.username}
                                        </h3>
                                        {user.role === 'admin' && (
                                            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                Admin
                                            </span>
                                        )}
                                        {isCurrentUser && (
                                            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                You
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-xl font-bold text-yellow-400 font-mono">
                                        {user.score.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Points</p>
                                </div>
                            </motion.div>
                        );
                    })}

                    {leaders.length === 0 && (
                        <div className="text-center text-gray-400 py-10">
                            No rankings available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
