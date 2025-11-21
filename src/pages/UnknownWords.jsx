import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, BookOpen } from 'lucide-react';

export default function UnknownWords() {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWords = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
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
        fetchWords();
    }, []);

    const handleRemove = async (id) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.id) return;

            await axios.delete(`/api/user/unknown/${user.id}/${id}`);
            setWords(words.filter(w => w.id !== id));
        } catch (error) {
            console.error('Failed to remove word:', error);
            alert('Failed to remove word. Please try again.');
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

    return (
        <div className="h-full flex flex-col overflow-y-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold">Unknown Words</h1>
            </div>

            <div className="grid gap-4 pb-6">
                {words.map((word) => (
                    <motion.div
                        key={word.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="glass-panel p-6 flex items-center justify-between group"
                    >
                        <div>
                            <h3 className="text-xl font-bold text-white">{word.term}</h3>
                            <p className="text-secondary">{word.definition_tr}</p>
                            <p className="text-sm text-gray-400 mt-1 italic">"{word.examples}"</p>
                        </div>

                        <button
                            onClick={() => handleRemove(word.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </motion.div>
                ))}

                {words.length === 0 && (
                    <div className="text-center text-gray-400 mt-10 flex flex-col items-center gap-4">
                        <BookOpen className="w-12 h-12 opacity-20" />
                        <p>Your list is empty. Great job!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
