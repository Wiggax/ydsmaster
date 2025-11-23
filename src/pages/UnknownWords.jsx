import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, BookOpen, Search, Sparkles } from 'lucide-react';
import { Storage } from '../utils/storage';

export default function UnknownWords() {
    const navigate = useNavigate();
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchWords();
    }, []);

    const fetchWords = async () => {
        try {
            const userStr = await Storage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!user || !user.id) {
                setLoading(false);
                return;
            }

            const res = await axios.get(`/api/user/unknown/${user.id}`);
            setWords(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch unknown words', error);
            setLoading(false);
        }
    };

    const handleRemove = async (id, e) => {
        e.stopPropagation(); // Prevent card click if we add one later
        setDeletingId(id);
        try {
            const userStr = await Storage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!user || !user.id) return;

            await axios.delete(`/api/user/unknown/${user.id}/${id}`);
            setWords(prev => prev.filter(w => w.id !== id));
        } catch (error) {
            console.error('Failed to remove word:', error);
            alert('Failed to remove word. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredWords = words.filter(word =>
        word.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.definition_tr.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 pb-4 pt-6 px-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Unknown Words
                            </h1>
                            <p className="text-xs text-gray-400 font-medium">
                                {words.length} words to master
                            </p>
                        </div>
                    </div>

                    {words.length >= 10 && (
                        <Link
                            to="/unknown-words/quiz"
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/20 font-semibold flex items-center gap-2 text-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Practice</span>
                        </Link>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your words..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredWords.length > 0 ? (
                        filteredWords.map((word, index) => (
                            <motion.div
                                key={word.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="group relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 shadow-lg"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleRemove(word.id, e)}
                                        disabled={deletingId === word.id}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        {deletingId === word.id ? (
                                            <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                <div className="pr-12">
                                    <h3 className="text-xl font-bold text-white mb-1 tracking-wide">
                                        {word.term}
                                    </h3>
                                    <p className="text-purple-300 font-medium mb-3">
                                        {word.definition_tr}
                                    </p>
                                    {word.examples && (
                                        <div className="relative pl-3 border-l-2 border-white/10">
                                            <p className="text-sm text-gray-400 italic leading-relaxed">
                                                "{word.examples}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center px-6"
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <BookOpen className="w-10 h-10 text-gray-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {searchTerm ? 'No matches found' : 'Your list is empty'}
                            </h3>
                            <p className="text-gray-400 max-w-xs mx-auto">
                                {searchTerm
                                    ? `No words matching "${searchTerm}"`
                                    : "Start adding words from the flashcards to build your personal dictionary!"}
                            </p>
                            {!searchTerm && (
                                <Link
                                    to="/"
                                    className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                                >
                                    Go to Flashcards
                                </Link>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
