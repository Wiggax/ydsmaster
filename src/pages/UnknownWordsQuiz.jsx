import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';

export default function UnknownWordsQuiz() {
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        // Start timer
        const timer = setInterval(() => {
            setTimeElapsed(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

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

    const handleSelectAnswer = (questionId, answerId) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questionId]: answerId
        });
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        // Check if all questions are answered
        const unanswered = quiz.questions.filter(q => !selectedAnswers[q.id]);
        if (unanswered.length > 0) {
            if (!confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`)) {
                return;
            }
        }

        setSubmitting(true);

        try {
            const userStr = await Storage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            // Prepare answers
            const answers = quiz.questions.map(q => ({
                questionId: q.id,
                wordId: q.wordId,
                selectedAnswer: selectedAnswers[q.id] || null,
                correctAnswer: q.correctAnswer
            }));

            const res = await axios.post('/api/quiz/submit', {
                userId: user.id,
                quizId: quiz.id,
                answers: answers
            });

            // Navigate to results page
            navigate('/unknown-words/quiz/results', {
                state: {
                    quiz: quiz,
                    result: res.data,
                    timeElapsed: timeElapsed
                }
            });
        } catch (error) {
            console.error('Failed to submit quiz:', error);
            alert('Failed to submit quiz. Please try again.');
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
                <div className="text-white text-xl">Generating your quiz...</div>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/unknown-words')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4 text-white">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span>{formatTime(timeElapsed)}</span>
                        </div>
                        <div className="text-sm">
                            Question {currentQuestion + 1} of {quiz.questions.length}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
                    <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Question Card */}
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-panel p-8 mb-6"
                >
                    <h2 className="text-2xl font-bold text-white mb-2">{question.question}</h2>

                    {question.type === 'multiple_choice' && (
                        <p className="text-3xl font-bold text-purple-400 mb-6">{question.word}</p>
                    )}

                    {question.type === 'fill_blank' && (
                        <p className="text-xl text-gray-300 mb-6 italic">"{question.sentence}"</p>
                    )}

                    {/* Options */}
                    <div className="space-y-3">
                        {question.options.map((option, index) => (
                            <button
                                key={option.id}
                                onClick={() => handleSelectAnswer(question.id, option.id)}
                                className={`w-full p-4 rounded-lg text-left transition-all ${selectedAnswers[question.id] === option.id
                                    ? 'bg-purple-600 text-white border-2 border-purple-400'
                                    : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-purple-500'
                                    }`}
                            >
                                <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                                {option.text}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                        className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>

                    <div className="text-white text-sm">
                        {Object.keys(selectedAnswers).length} / {quiz.questions.length} answered
                    </div>

                    {currentQuestion < quiz.questions.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-colors font-semibold"
                        >
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
