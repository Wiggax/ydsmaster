import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Storage } from '../utils/storage';

export default function PracticeExams() {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selected, setSelected] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        generateQuestions();
    }, []);

    const generateQuestions = async () => {
        setLoading(true);
        try {
            const token = await Storage.getItem('token');
            const res = await axios.get('/api/content/words/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const words = res.data;

            // Generate 20 YDS-style questions
            const generatedQuestions = [];
            for (let i = 0; i < 20; i++) {
                const target = words[Math.floor(Math.random() * words.length)];

                // Create YDS-style academic sentence
                const sentences = [
                    `The researchers ${target.term} that the hypothesis required further investigation.`,
                    `Recent studies have ${target.term} significant changes in the observed patterns.`,
                    `The ${target.term} nature of the phenomenon suggests a complex underlying mechanism.`,
                    `Scientists continue to ${target.term} the implications of these findings.`,
                    `The data ${target.term} a strong correlation between the two variables.`,
                    `This ${target.term} approach has revolutionized our understanding of the subject.`,
                    `Experts ${target.term} that additional research is necessary to confirm the results.`,
                    `The ${target.term} evidence supports the proposed theoretical framework.`
                ];

                const sentence = sentences[Math.floor(Math.random() * sentences.length)]
                    .replace(target.term, '_______');

                // Generate distractors
                const distractors = words
                    .filter(w => w.id !== target.id && w.type === target.type)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3);

                const options = [target, ...distractors]
                    .sort(() => Math.random() - 0.5)
                    .map(w => ({ id: w.id, term: w.term }));

                generatedQuestions.push({
                    id: i + 1,
                    sentence,
                    correctAnswer: target.id,
                    options
                });
            }

            setQuestions(generatedQuestions);
            setLoading(false);
        } catch (error) {
            console.error('Failed to generate questions', error);
            setLoading(false);
        }
    };

    const handleOptionClick = (optionId) => {
        if (selected) return;
        setSelected(optionId);
        const correct = optionId === questions[currentQuestion].correctAnswer;
        setIsCorrect(correct);
        if (correct) {
            setScore(score + 5);
        }
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelected(null);
            setIsCorrect(null);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setSelected(null);
            setIsCorrect(null);
        }
    };

    const handleRestart = () => {
        setCurrentQuestion(0);
        setSelected(null);
        setIsCorrect(null);
        setScore(0);
        generateQuestions();
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full">Generating YDS Practice Questions...</div>;
    }

    if (questions.length === 0) {
        return <div className="flex items-center justify-center h-full">No questions available</div>;
    }

    const question = questions[currentQuestion];
    const isLastQuestion = currentQuestion === questions.length - 1;

    return (
        <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto">
            <div className="w-full flex justify-between mb-8 absolute top-6 left-6 right-6">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400">
                        Question {currentQuestion + 1} / {questions.length}
                    </div>
                    <div className="bg-white/10 px-4 py-1 rounded-full">
                        <span className="font-bold text-yellow-400">Score: {score}</span>
                    </div>
                </div>
            </div>

            <div className="w-full glass-panel p-8 mb-8 text-center">
                <h2 className="text-2xl font-medium leading-relaxed">
                    {question.sentence}
                </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mb-8">
                {question.options.map((option) => {
                    let statusClass = 'bg-white/5 hover:bg-white/10';
                    if (selected) {
                        if (option.id === question.correctAnswer) {
                            statusClass = 'bg-green-500 text-white';
                        } else if (option.id === selected) {
                            statusClass = 'bg-red-500 text-white';
                        } else {
                            statusClass = 'bg-white/5 opacity-50';
                        }
                    }

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleOptionClick(option.id)}
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
                    className="flex flex-col items-center"
                >
                    <div className={`flex items-center gap-2 mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                        <span className="font-bold text-lg">{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                    </div>
                    <div className="flex gap-3">
                        {currentQuestion > 0 && (
                            <button onClick={handlePrevious} className="btn-secondary flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5" />
                                Previous
                            </button>
                        )}
                        {isLastQuestion ? (
                            <button onClick={handleRestart} className="btn-primary">
                                Restart Exam
                            </button>
                        ) : (
                            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                                Next Question
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
