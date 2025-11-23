import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus, Check, Save } from 'lucide-react';
import Flashcard from '../components/Flashcard';
import { useAuth } from '../context/AuthContext';
import ProModal from '../components/ProModal';
import { Storage } from '../utils/storage';

export default function Flashcards() {
    const { type } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [direction, setDirection] = useState(0);
    const [savingProgress, setSavingProgress] = useState(false);
    const [progressSaved, setProgressSaved] = useState(false);
    const [progressLoaded, setProgressLoaded] = useState(false);
    const [showProModal, setShowProModal] = useState(false);

    const FREE_LIMIT = 100;

    // Save progress to backend
    const saveProgress = useCallback(async (index, showMessage = false) => {
        const userStr = await Storage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (!user || !user.id) return false;

        setSavingProgress(true);
        try {
            await axios.post('/api/user/progress', {
                contentType: `flashcards-${type}`,
                currentIndex: index,
                metadata: { type, totalWords: words.length }
            });

            if (showMessage) {
                setProgressSaved(true);
                setTimeout(() => setProgressSaved(false), 2000);
            }
            setSavingProgress(false);
            return true;
        } catch (error) {
            console.error('Failed to save progress:', error);
            setSavingProgress(false);
            if (showMessage) {
                alert('İlerleme kaydedilemedi. Lütfen tekrar deneyin.');
            }
            return false;
        }
    }, [type, words.length]);

    // Load saved progress - must run AFTER words are loaded
    useEffect(() => {
        const loadProgress = async () => {
            if (!user || !user.id || words.length === 0 || progressLoaded) return;

            try {
                const res = await axios.get(`/api/user/progress/flashcards-${type}`);
                if (res.data && res.data.currentIndex !== undefined && res.data.currentIndex !== null) {
                    const savedIndex = Math.min(Math.max(0, res.data.currentIndex), words.length - 1);
                    setCurrentIndex(savedIndex);
                    console.log(`✓ İlerleme yüklendi: ${savedIndex + 1}. karttan devam ediliyor`);
                }
            } catch (error) {
                // 404 means no progress saved yet, which is fine
                if (error.response?.status !== 404) {
                    console.error('Failed to load progress:', error);
                }
            } finally {
                setProgressLoaded(true);
            }
        };

        // Only load progress once when words are loaded
        if (!loading && words.length > 0 && !progressLoaded) {
            loadProgress();
        }
    }, [loading, words.length, user, type, progressLoaded]);

    // Reset progress loaded flag when user or type changes
    useEffect(() => {
        setProgressLoaded(false);
        setCurrentIndex(0);
    }, [user, type]);

    useEffect(() => {
        const fetchWords = async () => {
            try {
                const res = await axios.get(`/api/content/words/${type}`);
                setWords(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch words', error);
                setLoading(false);
            }
        };
        fetchWords();
    }, [type]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowRight' && currentIndex < words.length - 1) {
                // Check Pro limit
                if (!user?.isPro && currentIndex >= FREE_LIMIT - 1) {
                    setShowProModal(true);
                    return;
                }
                const newIndex = currentIndex + 1;
                setDirection(1);
                setCurrentIndex(newIndex);
                saveProgress(newIndex);
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                const newIndex = currentIndex - 1;
                setDirection(-1);
                setCurrentIndex(newIndex);
                saveProgress(newIndex);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentIndex, words.length, saveProgress, user]);

    const handleSaveProgress = async () => {
        await saveProgress(currentIndex, true);
    };

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            // Check Pro limit
            if (!user?.isPro && currentIndex >= FREE_LIMIT - 1) {
                setShowProModal(true);
                return;
            }
            const newIndex = currentIndex + 1;
            setDirection(1);
            setCurrentIndex(newIndex);
            saveProgress(newIndex, false); // Silent save on navigation
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setDirection(-1);
            setCurrentIndex(newIndex);
            saveProgress(newIndex, false); // Silent save on navigation
        }
    };

    const handleAddToUnknown = async () => {
        try {
            const userStr = await Storage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!user || !user.id) {
                alert('Please login to add words to your list');
                return;
            }

            const currentWord = words[currentIndex];
            await axios.post('/api/user/unknown', {
                userId: user.id,
                wordId: currentWord.id
            });

            alert('✓ Added to Unknown Words list!');
        } catch (error) {
            console.error('Failed to add to unknown words:', error);
            if (error.response?.data?.message === 'Word already in unknown list') {
                alert('This word is already in your Unknown Words list');
            } else {
                alert('Failed to add word. Please try again.');
            }
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;
    if (words.length === 0) return <div className="flex items-center justify-center h-full">No words found.</div>;

    return (
        <div className="h-full flex flex-col items-center relative">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-8">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Menu
                </button>
                <div className="flex items-center gap-4">
                    {progressSaved && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-green-400 bg-green-500/20 px-3 py-1 rounded-full flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            İlerleme kaydedildi!
                        </motion.div>
                    )}
                    <div className="text-sm font-medium bg-white/10 px-4 py-1 rounded-full">
                        {currentIndex + 1} / {user?.isPro ? words.length : Math.min(FREE_LIMIT, words.length)}
                        {!user?.isPro && currentIndex >= FREE_LIMIT - 10 && (
                            <span className="ml-2 text-yellow-400">({FREE_LIMIT - currentIndex - 1} kaldı)</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Card Container */}
            <div className="flex-1 flex items-center justify-center w-full max-w-2xl relative">
                <AnimatePresence mode='wait' custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * -50 }}
                        transition={{ duration: 0.3 }}
                        className="w-full flex justify-center"
                    >
                        <Flashcard word={words[currentIndex]} key={words[currentIndex].id} />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="w-full max-w-2xl flex justify-between items-center mt-8 mb-4 gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAddToUnknown}
                        className="flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors px-4 py-2 rounded-lg hover:bg-rose-500/10"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add to Unknown</span>
                    </button>

                    <button
                        onClick={handleSaveProgress}
                        disabled={savingProgress || !user}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors px-4 py-2 rounded-lg hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!user ? 'Giriş yapmanız gerekiyor' : 'Kaldığın yeri kaydet'}
                    >
                        <Save className={`w-5 h-5 ${savingProgress ? 'animate-spin' : ''}`} />
                        <span>{savingProgress ? 'Kaydediliyor...' : 'Kaldığın Yeri Kaydet'}</span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === words.length - 1}
                        className="btn-primary !px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Next</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Pro Modal */}
            <ProModal
                isOpen={showProModal}
                onClose={() => setShowProModal(false)}
                feature={`${FREE_LIMIT}. karttan sonraki kelimeler Pro üyelere özeldir`}
            />
        </div>
    );
}
