import express from 'express';
import db from '../db.js';

const router = express.Router();

// Helper function to shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Helper function to generate wrong options
function generateWrongOptions(correctWord, allWords, count = 3) {
    const wrongOptions = allWords
        .filter(w => w.id !== correctWord.id && w.type === correctWord.type)
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
    return wrongOptions;
}

// Generate quiz from user's unknown words
router.post('/generate', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Get user's unknown words and deduplicate by word_id
        const rawUnknownWords = db.data.unknown_words?.filter(w => w.user_id === userId) || [];
        const uniqueMap = new Map();
        rawUnknownWords.forEach(item => {
            if (!uniqueMap.has(String(item.word_id))) {
                uniqueMap.set(String(item.word_id), item);
            }
        });
        const unknownWords = Array.from(uniqueMap.values());

        if (unknownWords.length < 10) {
            return res.status(400).json({
                error: 'You need at least 10 unknown words to generate a quiz',
                currentCount: unknownWords.length
            });
        }

        // Get all words for generating wrong options
        const allWords = db.data.words || [];

        // Determine number of questions (10-20 based on available words)
        const numQuestions = Math.min(20, unknownWords.length);

        // Shuffle and select words for quiz
        const selectedWords = shuffleArray(unknownWords).slice(0, numQuestions);

        // Generate questions
        const questions = selectedWords.map((word, index) => {
            const questionType = Math.random() < 0.7 ? 'multiple_choice' : 'fill_blank';

            if (questionType === 'multiple_choice') {
                // Multiple choice: Show word, select correct meaning
                const wrongOptions = generateWrongOptions(word, allWords);
                const options = shuffleArray([
                    { id: word.id, text: word.definition_tr, isCorrect: true },
                    ...wrongOptions.map(w => ({ id: w.id, text: w.definition_tr, isCorrect: false }))
                ]);

                return {
                    id: index + 1,
                    type: 'multiple_choice',
                    wordId: word.id,
                    question: `What does "${word.term}" mean?`,
                    word: word.term,
                    options: options,
                    correctAnswer: word.id,
                    explanation: word.examples || `${word.term} means ${word.definition_tr}`
                };
            } else {
                // Fill in the blank: Show sentence, select correct word
                const sentence = word.examples || `This is an example sentence with _____.`;
                const blankSentence = sentence.replace(new RegExp(word.term, 'gi'), '_____');

                const wrongOptions = generateWrongOptions(word, allWords);
                const options = shuffleArray([
                    { id: word.id, text: word.term, isCorrect: true },
                    ...wrongOptions.map(w => ({ id: w.id, text: w.term, isCorrect: false }))
                ]);

                return {
                    id: index + 1,
                    type: 'fill_blank',
                    wordId: word.id,
                    question: `Fill in the blank:`,
                    sentence: blankSentence,
                    options: options,
                    correctAnswer: word.id,
                    explanation: `The correct word is "${word.term}" which means ${word.definition_tr}`
                };
            }
        });

        // Create quiz object
        const quiz = {
            id: Date.now(),
            userId: userId,
            questions: questions,
            createdAt: new Date().toISOString()
        };

        res.json(quiz);
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

// Submit quiz and get results
router.post('/submit', async (req, res) => {
    try {
        const { userId, quizId, answers } = req.body;

        if (!userId || !quizId || !answers) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Calculate score
        let correctCount = 0;
        const results = answers.map(answer => {
            const isCorrect = answer.selectedAnswer === answer.correctAnswer;
            if (isCorrect) correctCount++;

            return {
                questionId: answer.questionId,
                wordId: answer.wordId,
                selectedAnswer: answer.selectedAnswer,
                correctAnswer: answer.correctAnswer,
                isCorrect: isCorrect
            };
        });

        const score = {
            correct: correctCount,
            total: answers.length,
            percentage: Math.round((correctCount / answers.length) * 100)
        };

        // Save quiz result to history
        if (!db.data.quiz_history) {
            db.data.quiz_history = [];
        }

        const quizResult = {
            id: Date.now(),
            userId: userId,
            quizId: quizId,
            score: score,
            results: results,
            completedAt: new Date().toISOString()
        };

        db.data.quiz_history.push(quizResult);
        await db.write();

        res.json({
            success: true,
            score: score,
            results: results,
            resultId: quizResult.id
        });
    } catch (error) {
        console.error('Quiz submission error:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

// Get quiz history for user
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const history = db.data.quiz_history?.filter(q => q.userId === parseInt(userId)) || [];

        // Sort by most recent first
        history.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        res.json(history);
    } catch (error) {
        console.error('Quiz history error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz history' });
    }
});

// Get specific quiz result
router.get('/result/:resultId', async (req, res) => {
    try {
        const { resultId } = req.params;
        const result = db.data.quiz_history?.find(q => q.id === parseInt(resultId));

        if (!result) {
            return res.status(404).json({ error: 'Quiz result not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Quiz result error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz result' });
    }
});

export default router;
