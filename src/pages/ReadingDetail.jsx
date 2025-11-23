import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, BookmarkPlus, X } from 'lucide-react';
import { Storage } from '../utils/storage';

export default function ReadingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [wordPopup, setWordPopup] = useState(null);
    const [savingProgress, setSavingProgress] = useState(false);

    useEffect(() => {
        fetchBook();
    }, [id]);

    const fetchBook = async () => {
        try {
            const token = await Storage.getItem('token');
            const [bookRes, progressRes] = await Promise.all([
                axios.get(`/api/books/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`/api/books/${id}/progress`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setBook(bookRes.data);
            setCurrentPage(progressRes.data.pageNumber || 1);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch book', error);
            if (error.response?.status === 403) {
                alert('Pro subscription required to access this book');
                navigate('/reading');
            }
            setLoading(false);
        }
    };

    const saveProgress = async (pageNum) => {
        setSavingProgress(true);
        try {
            const token = await Storage.getItem('token');
            await axios.post(`/api/books/${id}/progress`,
                { pageNumber: pageNum },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Failed to save progress', error);
        } finally {
            setSavingProgress(false);
        }
    };

    const handlePageChange = async (newPage) => {
        if (newPage >= 1 && newPage <= book.totalPages) {
            setCurrentPage(newPage);
            saveProgress(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleWordClick = async (word) => {
        // Clean the word (remove punctuation)
        const cleanWord = word.toLowerCase().replace(/[.,!?;:()"']/g, '').trim();

        try {
            const token = await Storage.getItem('token');
            // Search for the word in our vocabulary
            const res = await axios.get('/api/content/words/all', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // FIXED: Only use exact match to prevent "do" matching in "methodology"
            const foundWord = res.data.find(w =>
                w.term.toLowerCase() === cleanWord
            );

            if (foundWord) {
                setWordPopup({
                    word: foundWord.term,
                    translation: foundWord.definition_tr,
                    type: foundWord.type,
                    synonyms: foundWord.synonyms,
                    example: foundWord.examples
                });
            } else {
                setWordPopup({
                    word: cleanWord,
                    translation: 'Translation not found in vocabulary',
                    type: 'unknown'
                });
            }
        } catch (error) {
            console.error('Failed to fetch word', error);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading book...</div>;
    }

    if (!book) {
        return <div className="flex items-center justify-center h-full">Book not found</div>;
    }

    const currentPageData = book.pages.find(p => p.pageNumber === currentPage);

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate('/reading')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Library
                </button>
                <div className="text-sm text-gray-400">
                    {savingProgress ? 'Saving...' : `Page ${currentPage} of ${book.totalPages}`}
                </div>
            </div>

            {/* Book Title with Cover */}
            <div className="mb-6 flex items-start gap-4">
                {/* Book Cover */}
                <div
                    className="w-24 h-32 rounded-lg flex items-center justify-center text-5xl shadow-xl flex-shrink-0"
                    style={{ background: book.coverColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                    {book.coverIcon || '📚'}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
                    <p className="text-gray-400 text-sm">{book.description}</p>
                </div>
            </div>

            {/* Page Content - WITH SCROLL */}
            <div className="glass-panel p-8 rounded-2xl flex-1 mb-6 relative overflow-y-auto max-h-[600px] custom-scrollbar">
                <div
                    className="prose prose-invert max-w-none leading-relaxed text-justify"
                    style={{ fontSize: '16px', lineHeight: '1.8' }}
                >
                    {currentPageData?.content.split(' ').map((word, index) => (
                        <span
                            key={index}
                            onClick={() => handleWordClick(word)}
                            className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors rounded px-0.5"
                        >
                            {word}{' '}
                        </span>
                    ))}
                </div>

                {/* Page Number Indicator */}
                <div className="absolute bottom-4 right-4 text-gray-500 text-sm">
                    Page {currentPage}
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                </button>

                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="1"
                        max={book.totalPages}
                        value={currentPage}
                        onChange={(e) => {
                            const page = parseInt(e.target.value);
                            if (page >= 1 && page <= book.totalPages) {
                                handlePageChange(page);
                            }
                        }}
                        className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-center focus:outline-none focus:border-primary"
                    />
                    <span className="text-gray-400">/ {book.totalPages}</span>
                </div>

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === book.totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Word Popup */}
            <AnimatePresence>
                {wordPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setWordPopup(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-panel p-6 rounded-2xl border border-white/10 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-primary">{wordPopup.word}</h3>
                                    {wordPopup.type !== 'unknown' && (
                                        <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded mt-1 inline-block">
                                            {wordPopup.type}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setWordPopup(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Turkish Translation:</p>
                                    <p className="text-white">{wordPopup.translation}</p>
                                </div>

                                {wordPopup.synonyms && (
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Synonyms:</p>
                                        <p className="text-white text-sm">{wordPopup.synonyms}</p>
                                    </div>
                                )}

                                {wordPopup.example && (
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Example:</p>
                                        <p className="text-white text-sm italic">{wordPopup.example}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
