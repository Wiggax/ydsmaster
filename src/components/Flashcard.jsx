import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Flashcard({ word, onFlip }) {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (onFlip) onFlip(!isFlipped);
    };

    return (
        <div className="w-full max-w-md aspect-[4/3] perspective-1000 cursor-pointer group" onClick={handleFlip}>
            <motion.div
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front */}
                <div
                    className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden border border-white/10 bg-slate-900 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-8"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(0deg)'
                    }}
                >
                    {/* Decorative background elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />

                    <h2 className="text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 z-10">
                        {word.term}
                    </h2>
                    <p className="mt-6 text-primary/80 font-medium uppercase tracking-[0.2em] text-xs z-10">
                        {word.type}
                    </p>
                    <p className="mt-12 text-gray-500 text-xs animate-pulse z-10 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Tap to reveal
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    </p>
                </div>

                {/* Back */}
                <div
                    className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden border border-white/10 bg-slate-900 bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-8"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    {/* Decorative background elements */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50" />

                    <div className="text-center space-y-6 w-full z-10">
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-1">{word.definition_tr}</h3>
                            <div className="h-1 w-12 bg-secondary mx-auto rounded-full opacity-50"></div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Synonyms</p>
                            <p className="font-medium text-gray-200">{word.synonyms}</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Example</p>
                            <p className="italic text-gray-300 text-sm leading-relaxed">
                                "{Array.isArray(word.examples) ? word.examples[0] : word.examples}"
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
