import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, Clock, ArrowLeft, RotateCcw } from 'lucide-react';

export default function QuizResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const { quiz, result, timeElapsed } = location.state || {};

    if (!quiz || !result) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <p className="text-xl mb-4">No quiz results found</p>
                    <Link to="/unknown-words" className="text-purple-400 hover:underline">
                        Back to Unknown Words
                    </Link>
                </div>
            </div>
        );
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getGrade = (percentage) => {
        if (percentage >= 90) return { text: 'Excellent!', color: 'text-green-400', emoji: '🎉' };
        if (percentage >= 75) return { text: 'Great Job!', color: 'text-blue-400', emoji: '👏' };
        if (percentage >= 60) return { text: 'Good!', color: 'text-yellow-400', emoji: '👍' };
        return { text: 'Keep Practicing!', color: 'text-orange-400', emoji: '💪' };
    };

    const grade = getGrade(result.score.percentage);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/unknown-words" className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Quiz Results</h1>
                </div>

                {/* Score Card */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel p-8 mb-8 text-center"
                >
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                    <h2 className={`text-4xl font-bold mb-2 ${grade.color}`}>
                        {grade.emoji} {grade.text}
                    </h2>
                    <div className="text-6xl font-bold text-white mb-4">
                        {result.score.correct} / {result.score.total}
                    </div>
                    <div className="text-2xl text-gray-300 mb-4">
                        {result.score.percentage}% Correct
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Clock className="w-5 h-5" />
                        <span>Time: {formatTime(timeElapsed)}</span>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => navigate('/unknown-words/quiz')}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Take Another Quiz
                    </button>
                    <Link
                        to="/unknown-words"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Back to Unknown Words
                    </Link>
                </div>

                {/* Detailed Results */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white mb-4">Detailed Results</h3>

                    {quiz.questions.map((question, index) => {
                        const userResult = result.results.find(r => r.questionId === question.id);
                        const isCorrect = userResult?.isCorrect;
                        const selectedOption = question.options.find(o => o.id === userResult?.selectedAnswer);
                        const correctOption = question.options.find(o => o.id === question.correctAnswer);

                        return (
                            <motion.div
                                key={question.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`glass-panel p-6 border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        {isCorrect ? (
                                            <CheckCircle className="w-6 h-6 text-green-400" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-red-400" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-gray-400 font-semibold">Question {index + 1}</span>
                                            <span className={`text-sm font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {isCorrect ? 'Correct' : 'Incorrect'}
                                            </span>
                                        </div>

                                        <p className="text-white font-semibold mb-2">{question.question}</p>

                                        {question.type === 'multiple_choice' && (
                                            <p className="text-2xl font-bold text-purple-400 mb-3">{question.word}</p>
                                        )}

                                        {question.type === 'fill_blank' && (
                                            <p className="text-lg text-gray-300 mb-3 italic">"{question.sentence}"</p>
                                        )}

                                        {!isCorrect && (
                                            <div className="space-y-2 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-400 font-semibold">Your answer:</span>
                                                    <span className="text-gray-300">{selectedOption?.text || 'No answer'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-400 font-semibold">Correct answer:</span>
                                                    <span className="text-white font-semibold">{correctOption?.text}</span>
                                                </div>
                                            </div>
                                        )}

                                        {isCorrect && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-green-400 font-semibold">Your answer:</span>
                                                <span className="text-white font-semibold">{selectedOption?.text}</span>
                                            </div>
                                        )}

                                        <div className="bg-gray-800/50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-400 italic">{question.explanation}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
