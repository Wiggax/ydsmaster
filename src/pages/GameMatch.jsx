import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import ProModal from '../components/ProModal';
import { Storage } from '../utils/storage';

export default function GameMatch() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [allWords, setAllWords] = useState([]);
    const [currentSet, setCurrentSet] = useState(0);
    const [leftCards, setLeftCards] = useState([]);
    const [rightCards, setRightCards] = useState([]);
    const [selectedLeft, setSelectedLeft] = useState(null);
    const [selectedRight, setSelectedRight] = useState(null);
    const [matched, setMatched] = useState([]);
    const [wrongPair, setWrongPair] = useState(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [showProModal, setShowProModal] = useState(false);
    const WORDS_PER_SET = 6;
    const FREE_SET_LIMIT = 20;

    useEffect(() => {
        loadWords();
    }, []);

    useEffect(() => {
        if (allWords.length > 0) {
            loadProgress();
        }
    }, [allWords]);

    const loadWords = async () => {
        setLoading(true);
        try {
            const token = await Storage.getItem('token');
            const res = await axios.get('/api/content/words/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllWords(res.data);
        } catch (error) {
            console.error('Failed to load words', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProgress = async () => {
        try {
            const token = await Storage.getItem('token');
            const res = await axios.get('/api/user/progress', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const matchProgress = res.data
                .filter(p => p.contentType === 'word_match')
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

            if (matchProgress && matchProgress.metadata?.currentSet !== undefined) {
                setCurrentSet(matchProgress.metadata.currentSet);
                // Do not set score from progress, as we want to start fresh for the set?
                // Actually, if we are resuming a set, we might want the score?
                // But GameMatch resets score on startGame.
                // So we only use currentSet to know where we left off.
                startGame(matchProgress.metadata.currentSet);
            } else {
                startGame(0);
            }
        } catch (error) {
            console.error('Failed to load progress', error);
            startGame(0);
        }
    };

    const saveProgress = async (setNumber, currentScore) => {
        try {
            const token = await Storage.getItem('token');
            await axios.post('/api/user/progress', {
                contentType: 'word_match',
                contentId: `match_game_${setNumber}`,
                metadata: {
                    currentSet: setNumber,
                    score: currentScore
                },
                currentIndex: setNumber
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Failed to save progress', error);
        }
    };

    const startGame = async (setNumber = currentSet) => {
        // Check Pro limit
        if (!user?.isPro && setNumber >= FREE_SET_LIMIT) {
            setShowProModal(true);
            return;
        }

        setGameOver(false);
        setScore(0);
        setMatched([]);
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPair(null);

        const startIndex = setNumber * WORDS_PER_SET;
        const endIndex = Math.min(startIndex + WORDS_PER_SET, allWords.length);
        const words = allWords.slice(startIndex, endIndex);

        if (words.length === 0) {
            setLeftCards([]);
            setRightCards([]);
            return;
        }

        // Left side: English terms (shuffled)
        const left = words.map(w => ({ id: w.id, content: w.term, pairId: w.id }));
        left.sort(() => Math.random() - 0.5);

        // Right side: Turkish definitions (shuffled)
        const right = words.map(w => ({ id: w.id + '_def', content: w.definition_tr, pairId: w.id }));
        right.sort(() => Math.random() - 0.5);

        setLeftCards(left);
        setRightCards(right);
    };

    const handleCardClick = async (card, side) => {
        // Ignore if already matched
        if (matched.includes(card.pairId)) return;

        if (side === 'left') {
            setSelectedLeft(card);
            // Check if we have both selections
            if (selectedRight) {
                checkMatch(card, selectedRight);
            }
        } else {
            setSelectedRight(card);
            // Check if we have both selections
            if (selectedLeft) {
                checkMatch(selectedLeft, card);
            }
        }
    };

    const checkMatch = async (leftCard, rightCard) => {
        if (leftCard.pairId === rightCard.pairId) {
            // Correct match! Show green first
            setWrongPair({ left: leftCard.id, right: rightCard.id, correct: true });

            setTimeout(() => {
                setMatched([...matched, leftCard.pairId]);
                setScore(prev => {
                    const newScore = prev + 10;
                    saveProgress(currentSet, newScore);
                    return newScore;
                });
                setSelectedLeft(null);
                setSelectedRight(null);
                setWrongPair(null);

                // Check if game is complete
                if (matched.length + 1 === leftCards.length) {
                    setTimeout(() => setGameOver(true), 500);
                }
            }, 800);
        } else {
            // Wrong match - show red and shake
            setWrongPair({ left: leftCard.id, right: rightCard.id, correct: false });
            setTimeout(() => {
                setWrongPair(null);
                setSelectedLeft(null);
                setSelectedRight(null);
            }, 1000);
        }
    };

    const handleNextSet = async () => {
        const maxSets = Math.ceil(allWords.length / WORDS_PER_SET);
        if (currentSet < maxSets - 1) {
            const newSet = currentSet + 1;

            // Check Pro limit
            if (!user?.isPro && newSet >= FREE_SET_LIMIT) {
                setShowProModal(true);
                return;
            }

            setCurrentSet(newSet);
            saveProgress(newSet, 0); // Reset score for new set
            startGame(newSet);
        }
    };

    const handlePreviousSet = async () => {
        if (currentSet > 0) {
            const newSet = currentSet - 1;
            setCurrentSet(newSet);
            saveProgress(newSet, 0); // Reset score for new set
            startGame(newSet);
        }
    };

    const handleRestart = async () => {
        startGame(currentSet);
    };

    if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

    const maxSets = Math.ceil(allWords.length / WORDS_PER_SET);
    const effectiveMaxSets = user?.isPro ? maxSets : Math.min(FREE_SET_LIMIT, maxSets);

    return (
        <div className="h-full flex flex-col items-center overflow-y-auto p-6">
            <div className="w-full flex justify-between items-center mb-8">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                    Quit
                </button>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400">
                        Set {currentSet + 1} of {effectiveMaxSets}
                        {!user?.isPro && currentSet >= FREE_SET_LIMIT - 3 && (
                            <span className="ml-2 text-yellow-400">({FREE_SET_LIMIT - currentSet} kaldı)</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="font-bold text-yellow-400">{score}</span>
                    </div>
                    <button onClick={handleRestart} className="p-2 hover:bg-white/10 rounded-full">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {gameOver ? (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full"
                >
                    <Trophy className="w-20 h-20 text-yellow-400 mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Set Complete!</h2>
                    <p className="text-gray-400 mb-8">Final Score: {score}</p>
                    <div className="flex gap-4">
                        {currentSet > 0 && (
                            <button onClick={handlePreviousSet} className="btn-secondary flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5" />
                                Previous Set
                            </button>
                        )}
                        <button onClick={handleRestart} className="btn-primary">Play Again</button>
                        {currentSet < effectiveMaxSets - 1 && (
                            <button onClick={handleNextSet} className="btn-primary flex items-center gap-2">
                                Next Set
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </motion.div>
            ) : (
                <>
                    {leftCards.length === 0 ? (
                        <div className="text-center text-gray-400">
                            No more words available in this set.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
                            {/* Left Column - English */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-center text-gray-400 font-semibold mb-2">English</h3>
                                <AnimatePresence>
                                    {leftCards.map((card) => {
                                        const isMatched = matched.includes(card.pairId);
                                        const isSelected = selectedLeft?.id === card.id;
                                        const isWrong = wrongPair?.left === card.id && !wrongPair?.correct;
                                        const isCorrect = wrongPair?.left === card.id && wrongPair?.correct;

                                        if (isMatched) return null;

                                        return (
                                            <motion.div
                                                key={card.id}
                                                initial={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                onClick={() => handleCardClick(card, 'left')}
                                                className={`
                                                    p-4 rounded-xl flex items-center justify-center text-center cursor-pointer
                                                    transition-all duration-300 font-medium min-h-[60px]
                                                    ${isSelected ? 'bg-primary text-white scale-105 shadow-lg shadow-primary/30' : 'bg-white/5 hover:bg-white/10'}
                                                    ${isWrong ? 'bg-red-500 !text-white animate-shake' : ''}
                                                    ${isCorrect ? 'bg-green-500 !text-white scale-105' : ''}
                                                `}
                                            >
                                                {card.content}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {/* Right Column - Turkish */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-center text-gray-400 font-semibold mb-2">Türkçe</h3>
                                <AnimatePresence>
                                    {rightCards.map((card) => {
                                        const isMatched = matched.includes(card.pairId);
                                        const isSelected = selectedRight?.id === card.id;
                                        const isWrong = wrongPair?.right === card.id && !wrongPair?.correct;
                                        const isCorrect = wrongPair?.right === card.id && wrongPair?.correct;

                                        if (isMatched) return null;

                                        return (
                                            <motion.div
                                                key={card.id}
                                                initial={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                onClick={() => handleCardClick(card, 'right')}
                                                className={`
                                                    p-4 rounded-xl flex items-center justify-center text-center cursor-pointer
                                                    transition-all duration-300 font-medium min-h-[60px]
                                                    ${isSelected ? 'bg-primary text-white scale-105 shadow-lg shadow-primary/30' : 'bg-white/5 hover:bg-white/10'}
                                                    ${isWrong ? 'bg-red-500 !text-white animate-shake' : ''}
                                                    ${isCorrect ? 'bg-green-500 !text-white scale-105' : ''}
                                                `}
                                            >
                                                {card.content}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Set Navigation */}
                    <div className="flex items-center gap-4 mt-8">
                        <button
                            onClick={handlePreviousSet}
                            disabled={currentSet === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Previous Set
                        </button>
                        <span className="text-gray-400">
                            {currentSet + 1} / {effectiveMaxSets}
                        </span>
                        <button
                            onClick={handleNextSet}
                            disabled={currentSet >= effectiveMaxSets - 1}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next Set
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </>
            )}

            {/* Pro Modal */}
            <ProModal
                isOpen={showProModal}
                onClose={() => setShowProModal(false)}
                feature={`${FREE_SET_LIMIT}. setten sonraki setler Pro üyelere özeldir`}
            />
        </div>
    );
}
