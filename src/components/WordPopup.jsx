import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';

export default function WordPopup({ word, position, onClose, onAdd }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 w-64 bg-slate-800 border border-white/10 rounded-xl shadow-2xl p-4"
            style={{
                left: Math.min(position.x, window.innerWidth - 270), // Prevent overflow right
                top: position.y + 20
            }}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white">{word.term}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <p className="text-secondary font-medium mb-2">{word.definition_tr}</p>

            <div className="space-y-2 text-sm text-gray-300">
                {word.synonyms && (
                    <div>
                        <span className="text-gray-500 text-xs uppercase">Synonyms:</span>
                        <p>{word.synonyms}</p>
                    </div>
                )}
            </div>

            <button
                onClick={() => onAdd(word)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
            >
                <Plus className="w-4 h-4" />
                Add to My List
            </button>
        </motion.div>
    );
}
