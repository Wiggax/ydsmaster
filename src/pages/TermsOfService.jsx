import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
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
                        Kullanım Şartları
                    </h1>

                    <div className="space-y-6 text-gray-300 leading-relaxed">
                        <p className="text-sm text-gray-400">
                            Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
                        </p>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Hizmet Şartlarının Kabulü</h2>
                            <p>
                                YDS Master Pro uygulamasını kullanarak, bu Kullanım Şartlarını kabul etmiş olursunuz.
                                Bu şartları kabul etmiyorsanız, lütfen uygulamayı kullanmayın.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. Hizmet Tanımı</h2>
                            <p>
                                YDS Master Pro, YDS sınavına hazırlanan kullanıcılara yönelik bir eğitim platformudur.
                                Uygulama aşağıdaki özellikleri sunar:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                                <li>Kelime kartları ve sözlük</li>
                                <li>İnteraktif kelime oyunları</li>
                                <li>Akademik okuma metinleri</li>
                                <li>YDS deneme sınavları</li>
                                <li>İlerleme takibi</li>
                                <li>Liderlik tablosu</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. Kullanıcı Hesapları</h2>
                            <p className="mb-2">Hesap oluştururken:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Doğru ve güncel bilgiler sağlamalısınız</li>
                                <li>Hesap güvenliğinden siz sorumlusunuz</li>
                                <li>Şifrenizi kimseyle paylaşmamalısınız</li>
                                <li>Yetkisiz hesap kullanımını derhal bildirmelisiniz</li>
                                <li>13 yaşından büyük olmalısınız</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. Üyelik Türleri</h2>
                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-semibold text-white">Ücretsiz Üyelik:</h3>
                                    <p>Temel özelliklere sınırlı erişim sağlar.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Pro Üyelik:</h3>
                                    <p>Tüm özelliklere sınırsız erişim, reklamsız deneyim ve premium içerikler sunar.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. Kullanıcı Sorumlulukları</h2>
                            <p className="mb-2">Kullanıcılar aşağıdaki davranışlardan kaçınmalıdır:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Uygulamayı yasadışı amaçlarla kullanmak</li>
                                <li>Diğer kullanıcıların haklarını ihlal etmek</li>
                                <li>Zararlı yazılım veya virüs yaymak</li>
                                <li>Uygulamanın güvenliğini tehlikeye atmak</li>
                                <li>Otomatik araçlar veya botlar kullanmak</li>
                                <li>İçeriği izinsiz kopyalamak veya dağıtmak</li>
                                <li>Sahte hesaplar oluşturmak</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">6. Fikri Mülkiyet Hakları</h2>
                            <p>
                                Uygulamadaki tüm içerik, tasarım, logo, metin, grafik ve yazılım YDS Master Pro'nun
                                mülkiyetindedir ve telif hakkı yasaları ile korunmaktadır. İçeriğin izinsiz kullanımı,
                                kopyalanması veya dağıtılması yasaktır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">7. Hizmet Değişiklikleri</h2>
                            <p>
                                YDS Master Pro, önceden haber vermeksizin hizmeti değiştirme, askıya alma veya
                                sonlandırma hakkını saklı tutar. Önemli değişiklikler hakkında kullanıcıları
                                bilgilendirmeye çalışacağız.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">8. Sorumluluk Reddi</h2>
                            <p>
                                Uygulama "olduğu gibi" sunulmaktadır. YDS Master Pro:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                                <li>Hizmetin kesintisiz veya hatasız olacağını garanti etmez</li>
                                <li>İçeriğin doğruluğunu veya güncelliğini garanti etmez</li>
                                <li>Sınav başarısını garanti etmez</li>
                                <li>Veri kaybından sorumlu tutulamaz</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">9. Hesap Feshi</h2>
                            <p>
                                YDS Master Pro, bu şartları ihlal eden kullanıcıların hesaplarını önceden haber
                                vermeksizin askıya alma veya sonlandırma hakkını saklı tutar. Kullanıcılar
                                hesaplarını istedikleri zaman silebilirler.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">10. Ödeme ve İadeler</h2>
                            <p>
                                Pro üyelik ödemeleri ilgili uygulama mağazası (Google Play, App Store) üzerinden
                                yapılır. İade politikaları, ilgili mağazanın şartlarına tabidir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">11. Gizlilik</h2>
                            <p>
                                Kişisel verilerinizin işlenmesi hakkında detaylı bilgi için lütfen
                                <a href="/privacy-policy" className="text-primary hover:underline ml-1">
                                    Gizlilik Politikamızı
                                </a> inceleyin.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">12. Uygulanacak Hukuk</h2>
                            <p>
                                Bu Kullanım Şartları, Türkiye Cumhuriyeti yasalarına tabidir. Ortaya çıkabilecek
                                uyuşmazlıklar Türkiye mahkemelerinde çözümlenecektir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">13. Değişiklikler</h2>
                            <p>
                                Bu Kullanım Şartlarını zaman zaman güncelleyebiliriz. Önemli değişiklikler
                                hakkında kullanıcıları bilgilendireceğiz. Güncellemelerden sonra uygulamayı
                                kullanmaya devam etmeniz, yeni şartları kabul ettiğiniz anlamına gelir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">14. İletişim</h2>
                            <p>
                                Kullanım Şartları hakkında sorularınız varsa, lütfen bizimle iletişime geçin:
                            </p>
                            <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
                                <p><strong>E-posta:</strong> support@ydsmasterpro.com</p>
                                <p><strong>Adres:</strong> [Şirket Adresiniz]</p>
                            </div>
                        </section>

                        <section className="pt-6 border-t border-white/10">
                            <p className="text-sm text-gray-400">
                                Bu Kullanım Şartlarını kabul ederek, yasal olarak bağlayıcı bir sözleşmeye
                                girmiş olursunuz. Lütfen dikkatlice okuyun.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
