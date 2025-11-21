import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, Phone, HelpCircle, Shield } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        securityQuestion: '',
        securityAnswer: ''
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const securityQuestions = [
        'İlk evcil hayvanınızın adı neydi?',
        'Annenizin kızlık soyadı nedir?',
        'İlk öğretmeninizin adı neydi?',
        'Doğduğunuz şehir neresidir?',
        'En sevdiğiniz yemek nedir?',
        'İlk işyerinizin adı neydi?',
        'Çocukluk arkadaşınızın adı neydi?'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.securityQuestion || !formData.securityAnswer) {
            setError('Lütfen güvenlik sorusu ve cevabını doldurun');
            return;
        }

        const res = await register(formData);
        if (res.success) {
            navigate('/login');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel w-full max-w-md p-8"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Create Account
                    </h1>
                    <p className="text-gray-400 mt-2">Join YDS Master Pro</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            className="input-field pl-10"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field pl-10"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input-field pl-10"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input-field pl-10"
                            required
                        />
                    </div>

                    {/* Security Question Section */}
                    <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-5 h-5 text-yellow-400" />
                            <p className="text-sm text-gray-300 font-medium">Güvenlik Sorusu</p>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">
                            Şifrenizi unuttuğunuzda kullanılacaktır
                        </p>

                        <div className="relative mb-3">
                            <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                name="securityQuestion"
                                value={formData.securityQuestion}
                                onChange={handleChange}
                                className="input-field pl-10 appearance-none cursor-pointer"
                                required
                            >
                                <option value="">Bir soru seçin...</option>
                                {securityQuestions.map((q, i) => (
                                    <option key={i} value={q}>{q}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                name="securityAnswer"
                                placeholder="Cevabınız"
                                value={formData.securityAnswer}
                                onChange={handleChange}
                                className="input-field pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-start gap-3 mt-4">
                        <input
                            type="checkbox"
                            id="terms"
                            required
                            className="mt-1 w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary bg-gray-700"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-400">
                            <Link to="/user-agreement" className="text-primary hover:underline">Kullanıcı Sözleşmesi</Link>'ni,{' '}
                            <Link to="/terms-of-service" className="text-primary hover:underline">Kullanım Şartları</Link>'nı ve{' '}
                            <Link to="/privacy-policy" className="text-primary hover:underline">Gizlilik Politikası</Link>'nı okudum ve kabul ediyorum.
                        </label>
                    </div>

                    <button type="submit" className="btn-primary w-full mt-6">
                        <UserPlus className="w-5 h-5" />
                        Sign Up
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:text-accent transition-colors">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
