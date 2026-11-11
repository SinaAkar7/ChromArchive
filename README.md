# ChromArchive: Yapay Zekâ Destekli Görsel Renk Analizi ve Dijital Arşiv Sistemi

**ChromArchive**, açık erişimli dijital görsel koleksiyonlarından (*The Metropolitan Museum of Art*, *Wikimedia Commons*) elde edilen sanat eserleri ve fotoğrafların renk özelliklerini piksel düzeyinde analiz eden, K-Means++ kümeleme algoritmasıyla sınıflandıran ve kullanıcıların hedef renklere göre akıllı kromatik arama yapabilmelerini sağlayan tarayıcı tabanlı modern bir dijital arşiv sistemidir.

Proje, **React 19**, **TypeScript (Strict Mode)** ve **Vite** mimarisi kullanılarak yeniden yapılandırılmış olup hem yerel ortamda hem de **Vercel** üzerinde tek tıkla canlıya alınabilecek şekilde optimize edilmiştir.

---

## 🏛️ Temel Özellikler

1. **İstemci Taraflı Canvas API Renk Analizi:**
   - JPG, JPEG, PNG ve WEBP formatlarında görsel yükleme.
   - Piksellerin HTML5 2D Canvas üzerinde taranması ve örneklenmesi.
   - Hiçbir sunucuya veya üçüncü taraf harici API'ye görsel göndermeden, %100 yerel ve gizlilik dostu çalışma.

2. **Gelişmiş K-Means++ Kümeleme Algoritması:**
   - 5 ila 8 baskın rengin matematiksel olarak belirlenmesi.
   - İnsan görme sisteminin biyolojik renk hassasiyetine göre optimize edilmiş ağırlıklı Öklid metriği:  
     $$\Delta C = \sqrt{2\Delta R^2 + 4\Delta G^2 + 3\Delta B^2}$$
   - Her renk için HEX, RGB, kullanım yüzdesi ve Türkçe algısal renk adı (*Prusya Mavisi, Hardal Sarısı, Terracotta vb.*).

3. **Kromatik Arama & Benzerlik Sıralaması:**
   - Etkileşimli renk seçici veya manuel HEX kodu girişi.
   - Arşivdeki tüm eserlerin baskın renkleriyle hedef renk arasındaki kromatolojik benzerlik skorunun hesaplanması.
   - Ayarlanabilir benzerlik eşiği slider'ı.

4. **Küratöryel Dijital Koleksiyon & The Met Open Access Uyumu:**
   - Johannes Vermeer (*Süt Döken Kadın*), Katsushika Hokusai (*Büyük Dalga*), Claude Monet (*Nilüferler*), Leonardo da Vinci (*Mona Lisa*), Paul Cézanne ve Rembrandt van Rijn gibi başyapıtların yer aldığı başlangıç koleksiyonu.
   - Tek tıkla doğrulanmış JSON metadata dışa aktarma (`exportMetadataAsJson`).
   - Kullanıcı analizlerinin tarayıcı yerel hafızasına (`localStorage`) kota güvenliğiyle (max 25 kayıt) kaydedilmesi.

5. **Koleksiyon Metrikleri ve Sıcaklık Dağılımı:**
   - Sıcak (Kırmızı/Sarı/Turuncu), Soğuk (Mavi/Camgöbeği/Mor) ve Nötr (Gri/Toprak/Siyah) termal denge grafikleri.
   - Koleksiyondaki en popüler 5 renk ailesi frekans sıralaması ve spektral çeşitlilik skoru.

---

## 📁 Proje Dosya Yapısı

```
chromarchive/
├── public/
│   └── images/                     # Başyapıt görselleri (vermeer, hokusai, monet, monalisa vb.)
├── src/
│   ├── components/                 # Modüler React bileşenleri
│   │   ├── About.tsx               # Proje vizyonu ve teknik şartname
│   │   ├── ArchiveGallery.tsx      # Dijital arşiv, arama ve filtreleme
│   │   ├── ArtworkModal.tsx        # Eser ve metadata detay inceleme modalı
│   │   ├── ColorPalette.tsx        # K-Means renk kartları ve dağılım çubuğu
│   │   ├── Footer.tsx              # Küratöryel alt bilgi ve navigasyon
│   │   ├── ImageUploader.tsx       # Sürükle-bırak yükleyici ve örnek eserler
│   │   ├── Navbar.tsx              # 3 Bölgeli üst menü navigasyonu
│   │   ├── SearchBar.tsx           # Hedef renk bazlı kromatik arama
│   │   ├── Statistics.tsx          # Koleksiyon renk dağılımı ve istatistikler
│   │   └── Toast.tsx               # Kullanıcı geri bildirim bildirimleri
│   ├── data/
│   │   └── archiveData.json        # Doğrulanmış başlangıç müze veri seti
│   ├── services/
│   │   ├── archiveService.ts       # LocalStorage ve JSON veri yönetimi
│   │   └── colorAnalyzer.ts        # K-Means++ ve Canvas renk analiz motoru
│   ├── styles/
│   │   └── style.css               # Müze ve editoryal stil şablonu
│   ├── types/
│   │   └── index.ts                # Kapsamlı TypeScript interface ve tipleri
│   ├── App.tsx                     # Ana React uygulama orkestrasyonu
│   ├── index.css                   # Tailwind v4 importları
│   └── main.tsx                    # Vite React 19 kök giriş noktası
├── index.html                      # SEO ve web fontları içeren HTML şablonu
├── package.json                    # Bağımlılıklar ve npm betikleri
├── tsconfig.json                   # TypeScript Strict yapılandırması
├── vercel.json                     # Vercel SPA yönlendirmeleri ve önbellek kuralları
├── vite.config.ts                  # Vite derleyici yapılandırması
└── README.md                       # Kurulum ve dağıtım rehberi
```

---

## 🚀 Yerel Geliştirme (Local Development)

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

### Gereksinimler
- **Node.js**: v18.0.0 veya üzeri
- **npm** veya **yarn** / **pnpm**

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Tarayıcınızda `http://localhost:3000` adresine gidin.

### 3. Tip Denetimi (TypeScript Lint)
```bash
npm run lint
```

### 4. Üretim Derlemesi (Production Build)
```bash
npm run build
```
Derleme çıktısı `dist/` klasörüne oluşturulur.

---

## 🌐 Vercel Üzerinde Yayınlama (Deployment)

ChromArchive, Vercel platformuna dağıtılmak üzere önceden yapılandırılmıştır (`vercel.json`).

### Yöntem 1: Vercel CLI ile Dağıtım (Hızlı)
1. Vercel CLI aracını yükleyin (yüklü değilse):
   ```bash
   npm install -g vercel
   ```
2. Proje dizininde giriş yapın ve dağıtın:
   ```bash
   vercel
   ```
3. Üretim ortamına dağıtmak için:
   ```bash
   vercel --prod
   ```

### Yöntem 2: GitHub Entegrasyonu ile Vercel Dashboard Dağıtımı (Önerilen)
1. Projenizi GitHub üzerinde yeni bir depoya (repository) gönderin:
   ```bash
   git init
   git add .
   git commit -m "feat: ChromArchive TypeScript React migration"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADINIZ/chromarchive.git
   git push -u origin main
   ```
2. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin.
3. **"Add New Project"** butonuna tıklayın ve GitHub deponuzu seçin (**Import**).
4. Yapılandırma ayarlarını kontrol edin (otomatik algılanır):
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **"Deploy"** butonuna basın. Yaklaşık 30-45 saniye içinde uygulamanız canlıya alınacaktır.

---

## 🔬 Bilimsel Renk Analizi Metodolojisi

1. **Piksel Örnekleme:** Yüklenen görseller bellek içinde `300×300` piksel matrisine ölçeklenerek 90.000 piksel taranır. Aşırı şeffaf pikseller (alpha < 125) elenir.
2. **K-Means++ Kümeleme:** İlk küme merkezleri aralarındaki maksimum mesafe gözetilerek seçilir (Lloyd algoritmasının yerel minimuma takılmasını önler).
3. **Ağırlıklı Öklid Mesafesi:** İnsan gözünün retinasındaki koni hücrelerinin yeşile ve kırmızıya daha duyarlı olması sebebiyle standart RGB Öklid metriği yerine $2\Delta R^2 + 4\Delta G^2 + 3\Delta B^2$ formülü kullanılır.
4. **Termal Sınıflandırma:** Renklerin HSV uzayındaki ton açıları ($H \in [0, 360)$) üzerinden matematiksel sınıflandırma yapılır:
   - **Sıcak Tonlar:** $H \in [0, 75)$ veya $H \in [330, 360)$
   - **Soğuk Tonlar:** $H \in [150, 270)$
   - **Nötr / Dengeli Tonlar:** Doygunluk ($S \le 18$) veya $H \in [75, 150) \cup [270, 330)$

---

## 📄 Telif & Açık Erişim Hakları
- **Sanat Eseri Görselleri:** The Metropolitan Museum of Art Open Access (CC0 1.0) ve Wikimedia Commons Public Domain koleksiyonlarından sağlanmıştır.
- **Yazılım Lisansı:** MIT Lisansı. Akademik ve araştırma amaçlı kullanıma açıktır.
