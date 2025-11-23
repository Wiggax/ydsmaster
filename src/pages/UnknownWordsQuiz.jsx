import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Storage } from '../utils/storage';

export default function UnknownWordsQuiz() {
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        const generateQuiz = async () => {
            try {
                const userStr = await Storage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;

                if (!user || !user.id) {
                    navigate('/login');
                    return;
                }

                const res = await axios.post('/api/quiz/generate', { userId: user.id });
                setQuiz(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to generate quiz:', error);
                alert(error.response?.data?.error || 'Failed to generate quiz. You need at least 10 unknown words.');
                navigate('/unknown-words');
            }
        };

        generateQuiz();
    }, [navigate]);

    useEffect(() => {
        if (!loading && quiz) {
            const timer = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loading, quiz]);

    const handleAnswer = async (optionId) => {
        const currentQuestion = quiz.questions[currentQuestionIndex];
        const newAnswers = [...answers, {
            questionId: currentQuestion.id,
            wordId: currentQuestion.wordId,
            selectedAnswer: optionId,
            correctAnswer: currentQuestion.correctAnswer
        }];
        setAnswers(newAnswers);

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex(prev => prev + 1);
            }, 300);
        } else {
            finishQuiz(newAnswers);
        }
    };

    const finishQuiz = async (finalAnswers) => {
        setSubmitting(true);
        try {
            const userStr = await Storage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            const res = await axios.post('/api/quiz/submit', {
                userId: user.id,
                quizId: quiz.id,
                answers: finalAnswers
            });

            navigate('/unknown-words/quiz/results', {
                state: {
                    quiz: quiz,
                    result: res.data,
                    timeElapsed: timeElapsed
                }
            });
        } catch (error) {
            console.error('Failed to submit quiz:', error);
            alert('Failed to submit quiz results. Please try again.');
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!quiz) return null;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 text-white">
                    <button onClick={() => navigate('/unknown-words')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="font-mono">{formatTime(timeElapsed)}</span>
                    </div>
                    <div className="text-sm font-medium text-purple-300">
                        {currentQuestionIndex + 1} / {quiz.questions.length}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 h-2 rounded-full mb-8 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-panel p-8 rounded-2xl border border-white/10"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">
                            {currentQuestion.question}
                        </h2>

                        {currentQuestion.type === 'multiple_choice' && (
                            <div className="text-center mb-8">
                                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                    {currentQuestion.word}
                                </span>
                            </div>
                        )}

                        {currentQuestion.type === 'fill_blank' && (
                            <div className="text-center mb-8">
                                <p className="text-xl text-gray-300 italic leading-relaxed">
                                    "{currentQuestion.sentence}"
                                </p>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {currentQuestion.options.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleAnswer(option.id)}
                                    disabled={submitting}
                                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 text-left text-white transition-all group flex items-center justify-between"
                                >
                                    <span className="font-medium text-lg">{option.text}</span>
                                    <div className="w-6 h-6 rounded-full border-2 border-white/20 group-hover:border-purple-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
