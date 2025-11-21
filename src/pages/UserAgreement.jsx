import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserAgreement() {
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
                        Kullanıcı Sözleşmesi
                    </h1>

                    <div className="space-y-6 text-gray-300 leading-relaxed">
                        <p className="text-sm text-gray-400">
                            Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
                        </p>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Taraflar</h2>
                            <p>
                                Bu sözleşme, YDS Master Pro uygulamasını kullanan kullanıcı ("Kullanıcı") ile
                                uygulamayı sağlayan YDS Master Pro ("Sağlayıcı") arasında akdedilmiştir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. Sözleşmenin Konusu</h2>
                            <p>
                                Bu sözleşme, YDS Master Pro mobil uygulamasının kullanımına ilişkin tarafların
                                hak ve yükümlülüklerini belirler. Uygulama, YDS sınavına hazırlık için eğitim
                                içeriği ve araçlar sunar.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. Hizmet Kapsamı</h2>
                            <p className="mb-2">Uygulama aşağıdaki hizmetleri sunar:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>İngilizce kelime kartları (fiiller, sıfatlar, isimler)</li>
                                <li>Kelime eşleştirme ve boşluk doldurma oyunları</li>
                                <li>Akademik okuma metinleri</li>
                                <li>YDS deneme sınavları (50 adet)</li>
                                <li>Bilinmeyen kelime listesi</li>
                                <li>İlerleme takibi ve liderlik tablosu</li>
                                <li>Pro üyelik özellikleri (ücretli)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. Kullanıcı Yükümlülükleri</h2>
                            <p className="mb-2">Kullanıcı, aşağıdaki hususları kabul ve taahhüt eder:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Kayıt sırasında doğru ve güncel bilgiler sağlamak</li>
                                <li>Hesap güvenliğini sağlamak ve şifreyi gizli tutmak</li>
                                <li>Uygulamayı yasal amaçlarla kullanmak</li>
                                <li>Diğer kullanıcıların haklarına saygı göstermek</li>
                                <li>İçeriği izinsiz kopyalamamak veya dağıtmamak</li>
                                <li>Uygulamanın güvenliğini tehlikeye atmamak</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. Sağlayıcı Yükümlülükleri</h2>
                            <p className="mb-2">Sağlayıcı, aşağıdaki hususları taahhüt eder:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Hizmeti makul ölçüde kesintisiz sunmak</li>
                                <li>Kullanıcı verilerini güvenli şekilde saklamak</li>
                                <li>Gizlilik politikasına uymak</li>
                                <li>Önemli değişiklikler hakkında bilgilendirmek</li>
                                <li>Teknik destek sağlamak</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">6. Ücretsiz ve Ücretli Hizmetler</h2>
                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-semibold text-white">Ücretsiz Hizmetler:</h3>
                                    <p>Temel kelime kartları, sınırlı sayıda oyun ve deneme sınavlarına erişim.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Pro Üyelik (Ücretli):</h3>
                                    <p>
                                        Tüm içeriğe sınırsız erişim, reklamsız deneyim, akademik okuma kitapları
                                        ve premium özellikler. Ücret, ilgili uygulama mağazası üzerinden tahsil edilir.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">7. Fikri Mülkiyet</h2>
                            <p>
                                Uygulamadaki tüm içerik, yazılım, tasarım ve materyaller Sağlayıcı'nın
                                mülkiyetindedir. Kullanıcı, bu içerikleri yalnızca kişisel kullanım amacıyla
                                kullanabilir. Ticari kullanım, kopyalama, dağıtım veya türev eser oluşturma
                                yasaktır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">8. Veri Koruma ve Gizlilik</h2>
                            <p>
                                Kullanıcı verileri, KVKK ve GDPR'a uygun olarak işlenir. Detaylı bilgi için
                                <a href="/privacy-policy" className="text-primary hover:underline ml-1">
                                    Gizlilik Politikası
                                </a>
                                'nı inceleyiniz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">9. Hesap Yönetimi</h2>
                            <p className="mb-2">Kullanıcı:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Hesap bilgilerini güncel tutmakla yükümlüdür</li>
                                <li>Hesabını istediği zaman silebilir (geri alınamaz)</li>
                                <li>Şifresini değiştirebilir</li>
                                <li>İlerleme verilerini yönetebilir</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">10. Sorumluluk Sınırlamaları</h2>
                            <p className="mb-2">Sağlayıcı, aşağıdaki durumlardan sorumlu tutulamaz:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>İnternet bağlantısı sorunları</li>
                                <li>Cihaz uyumsuzlukları</li>
                                <li>Üçüncü taraf hizmet kesintileri</li>
                                <li>Kullanıcı hatalarından kaynaklanan veri kayıpları</li>
                                <li>Sınav sonuçları (uygulama sadece hazırlık aracıdır)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">11. Sözleşmenin Feshi</h2>
                            <p>
                                Her iki taraf da sözleşmeyi istediği zaman feshedebilir. Kullanıcı hesabını
                                silerek, Sağlayıcı ise şartları ihlal eden hesapları kapatarak sözleşmeyi
                                feshedebilir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">12. Değişiklikler</h2>
                            <p>
                                Sağlayıcı, bu sözleşmeyi önceden bildirerek değiştirme hakkını saklı tutar.
                                Önemli değişiklikler kullanıcılara bildirilir. Değişikliklerden sonra uygulamayı
                                kullanmaya devam etmek, yeni şartları kabul etmek anlamına gelir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">13. Uyuşmazlık Çözümü</h2>
                            <p>
                                Bu sözleşmeden doğan uyuşmazlıklar, öncelikle dostane görüşmelerle çözülmeye
                                çalışılır. Çözüm sağlanamazsa, Türkiye Cumhuriyeti mahkemeleri yetkilidir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">14. Yürürlük</h2>
                            <p>
                                Bu sözleşme, kullanıcının uygulamaya kaydolması ile yürürlüğe girer ve
                                hesap silinene kadar geçerli kalır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">15. İletişim</h2>
                            <p>
                                Sözleşme ile ilgili sorularınız için:
                            </p>
                            <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
                                <p><strong>E-posta:</strong> legal@ydsmasterpro.com</p>
                                <p><strong>Destek:</strong> support@ydsmasterpro.com</p>
                                <p><strong>Adres:</strong> [Şirket Adresiniz]</p>
                            </div>
                        </section>

                        <section className="pt-6 border-t border-white/10">
                            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                                <p className="font-semibold text-white mb-2">Onay Beyanı</p>
                                <p className="text-sm">
                                    Uygulamayı kullanarak, bu Kullanıcı Sözleşmesini, Kullanım Şartlarını ve
                                    Gizlilik Politikasını okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan
                                    edersiniz.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
