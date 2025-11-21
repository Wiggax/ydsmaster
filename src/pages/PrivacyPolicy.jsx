import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Geri
                </button>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                    <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Gizlilik Politikası
                    </h1>

                    <div className="space-y-6 text-gray-300 leading-relaxed">
                        <p className="text-sm text-gray-400">
                            Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
                        </p>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Giriş</h2>
                            <p>
                                YDS Master Pro olarak, kullanıcılarımızın gizliliğini korumayı taahhüt ediyoruz.
                                Bu Gizlilik Politikası, kişisel bilgilerinizi nasıl topladığımızı, kullandığımızı
                                ve koruduğumuzu açıklamaktadır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. Topladığımız Bilgiler</h2>
                            <p className="mb-2">Uygulamamızı kullanırken aşağıdaki bilgileri topluyoruz:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Hesap Bilgileri:</strong> Ad, e-posta adresi, şifre (şifrelenmiş)</li>
                                <li><strong>Kullanım Verileri:</strong> İlerleme kayıtları, test sonuçları, bilinmeyen kelimeler</li>
                                <li><strong>Cihaz Bilgileri:</strong> Cihaz türü, işletim sistemi, uygulama sürümü</li>
                                <li><strong>Analitik Verileri:</strong> Uygulama kullanım istatistikleri, hata raporları</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. Bilgilerin Kullanımı</h2>
                            <p className="mb-2">Topladığımız bilgileri şu amaçlarla kullanırız:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Hesabınızı oluşturmak ve yönetmek</li>
                                <li>Öğrenme ilerlemenizi kaydetmek ve takip etmek</li>
                                <li>Kişiselleştirilmiş içerik ve öneriler sunmak</li>
                                <li>Uygulama performansını iyileştirmek</li>
                                <li>Teknik destek sağlamak</li>
                                <li>Güvenlik ve dolandırıcılık önleme</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. Veri Güvenliği</h2>
                            <p>
                                Kişisel bilgilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                                <li>Şifreler bcrypt ile şifrelenir</li>
                                <li>HTTPS ile güvenli veri iletimi</li>
                                <li>JWT token tabanlı kimlik doğrulama</li>
                                <li>Düzenli güvenlik güncellemeleri</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. Veri Paylaşımı</h2>
                            <p>
                                Kişisel bilgilerinizi üçüncü taraflarla <strong>paylaşmıyoruz, satmıyoruz veya kiralamıyoruz</strong>.
                                Verileriniz yalnızca aşağıdaki durumlarda paylaşılabilir:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                                <li>Yasal zorunluluklar gereği</li>
                                <li>Kullanıcı haklarını korumak için</li>
                                <li>Açık kullanıcı onayı ile</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">6. Kullanıcı Hakları</h2>
                            <p className="mb-2">KVKK ve GDPR kapsamında aşağıdaki haklara sahipsiniz:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Erişim Hakkı:</strong> Kişisel verilerinize erişim talep edebilirsiniz</li>
                                <li><strong>Düzeltme Hakkı:</strong> Yanlış verilerin düzeltilmesini isteyebilirsiniz</li>
                                <li><strong>Silme Hakkı:</strong> Hesabınızı ve tüm verilerinizi silebilirsiniz</li>
                                <li><strong>İtiraz Hakkı:</strong> Veri işlemeye itiraz edebilirsiniz</li>
                                <li><strong>Taşınabilirlik Hakkı:</strong> Verilerinizin kopyasını talep edebilirsiniz</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">7. Hesap Silme</h2>
                            <p>
                                Hesabınızı ve tüm ilişkili verilerinizi istediğiniz zaman silebilirsiniz.
                                Dashboard'daki "Hesabı Sil" butonunu kullanarak hesabınızı kalıcı olarak silebilirsiniz.
                                Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">8. Çerezler</h2>
                            <p>
                                Uygulamamız, oturum yönetimi ve kullanıcı deneyimini iyileştirmek için çerezler kullanır.
                                Çerezleri tarayıcı ayarlarınızdan yönetebilirsiniz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">9. Çocukların Gizliliği</h2>
                            <p>
                                Uygulamamız 13 yaş altı çocuklara yönelik değildir. Bilerek 13 yaş altı çocuklardan
                                kişisel bilgi toplamıyoruz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">10. Değişiklikler</h2>
                            <p>
                                Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler
                                olduğunda sizi bilgilendireceğiz. Güncellenmiş politika, yayınlandığı tarihte
                                yürürlüğe girer.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">11. İletişim</h2>
                            <p>
                                Gizlilik politikamız hakkında sorularınız varsa, lütfen bizimle iletişime geçin:
                            </p>
                            <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
                                <p><strong>E-posta:</strong> privacy@ydsmasterpro.com</p>
                                <p><strong>Adres:</strong> [Şirket Adresiniz]</p>
                            </div>
                        </section>

                        <section className="pt-6 border-t border-white/10">
                            <p className="text-sm text-gray-400">
                                Bu gizlilik politikası, Türkiye Cumhuriyeti Kişisel Verilerin Korunması Kanunu (KVKK)
                                ve Avrupa Birliği Genel Veri Koruma Yönetmeliği (GDPR) ile uyumludur.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
