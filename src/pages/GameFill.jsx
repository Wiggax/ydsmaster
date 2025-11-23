import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, RefreshCw } from 'lucide-react';
import ProModal from '../components/ProModal';
import { useAuth } from '../context/AuthContext';
import { Storage } from '../utils/storage';

export default function GameFill() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [question, setQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [selected, setSelected] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const [showProModal, setShowProModal] = useState(false);
    const FREE_QUESTION_LIMIT = 100;

    useEffect(() => {
        loadProgress();
        nextQuestion();
    }, []);

    const loadProgress = async () => {
        try {
            const token = await Storage.getItem('token');
            const res = await axios.get('/api/user/progress', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const fillProgress = res.data.find(p => p.contentType === 'fill_game');
            if (fillProgress && fillProgress.metadata?.score !== undefined) {
                setScore(fillProgress.metadata.score);
            }
        } catch (error) {
            console.error('Failed to load progress', error);
        }
    };

    const saveProgress = async (currentScore) => {
        try {
            const token = await Storage.getItem('token');
            await axios.post('/api/user/progress', {
                contentType: 'fill_game',
                contentId: 'fill_game',
                metadata: {
                    score: currentScore
                },
                currentIndex: 0
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Failed to save progress', error);
        }
    };

    const nextQuestion = async () => {
        // Check Pro limit
        if (!user?.isPro && questionCount >= FREE_QUESTION_LIMIT) {
            setShowProModal(true);
            return;
        }

        setLoading(true);
        setSelected(null);
        setIsCorrect(null);

        try {
            const token = await Storage.getItem('token');
            const res = await axios.get('/api/content/words/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const words = res.data;

            // Pick a random target word
            const target = words[Math.floor(Math.random() * words.length)];

            // YDS-style academic sentences
            const sentenceTemplates = [
                `The researchers ${target.term} that further investigation was necessary to validate the hypothesis.`,
                `Recent studies have ${target.term} significant correlations between environmental factors and behavioral patterns.`,
                `The ${target.term} nature of the phenomenon requires comprehensive analysis from multiple perspectives.`,
                `Scientists continue to ${target.term} the underlying mechanisms that govern these complex processes.`,
                `The empirical data ${target.term} a strong relationship between the variables under examination.`,
                `This ${target.term} approach has fundamentally transformed our understanding of the subject matter.`,
                `Experts ${target.term} that additional research is essential to confirm these preliminary findings.`,
                `The ${target.term} evidence provides substantial support for the proposed theoretical framework.`,
                `Scholars ${target.term} various methodologies to examine the multifaceted aspects of this issue.`,
                `The ${target.term} implications of these findings extend beyond the immediate scope of the study.`
            ];

            const sentence = sentenceTemplates[Math.floor(Math.random() * sentenceTemplates.length)]
                .replace(target.term, '_______');

            // Generate distractors from same word type
            const distractors = words
                .filter(w => w.id !== target.id && w.type === target.type)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            const allOptions = [target, ...distractors].sort(() => Math.random() - 0.5);

            setQuestion({ sentence, target });
            setOptions(allOptions);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load question', error);
            setLoading(false);
        }
    };

    const handleOptionClick = async (option) => {
        if (selected) return;
        setSelected(option);
        const correct = option.id === question.target.id;
        setIsCorrect(correct);
        if (correct) {
            const newScore = score + 10;
            setScore(newScore);
            saveProgress(newScore);
        }
        setQuestionCount(questionCount + 1);
    };

    const handleNext = async () => {
        nextQuestion();
    };

    if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

    return (
        <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto overflow-y-auto p-6">
            <div className="w-full flex justify-start mb-8 absolute top-6 left-6">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>
                <div className="flex items-center gap-4 ml-auto">
                    <div className="text-sm text-gray-400">
                        Questions: {questionCount} / {user?.isPro ? '∞' : FREE_QUESTION_LIMIT}
                        {!user?.isPro && questionCount >= FREE_QUESTION_LIMIT - 10 && (
                            <span className="ml-2 text-yellow-400">({FREE_QUESTION_LIMIT - questionCount} kaldı)</span>
                        )}
                    </div>
                    <div className="bg-white/10 px-4 py-1 rounded-full">
                        <span className="font-bold text-yellow-400">Score: {score}</span>
                    </div>
                    <button onClick={() => {
                        setScore(0);
                        saveProgress(0);
                        setQuestionCount(0);
                        nextQuestion();
                    }} className="p-2 hover:bg-white/10 rounded-full">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="w-full glass-panel p-8 mb-8 text-center">
                <h2 className="text-2xl font-medium leading-relaxed">
                    {question.sentence}
                </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                {options.map((option) => {
                    let statusClass = 'bg-white/5 hover:bg-white/10';
                    if (selected) {
                        if (option.id === question.target.id) statusClass = 'bg-green-500 text-white';
                        else if (option.id === selected.id) statusClass = 'bg-red-500 text-white';
                        else statusClass = 'bg-white/5 opacity-50';
                    }

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleOptionClick(option)}
                            disabled={!!selected}
                            className={`p-4 rounded-xl font-semibold transition-all ${statusClass}`}
                        >
                            {option.term}
                        </button>
                    );
                })}
            </div>

            {selected && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex flex-col items-center"
                >
                    <div className={`flex items-center gap-2 mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                        <span className="font-bold text-lg">{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                    </div>
                    <div className="text-center mb-4 text-gray-300">
                        <p className="text-sm mb-1">Correct answer: <span className="font-semibold text-green-400">{question.target.term}</span></p>
                        <p className="text-xs text-gray-400">{question.target.definition_tr}</p>
                    </div>
                    <button onClick={handleNext} className="btn-primary">
                        Next Question
                    </button>
                </motion.div>
            )}

            {/* Pro Modal */}
            <ProModal
                isOpen={showProModal}
                onClose={() => setShowProModal(false)}
                feature={`${FREE_QUESTION_LIMIT}. sorudan sonraki sorular Pro üyelere özeldir`}
            />
        </div>
    );
}
