import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, BookOpen, Search, AlertCircle, Sparkles, PlayCircle } from 'lucide-react';
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

    const handleDelete = async (wordId) => {
        try {
            setDeletingId(wordId);
            const userStr = await Storage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!user || !user.id) return;

            await axios.delete(`/api/user/unknown/${user.id}/${wordId}`);
            setWords(words.filter(w => w.id !== wordId));
        } catch (error) {
            console.error('Failed to delete word', error);
            alert('Failed to delete word');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredWords = words.filter(word =>
        word.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.definition_tr.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStartQuiz = () => {
        if (words.length < 10) {
            alert(`Test oluşturmak için en az 10 kelimeye ihtiyacınız var. Şu anki sayı: ${words.length}`);
            return;
        }
        navigate('/unknown-words/quiz');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 pb-24 relative overflow-y-auto">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                <BookOpen className="w-8 h-8 text-purple-400" />
                                Bilmediğim Kelimeler
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">
                                {words.length} kelime listenizde
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Kelime ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                    />
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : filteredWords.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white/5 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Listeniz Boş</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Henüz hiç bilinmeyen kelime eklemediniz. Kelime kartlarında "Bilmiyorum" butonuna basarak buraya kelime ekleyebilirsiniz.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 pb-20">
                        <AnimatePresence>
                            {filteredWords.map((word) => (
                                <motion.div
                                    key={word.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="glass-panel p-4 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{word.term}</h3>
                                            <p className="text-purple-300 font-medium mb-2">{word.definition_tr}</p>
                                            <div className="flex gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 ${word.type === 'verb' ? 'text-blue-400' :
                                                    word.type === 'adjective' ? 'text-pink-400' :
                                                        'text-orange-400'
                                                    }`}>
                                                    {word.type}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(word.id)}
                                            disabled={deletingId === word.id}
                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                                        >
                                            {deletingId === word.id ? (
                                                <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {word.examples && (
                                        <div className="mt-3 pt-3 border-t border-white/5">
                                            <p className="text-sm text-gray-400 italic">"{word.examples}"</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Create Quiz Button - Fixed at Bottom */}
            {words.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent z-20">
                    <button
                        onClick={handleStartQuiz}
                        className="w-full max-w-4xl mx-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <PlayCircle className="w-6 h-6" />
                        Test Oluştur ({Math.min(20, words.length)} Soru)
                    </button>
                </div>
            )}
        </div>
    );
}
