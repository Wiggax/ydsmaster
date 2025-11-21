import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Shield, Key } from 'lucide-react';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: Security Question, 3: New Password
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('/api/auth/get-security-question', { email });
            setSecurityQuestion(res.data.securityQuestion);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Kullanıcı bulunamadı');
        } finally {
            setLoading(false);
        }
    };

    const handleSecurityAnswerSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('/api/auth/verify-security', {
                email,
                securityAnswer
            });
            setResetToken(res.data.resetToken);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Güvenlik cevabı yanlış');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        if (newPassword.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır');
            return;
        }

        setLoading(true);

        try {
            await axios.post('/api/auth/reset-password', {
                resetToken,
                newPassword
            });
            alert('✅ Şifreniz başarıyla sıfırlandı! Giriş yapabilirsiniz.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Şifre sıfırlama başarısız');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel w-full max-w-md p-8"
            >
                <div className="flex items-center gap-3 mb-8">
                    <Link to="/login" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Şifremi Unuttum</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {step === 1 && 'Email adresinizi girin'}
                            {step === 2 && 'Güvenlik sorusunu cevaplayın'}
                            {step === 3 && 'Yeni şifrenizi belirleyin'}
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-white/10 text-gray-500'
                                }`}>
                                {s}
                            </div>
                            {s < 3 && (
                                <div className={`flex-1 h-1 mx-2 rounded transition-colors ${step > s ? 'bg-primary' : 'bg-white/10'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Step 1: Email */}
                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                placeholder="Email adresiniz"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field pl-10"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {loading ? 'Kontrol ediliyor...' : 'Devam Et'}
                        </button>
                    </form>
                )}

                {/* Step 2: Security Question */}
                {step === 2 && (
                    <form onSubmit={handleSecurityAnswerSubmit} className="space-y-4">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-blue-400" />
                                <p className="text-sm font-medium text-blue-400">Güvenlik Sorusu</p>
                            </div>
                            <p className="text-sm text-gray-300">{securityQuestion}</p>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Cevabınız"
                                value={securityAnswer}
                                onChange={(e) => setSecurityAnswer(e.target.value)}
                                className="input-field pl-10"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {loading ? 'Doğrulanıyor...' : 'Doğrula'}
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                placeholder="Yeni şifre"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-field pl-10"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                placeholder="Yeni şifre (tekrar)"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field pl-10"
                                required
                                minLength={6}
                            />
                        </div>
                        <p className="text-xs text-gray-400">Şifre en az 6 karakter olmalıdır</p>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {loading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
                        </button>
                    </form>
                )}

                <p className="text-center mt-6 text-gray-400 text-sm">
                    Şifrenizi hatırladınız mı?{' '}
                    <Link to="/login" className="text-primary hover:text-accent transition-colors">
                        Giriş Yap
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
