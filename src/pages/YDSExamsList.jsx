import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, FileText, CheckCircle, Crown, Lock } from 'lucide-react';

export default function YDSExamsList() {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [examsRes, resultsRes] = await Promise.all([
                axios.get('/api/yds-exams', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('/api/yds-exams/results/my', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setExams(examsRes.data);
            setResults(resultsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch exams', error);
            setLoading(false);
        }
    };

    const getExamResult = (examId) => {
        return results.find(r => r.examId === examId);
    };

    if (loading) return <div className="flex items-center justify-center h-full">Loading exams...</div>;

    return (
        <div className="h-full flex flex-col overflow-y-auto p-6">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">YDS Practice Exams</h1>
                    <p className="text-sm text-gray-400">50 Complete Practice Exams - 80 Questions Each</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 pb-6">
                {exams.map((exam) => {
                    const result = getExamResult(exam.id);
                    const isCompleted = !!result;
                    const isLocked = exam.isPro && !user?.isPro;

                    return (
                        <Link
                            to={!isLocked ? `/yds-exams/${exam.id}` : '#'}
                            key={exam.id}
                            className={isLocked ? 'pointer-events-none' : ''}
                        >
                            <motion.div
                                whileHover={!isLocked ? { scale: 1.01 } : {}}
                                className={`glass-panel p-5 flex items-center justify-between ${isCompleted ? 'border-l-4 border-green-500' : 'border-l-4 border-transparent'
                                    } ${isLocked ? 'opacity-60' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/20 rounded-lg text-primary">
                                        <FileText className="w-6 h-6" />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">Exam-{exam.id}</h3>
                                            {exam.isPro && (
                                                <Crown className="w-4 h-4 text-yellow-400" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{exam.duration} minutes</span>
                                            </div>
                                            <span>•</span>
                                            <span>{exam.totalQuestions} Questions</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {isCompleted && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <div className="text-right">
                                                <p className="text-sm text-gray-400">Score</p>
                                                <p className="text-lg font-bold text-green-400">
                                                    {result.score}/{exam.totalQuestions}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {isLocked ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg">
                                            <Lock className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-400">Pro Only</span>
                                        </div>
                                    ) : (
                                        <button className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors">
                                            {isCompleted ? 'Review' : 'Start Exam'}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>

            {exams.length === 0 && (
                <div className="text-center text-gray-400 mt-10">
                    No exams available. Please generate exams first.
                </div>
            )}
        </div>
    );
}
