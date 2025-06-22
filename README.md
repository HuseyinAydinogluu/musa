# Berber Randevu Takip Sistemi

Bu proje, Next.js (JavaScript), Prisma ORM, SQLite ve Tailwind CSS kullanılarak geliştirilmiş bir berber randevu takip sistemidir.

## Özellikler
- Kullanıcı kayıt, giriş, çıkış ve profil yönetimi
- Rol tabanlı erişim (Admin ve Normal Kullanıcı)
- Admin paneli ve kullanıcı yönetimi
- Randevu oluşturma ve takip sistemi
- Kullanıcılar arası mesajlaşma
- En az 5 ilişkili tablo (kullanıcı, randevu, mesaj, hizmet, rol vb.)
- Modern ve responsive arayüz (Tailwind CSS)

## Kurulum
1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
2. Veritabanı yapılandırmasını tamamlayın ve migrasyonları çalıştırın:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

## Notlar
- Projede .git klasörü ve GitHub branch'leri oluşturulmaz.
- Tüm kodlar ve açıklamalar Türkçe'dir.
- Detaylı gereksinimler için proje dökümanına bakınız.
