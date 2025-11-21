import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Crown, Check, ArrowLeft, Smartphone, Apple } from 'lucide-react';

export default function ProPurchase() {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [purchasing, setPurchasing] = useState(false);

    const features = [
        {
            title: 'Sınırsız Kelime Kartları',
            description: '3000+ kelimeye sınırsız erişim. Fiil, isim ve sıfat kategorilerinde tüm kartları kullan.'
        },
        {
            title: 'Sınırsız Kelime Eşleştirme',
            description: 'Tüm setlerde pratik yap. 20 set sınırı olmadan öğrenmeye devam et.'
        },
        {
            title: 'Sınırsız Kelime Testi',
            description: 'YDS tarzı akademik cümlelerle sınırsız test çöz. 100 soru sınırı kaldırıldı.'
        },
        {
            title: 'Tüm Akademik Kitaplar',
            description: '10 akademik kitaba tam erişim. Her biri 100 sayfa YDS seviyesi içerik.'
        },
        {
            title: 'Reklamsız Deneyim',
            description: 'Hiçbir reklam görmeden kesintisiz öğrenme deneyimi.'
        },
        {
            title: 'Öncelikli Destek',
            description: 'Sorularınız ve geri bildirimleriniz için öncelikli destek.'
        }
    ];

    const handlePurchase = async () => {
        setPurchasing(true);
        try {
            const token = localStorage.getItem('token');

            // Mock transaction ID for web version
            // In production app, this would come from App Store/Google Play
            const transactionId = `web_${Date.now()}_${user.id}`;

            const res = await axios.post('/api/payment/purchase-pro', {
                platform: 'web', // 'ios' or 'android' in production
                transactionId: transactionId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                // Update user context
                setUser({ ...user, isPro: true });
                alert('🎉 Pro üyeliğiniz başarıyla aktif edildi!');
                navigate('/');
            }
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Satın alma işlemi başarısız oldu. Lütfen tekrar deneyin.');
        } finally {
            setPurchasing(false);
        }
    };

    if (user?.isPro) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel p-8 rounded-3xl max-w-md text-center"
                >
                    <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl inline-block mb-4">
                        <Crown className="w-16 h-16 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Pro Üyesiniz!</h2>
                    <p className="text-gray-400 mb-6">
                        Tüm özelliklere sınırsız erişiminiz var.
                    </p>
                    <button onClick={() => navigate('/')} className="btn-primary w-full">
                        Ana Sayfaya Dön
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">Pro'ya Yükselt</h1>
                        <p className="text-gray-400 mt-1">Tüm özelliklerin kilidini aç</p>
                    </div>
                </div>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-8 rounded-3xl border border-yellow-500/30 mb-8 relative overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />

                    <div className="relative z-10 text-center">
                        <div className="inline-block p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl mb-4">
                            <Crown className="w-16 h-16 text-white" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4">YDS Master Pro</h2>
                        <div className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                            29.99₺ <span className="text-2xl text-gray-400 font-normal">/ Ay</span>
                        </div>
                        <p className="text-gray-400 mb-6">Otomatik yenilenen abonelik • İstediğin zaman iptal et</p>

                        <button
                            onClick={handlePurchase}
                            disabled={purchasing}
                            className="btn-primary !py-4 !px-12 !text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg shadow-yellow-500/30 disabled:opacity-50"
                        >
                            {purchasing ? 'İşleniyor...' : 'Abone Ol (29.99₺/Ay)'}
                        </button>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-panel p-6 rounded-2xl"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-500/20 rounded-full mt-1">
                                    <Check className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                                    <p className="text-sm text-gray-400">{feature.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* About Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-panel p-8 rounded-2xl mb-8"
                >
                    <h3 className="text-2xl font-bold mb-4">Neden YDS Master Pro?</h3>
                    <div className="space-y-4 text-gray-300">
                        <p>
                            <strong className="text-white">YDS Master Pro</strong>, YDS sınavına hazırlanan öğrenciler için özel olarak tasarlanmış kapsamlı bir dil öğrenme platformudur.
                        </p>
                        <p>
                            <strong className="text-white">3000+ Kelime</strong> ile zengin kelime haznenizi geliştirin. Her kelime, akademik tanımlar, eş anlamlılar ve örnek cümlelerle desteklenmiştir.
                        </p>
                        <p>
                            <strong className="text-white">10 Akademik Kitap</strong> ile YDS seviyesinde okuma pratiği yapın. Her kitap, gerçek YDS sınavlarındaki metinlere benzer akademik içeriklerle doludur.
                        </p>
                        <p>
                            <strong className="text-white">Etkileşimli Oyunlar</strong> ile öğrenmeyi eğlenceli hale getirin. Kelime eşleştirme ve kelime testi oyunlarıyla bilginizi pekiştirin.
                        </p>
                        <p className="text-yellow-400 font-semibold">
                            Pro üyelikle tüm bu özelliklere sınırsız erişim kazanın ve YDS hedeflerinize ulaşın!
                        </p>
                    </div>
                </motion.div>

                {/* App Store Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass-panel p-6 rounded-2xl text-center"
                >
                    <h3 className="font-semibold mb-4">Mobil Uygulamalarımızdan Haberdar Olun</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Yakında iOS ve Android uygulamalarımız yayınlanacak. Güncellemelerden haberdar olmak için bizi takip edin!
                    </p>
                    <div className="flex justify-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                            <Apple className="w-5 h-5" />
                            <span className="text-sm">App Store</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                            <Smartphone className="w-5 h-5" />
                            <span className="text-sm">Google Play</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        Not: Mobil uygulamalarda satın alma işlemleri App Store ve Google Play üzerinden gerçekleştirilecektir.
                    </p>
                </motion.div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 mt-8 pb-8 space-y-4">
                    <div className="flex justify-center gap-4 text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">Kullanım Koşulları</a>
                        <span>•</span>
                        <a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a>
                        <span>•</span>
                        <button onClick={() => alert('Satın alımları geri yükleme özelliği yakında aktif olacak.')} className="hover:text-white transition-colors">
                            Satın Alımları Geri Yükle
                        </button>
                    </div>
                    <p className="max-w-2xl mx-auto">
                        Abonelik, cari dönemin bitiminden en az 24 saat önce otomatik yenileme kapatılmadığı sürece otomatik olarak yenilenir.
                        Hesabınızdan, cari dönemin bitiminden 24 saat önce yenileme ücreti tahsil edilecektir.
                        Abonelikler kullanıcı tarafından yönetilebilir ve satın alma işleminden sonra Hesap Ayarlarına gidilerek otomatik yenileme kapatılabilir.
                    </p>
                </div>
            </div>
        </div>
    );
}
