import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function YDSExamDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
        fetchExam();
    }, [id]);

    useEffect(() => {
        if (timerActive && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && timerActive) {
            handleSubmit();
        }
    }, [timeLeft, timerActive]);

    const fetchExam = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/yds-exams/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExam(res.data);
            setTimeLeft(res.data.duration * 60); // Convert to seconds
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch exam', error);
            setLoading(false);
        }
    };

    const startExam = () => {
        setTimerActive(true);
    };

    const handleAnswer = (questionId, answerIndex) => {
        setAnswers({ ...answers, [questionId]: answerIndex });
    };

    const handleSubmit = async () => {
        setTimerActive(false);

        // Calculate score
        let correctCount = 0;
        let totalQuestions = 0;

        exam.sections.forEach(section => {
            if (section.questions) {
                section.questions.forEach(q => {
                    totalQuestions++;
                    if (answers[q.id] === q.correctAnswer) {
                        correctCount++;
                    }
                });
            } else if (section.passages) {
                section.passages.forEach(passage => {
                    passage.questions.forEach(q => {
                        totalQuestions++;
                        if (answers[q.id] === q.correctAnswer) {
                            correctCount++;
                        }
                    });
                });
            }
        });

        setScore(correctCount);
        setShowResults(true);

        // Save result
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/yds-exams/${id}/result`, {
                answers,
                score: correctCount,
                timeSpent: (exam.duration * 60) - timeLeft
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Failed to save result', error);
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getThemeStyles = (color) => {
        const styles = {
            blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/5', text: 'text-blue-400', hover: 'hover:bg-blue-500/20', active: 'bg-blue-600' },
            indigo: { border: 'border-indigo-500/30', bg: 'bg-indigo-500/5', text: 'text-indigo-400', hover: 'hover:bg-indigo-500/20', active: 'bg-indigo-600' },
            violet: { border: 'border-violet-500/30', bg: 'bg-violet-500/5', text: 'text-violet-400', hover: 'hover:bg-violet-500/20', active: 'bg-violet-600' },
            fuchsia: { border: 'border-fuchsia-500/30', bg: 'bg-fuchsia-500/5', text: 'text-fuchsia-400', hover: 'hover:bg-fuchsia-500/20', active: 'bg-fuchsia-600' },
            pink: { border: 'border-pink-500/30', bg: 'bg-pink-500/5', text: 'text-pink-400', hover: 'hover:bg-pink-500/20', active: 'bg-pink-600' },
            rose: { border: 'border-rose-500/30', bg: 'bg-rose-500/5', text: 'text-rose-400', hover: 'hover:bg-rose-500/20', active: 'bg-rose-600' },
            orange: { border: 'border-orange-500/30', bg: 'bg-orange-500/5', text: 'text-orange-400', hover: 'hover:bg-orange-500/20', active: 'bg-orange-600' },
            amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-400', hover: 'hover:bg-amber-500/20', active: 'bg-amber-600' },
            yellow: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', text: 'text-yellow-400', hover: 'hover:bg-yellow-500/20', active: 'bg-yellow-600' },
            red: { border: 'border-red-500/30', bg: 'bg-red-500/5', text: 'text-red-400', hover: 'hover:bg-red-500/20', active: 'bg-red-600' },
        };
        return styles[color] || styles.blue;
    };

    if (loading) return <div className="flex items-center justify-center h-full">Loading exam...</div>;
    if (!exam) return <div className="flex items-center justify-center h-full">Exam not found</div>;

    if (!timerActive && !showResults) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6">
                <div className="glass-panel p-8 max-w-2xl text-center">
                    <h1 className="text-3xl font-bold mb-4">{exam.title}</h1>
                    <div className="space-y-3 text-gray-300 mb-8">
                        <p className="flex items-center justify-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span>Duration: {exam.duration} minutes</span>
                        </p>
                        <p>Total Questions: {exam.totalQuestions}</p>
                        <div className="text-left bg-white/5 p-4 rounded-lg mt-4 max-h-60 overflow-y-auto custom-scrollbar">
                            <p className="font-semibold mb-2">Exam Structure:</p>
                            <ul className="text-sm space-y-2">
                                {exam.sections.map((section, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${getThemeStyles(section.themeColor).bg.replace('/5', '')}`}></span>
                                        {section.title}: {section.questions?.length || section.passages?.reduce((acc, p) => acc + p.questions.length, 0)} questions
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <button onClick={startExam} className="btn-primary px-8 py-3 text-lg">
                        Start Exam
                    </button>
                </div>
            </div>
        );
    }

    if (showResults) {
        const percentage = ((score / exam.totalQuestions) * 100).toFixed(1);
        return (
            <div className="h-full flex flex-col items-center justify-center p-6">
                <div className="glass-panel p-8 max-w-2xl text-center">
                    <h1 className="text-3xl font-bold mb-6">Exam Results</h1>
                    <div className="text-6xl font-bold text-primary mb-4">{percentage}%</div>
                    <p className="text-2xl mb-8">
                        {score} / {exam.totalQuestions} Correct
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => navigate('/yds-exams')} className="btn-secondary">
                            Back to Exams
                        </button>
                        <button onClick={() => window.location.reload()} className="btn-primary">
                            Retake Exam
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-y-auto p-6">
            {/* Header with Timer */}
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg z-10 border-b border-white/10">
                <button onClick={() => navigate('/yds-exams')} className="flex items-center gap-2 text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                    Exit
                </button>
                <div className="flex items-center gap-2 text-xl font-bold">
                    <Clock className="w-6 h-6" />
                    <span className={timeLeft < 300 ? 'text-red-400' : ''}>{formatTime(timeLeft)}</span>
                </div>
                <button onClick={handleSubmit} className="btn-primary">
                    Submit Exam
                </button>
            </div>

            {/* Questions */}
            <div className="space-y-8 pb-6">
                {exam.sections.map((section, sectionIdx) => {
                    const theme = getThemeStyles(section.themeColor);
                    return (
                        <div key={sectionIdx} className={`glass-panel p-6 border ${theme.border} ${theme.bg}`}>
                            <h2 className={`text-xl font-bold mb-6 ${theme.text} border-b ${theme.border} pb-4`}>
                                {section.title}
                            </h2>

                            {section.questions && section.questions.map((question, qIdx) => (
                                <div key={question.id} className={`mb-6 pb-6 border-b ${theme.border} last:border-0`}>
                                    <p className="font-semibold mb-3 text-lg">
                                        {sectionIdx + 1}.{qIdx + 1}. {question.question}
                                    </p>
                                    <div className="grid gap-2">
                                        {question.options.map((option, optIdx) => (
                                            <button
                                                key={optIdx}
                                                onClick={() => handleAnswer(question.id, optIdx)}
                                                className={`text-left p-3 rounded-lg transition-all ${answers[question.id] === optIdx
                                                    ? `${theme.active} text-white shadow-lg`
                                                    : `bg-black/20 hover:bg-black/40 ${theme.hover}`
                                                    }`}
                                            >
                                                <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span> {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {section.passages && section.passages.map((passage, pIdx) => (
                                <div key={pIdx} className="mb-8 last:mb-0">
                                    <div className={`p-6 rounded-lg mb-6 bg-black/20 border ${theme.border}`}>
                                        <p className="text-lg leading-relaxed font-serif text-gray-200">{passage.text}</p>
                                    </div>
                                    {passage.questions.map((question, qIdx) => (
                                        <div key={question.id} className={`mb-6 pb-6 border-b ${theme.border} last:border-0 last:pb-0`}>
                                            <p className="font-semibold mb-3 text-lg">
                                                {pIdx * 4 + qIdx + 1}. {question.question}
                                            </p>
                                            <div className="grid gap-2">
                                                {question.options.map((option, optIdx) => (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => handleAnswer(question.id, optIdx)}
                                                        className={`text-left p-3 rounded-lg transition-all ${answers[question.id] === optIdx
                                                            ? `${theme.active} text-white shadow-lg`
                                                            : `bg-black/20 hover:bg-black/40 ${theme.hover}`
                                                            }`}
                                                    >
                                                        <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span> {option}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
