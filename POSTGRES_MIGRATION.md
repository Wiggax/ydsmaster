# PostgreSQL Migration Guide

## Render'da PostgreSQL Kurulumu

### 1. PostgreSQL Database Oluşturma

1. [Render Dashboard](https://dashboard.render.com)'a gidin
2. "New +" butonuna tıklayın
3. "PostgreSQL" seçin
4. Ayarları yapın:
   - **Name**: `ydsmaster-db` (veya istediğiniz isim)
   - **Database**: `ydsmaster`
   - **User**: `ydsmaster` (otomatik oluşturulur)
   - **Region**: Web service ile aynı bölge seçin
   - **Plan**: Free tier seçin
5. "Create Database" butonuna tıklayın
6. Database oluşturulduktan sonra **Internal Database URL**'i kopyalayın

### 2. Web Service'e Environment Variable Ekleme

1. Render Dashboard'da web service'inizi açın
2. "Environment" sekmesine gidin
3. "Add Environment Variable" butonuna tıklayın
4. Şu değişkenleri ekleyin:
   ```
   DATABASE_URL = [Kopyaladığınız Internal Database URL]
   NODE_ENV = production
   JWT_SECRET = [Güvenli bir random string]
   ```
5. "Save Changes" butonuna tıklayın

### 3. Database Schema Oluşturma

Database oluşturulduktan sonra, tabloları oluşturmanız gerekiyor:

1. Render Dashboard'da PostgreSQL database'inizi açın
2. "Connect" sekmesine gidin
3. "External Connection" altındaki PSQL Command'i kopyalayın
4. Terminalinizde bu komutu çalıştırın (PostgreSQL client gerekli)
5. Bağlandıktan sonra, `server/database/schema.sql` dosyasının içeriğini kopyalayıp çalıştırın

**Alternatif:** Render'ın web shell'ini kullanabilirsiniz:
1. Database sayfasında "Shell" sekmesine gidin
2. `schema.sql` dosyasının içeriğini buraya yapıştırın
3. Enter'a basın

### 4. Deploy

1. Kodunuzu GitHub'a push edin:
   ```bash
   git add .
   git commit -m "Migrate to PostgreSQL"
   git push
   ```

2. Render otomatik olarak yeni deployment başlatacak
3. Deployment loglarını kontrol edin
4. "✅ Using PostgreSQL database" mesajını görmelisiniz

### 5. Data Migration (Opsiyonel)

Eğer mevcut `db.json` dosyanızda veri varsa:

1. Lokal olarak migration script çalıştırın (henüz oluşturulmadı)
2. Veya manuel olarak önemli verileri PostgreSQL'e aktarın

## Sorun Giderme

### "Connection refused" hatası
- DATABASE_URL'in doğru olduğundan emin olun
- Internal Database URL kullandığınızdan emin olun (External değil)

### "relation does not exist" hatası
- Schema'nın doğru şekilde oluşturulduğundan emin olun
- `schema.sql` dosyasını tekrar çalıştırın

### Deployment başarısız
- Environment variables'ın doğru ayarlandığından emin olun
- Render loglarını kontrol edin

## Notlar

- PostgreSQL Free tier 90 gün sonra silinir, yedekleme yapın
- Production'da düzenli backup alın
- Database connection pool ayarları `server/database/db.js` dosyasında
