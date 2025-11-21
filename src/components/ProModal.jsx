import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProModal({ isOpen, onClose, feature }) {
    const navigate = useNavigate();

    const features = [
        'Sınırsız kelime kartları',
        'Sınırsız kelime eşleştirme',
        'Sınırsız kelime testi',
        'Tüm akademik kitaplara erişim',
        'Reklamsız deneyim',
        'Öncelikli destek'
    ];

    const handleUpgrade = () => {
        navigate('/pro');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-panel p-8 rounded-3xl border border-yellow-500/30 max-w-md w-full relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Crown Icon */}
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl">
                                    <Crown className="w-12 h-12 text-white" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-center mb-2">
                                Pro'ya Yükselt
                            </h2>
                            <p className="text-gray-400 text-center mb-6">
                                {feature || 'Bu özelliği kullanmak için Pro üyeliğe ihtiyacınız var'}
                            </p>

                            {/* Features List */}
                            <div className="space-y-3 mb-6">
                                {features.map((feat, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="p-1 bg-green-500/20 rounded-full">
                                            <Check className="w-4 h-4 text-green-500" />
                                        </div>
                                        <span className="text-sm text-gray-300">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Price */}
                            <div className="text-center mb-6">
                                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                    29.99₺
                                </div>
                                <p className="text-gray-400 text-sm mt-1">Aylık Abonelik</p>
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={handleUpgrade}
                                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/30"
                            >
                                Pro'ya Geç
                            </button>

                            {/* Later Button */}
                            <button
                                onClick={onClose}
                                className="w-full mt-3 py-3 text-gray-400 hover:text-white transition-colors text-sm"
                            >
                                Daha Sonra
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
