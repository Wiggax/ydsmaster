import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft, Crown, Lock } from 'lucide-react';

export default function Reading() {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/books', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBooks(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch books', error);
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Academic Reading</h1>
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        Pro Feature - YDS Level Academic Books
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {!user?.isPro && (
                    <div className="glass-panel p-6 rounded-2xl border border-yellow-500/20 mb-6 bg-yellow-500/5">
                        <div className="flex items-center gap-3 mb-2">
                            <Lock className="w-5 h-5 text-yellow-400" />
                            <h3 className="font-semibold text-yellow-400">Pro Subscription Required</h3>
                        </div>
                        <p className="text-gray-300 text-sm">
                            Book 1 is free for all users. Upgrade to Pro to access our full collection of 10 academic books designed for YDS preparation.
                            Each book contains 100 pages of high-quality academic content.
                        </p>
                    </div>
                )}

                <div className="grid gap-4 pb-4">
                    {books.map((book) => {
                        const isLocked = !user?.isPro && book.isPro && book.id !== 1;

                        return (
                            <Link
                                to={!isLocked ? `/reading/${book.id}` : '#'}
                                key={book.id}
                                className={isLocked ? 'pointer-events-none opacity-60' : ''}
                            >
                                <motion.div
                                    whileHover={!isLocked ? { scale: 1.01 } : {}}
                                    className="glass-panel p-6 flex items-center gap-4 hover:bg-white/5 transition-colors relative"
                                >
                                    <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{book.title}</h3>
                                            {book.isPro && book.id !== 1 && (
                                                <Crown className="w-4 h-4 text-yellow-400" />
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-sm line-clamp-2 mt-1">{book.description}</p>
                                        <p className="text-xs text-gray-500 mt-2">{book.totalPages} pages • {book.topic}</p>
                                    </div>
                                    {isLocked && (
                                        <div className="absolute top-4 right-4">
                                            <Lock className="w-5 h-5 text-gray-400" />
                                        </div>
                                    )}
                                </motion.div>
                            </Link>
                        );
                    })}

                    {books.length === 0 && (
                        <div className="text-center text-gray-400 mt-10">
                            No books available. Please generate books first.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
