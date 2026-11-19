# ChromArchive — Görsel Renk Analizi ve Dijital Sanat Arşivi

**ChromArchive**, açık erişimli müze koleksiyonlarındaki (*The Metropolitan Museum of Art* ve *Cleveland Museum of Art*) sanat eserlerini ve kullanıcı tarafından yüklenen görselleri tarayıcı içinde piksel düzeyinde analiz eden, K-Means++ algoritmasıyla baskın renk paletleri çıkaran ve CIELAB / Delta E 2000 metriği üzerinden kromatik arama sunan bir dijital sanat arşivi platformudur.

---

## 1. Proje Hakkında

ChromArchive; React 19, TypeScript (Strict Mode), Vite 8 ve HTML5 Canvas API üzerine kurulu tek sayfa uygulamasıdır (SPA). Tüm kullanıcı görselleri uzak bir sunucuya gönderilmeden doğrudan istemci belleğinde işlenir. Müze arşivindeki görseller ise doğrulama ve CORS kısıtlamalarını aşmak amacıyla sınırlandırılmış `/api/met-image` sunucu ucu desteğiyle gerçek piksellerinden analiz edilebilir.

---

## 2. Projenin Amacı

Geleneksel dijital müze katalogları sanat eserlerini çoğunlukla sanatçı adı, tarih, teknik ve envanter numarası gibi metinsel alanlarla dizinler. ChromArchive bu yapıya doğrudan piksel verisinden elde edilen ölçülebilir bir renk katmanı ekler:

- Yüklenen görsellerden 5–8 baskın renk kümesi, HEX/RGB değerleri, kullanım oranları ve göreli sıcaklık profili üretmek.
- Sanat eserlerini yalnızca metinle değil, sahip oldukları baskın renkler ve algısal yakınlık (CIEDE2000 ΔE) üzerinden aranabilir hâle getirmek.
- Tarihsel pigment kayıtlarını ve kaynaklandırılmış kültürel renk anlamlarını aynı küratöryel arayüzde sunmak.

---

## 3. Geliştirme Aşamaları (Kronolojik Kayıt)

Aşağıdaki liste yalnızca mevcut proje dosyalarında doğrulanan uygulama özelliklerini kronolojik sırada özetler; her tamamlanmış aşama **`**Eklendi**`** etiketiyle işaretlenmiştir.

1. Müze ve dijital kürasyon temalı arayüz tasarımı ve CSS değişkenleri (`Cormorant Garamond`, `Plus Jakarta Sans`, `JetBrains Mono`) — **`**Eklendi**`**
2. 3 bölgeli üst navigasyon (`Navbar`), sekme tabanlı yönlendirme ve kompakt kurumsal alt bilgi (`Footer`) — **`**Eklendi**`**
3. React 19 + TypeScript (Strict Mode) + Vite 8 + Tailwind CSS v4 proje mimarisi — **`**Eklendi**`**
4. Sürükle-bırak destekli görsel yükleyici (`JPG`, `JPEG`, `PNG`, `WEBP`, maks. 25 MB) ve 5 yerel başyapıt önayarı (`ImageUploader`) — **`**Eklendi**`**
5. HTML5 2D Canvas API üzerinde `300×300` piksel örnekleme ve alfa kanal filtrelemesi (`alpha >= 125`) — **`**Eklendi**`**
6. Algısal ağırlıklı Öklid metriği ($2\Delta R^2 + 4\Delta G^2 + 3\Delta B^2$) kullanan K-Means++ renk kümeleme motoru (`5`, `6`, `7`, `8` ve otomatik küme modu) — **`**Eklendi**`**
7. Orantılı renk dağılım şeridi, yatay liste / kart ızgara görünümü, tek tıkla HEX panoya kopyalama ve JSON metadata indirme (`ColorPalette`) — **`**Eklendi**`**
8. The Metropolitan Museum of Art Open Access koleksiyonundan 105 eserlik başlangıç veri seti (`src/data/archiveData.json`) — **`**Eklendi**`**
9. Cleveland Museum of Art (CMA CC0) koleksiyonundan 100 tablo eklemesiyle toplam 205 esere genişletilmiş tekilleştirilmiş müze kataloğu (`archive-additions-100-paintings.json` ve `archiveColorIndex.json`) — **`**Eklendi**`**
10. Eser detay inceleme penceresi (`ArtworkModal`) ve "Analizörde Aç" doğrudan aktarım akışı — **`**Eklendi**`**
11. Kullanıcı analizlerinin geçici `chromarchive_user_items` kaydı kaldırıldı; yalnızca müze kataloğu ve palet önbelleği korunacak şekilde temizlik politikası eklendi (`archiveService.ts`) — **`**Güncellendi**`**
12. 11 ana renk ailesi için Türkçe/İngilizce ad, tarihsel bağlam, kaynaklandırılmış kültürel anlamlar (`documentedMeanings`) ve tıklanabilir akademik referans bağlantıları (`ColorMeaningsGrid`, `ColorMeaningModal`) — **`**Eklendi**`**
13. sRGB → Lineer RGB → CIE XYZ (D65) → CIELAB dönüşümü ve **368 kayıtlı açık erişimli renk sözlüğü** (`src/data/colors.json`) üzerinde CIEDE2000 (ΔE 2000) renk arama motoru — **`**Eklendi**`**
14. Gelişmiş HEX / RGB / renk adı / 13 renk ailesi filtresi ve eşleşen rengin tarihsel pigment & kültürel anlam çekmecesi (`ColorHistoricalContextPanel`) — **`**Eklendi**`**
15. 38 tarihsel pigment kaydı, kimyasal bileşim, koruma notları ve kaynak eşlemesi (`src/data/historicalPigments.json`, `historicalPigmentsService.ts`) — **`**Eklendi**`**
16. Renk aramadan sanat eserlerine erişim: hedef renk ile arşivin analiz edilmiş paletleri arasında ΔE 2000 bazlı benzer eser sıralaması (`SearchBar` B bölümü) — **`**Eklendi**`**
17. Göreli sıcaklık puanlaması (0–100 sürekli skor, CIELAB kroma `C*ab` nötr kapısı, sıcak/geçişli/soğuk/nötr dağılımı ve 4-komşuluk mekânsal sıcaklık karşıtlığı analizi; `colorTemperatureService.ts`) — **`**Eklendi**`**
18. Koleksiyon istatistikleri paneli ve masaüstü hover, mobil dokunma ile klavye odak/Enter/Space destekli açıklayıcı soru işareti (`?`) ipucu kutuları (`Statistics.tsx`) — **`**Eklendi**`**
19. Görsel yükleme/analiz çalışma alanının (`Görsel Analizi`) `Ana Sayfa` vitrininden tamamen ayrılması ve sekmeler arası analiz durumu koruması (`App.tsx`, `HomeOverview.tsx`) — **`**Eklendi**`**
20. Eksik paletli müze eserleri için tekil `"Paleti oluştur"` ve eşzamanlılık sınırlı (maks. 2) toplu `"Eksik paletleri oluştur"` gerçek piksel analiz akışı (`archivePaletteService.ts`, `ArchiveGallery.tsx`) — **`**Eklendi**`**
21. Üretilen paletlerin `localStorage` kalıcı önbelleğinde (`chromarchive_archive_palette_cache_v1`) saklanması ve açılışta otomatik birleştirilmesi (`archiveService.ts`) — **`**Eklendi**`**
22. Yalnızca `https://images.metmuseum.org/CRDImages/...` yoluna izin veren CORS görsel vekil ucu (`/api/met-image`), Vite geliştirme ara katmanı ve Vercel SPA rewrite uyarlaması (`api/met-image.ts`, `vercel.json`) — **`**Eklendi**`**
23. Paletsiz/bekleyen eserlerin istatistiklerde nötr renk sınıfına katılmasını engelleyen ayrıştırılmış istatistik hesabı — **`**Eklendi**`**
24. Kullanıcı fotoğraflarının arşive kaydedilmesinin kaldırılması, tek girişli `"Görsel Analiz Et"` yönlendirmesi, iki durumlu analiz çalışma alanı, `"Yeni Görsel Analiz"` sıfırlama akışı ve canlı kamera fotoğraf çekimi (`navigator.mediaDevices.getUserMedia()`, HTML5 Video + Canvas, `MediaStreamTrack.stop()` yaşam döngüsü temizliği) — **`**Eklendi**`**
25. ChromArchive'ın tüm modüllerini açıklayan, görsel işlem akışları, adım adım kullanım kılavuzları, etkileşimli kümeleme/görünüm önizlemeleri, terimler sözlüğü, doğrudan modül yönlendirmeleri ve sık sorulan sorular içeren kapsamlı Yardım sayfası (`src/components/Help.tsx`, `Navbar.tsx`, `Footer.tsx`, `HomeOverview.tsx`, `App.tsx`, `src/types/index.ts`, `src/styles/style.css`) — **`**Eklendi**`**

---

## 4. Uygulama Özellikleri

- **Ana Sayfa (`HomeOverview`):** Editoryal müze açılışı, doğrulanmış yerel başyapıt plakası değiştirici, koleksiyon metrik özeti ve modül yönlendirmeleri içerir; görsel yükleme alanı barındırmaz.
- **Görsel Analizi (`ImageUploader`, `ColorPalette`, `ColorAnalysisInsights`):** Yalnızca üst menüdeki `"Görsel Analiz Et"` butonu veya Ana Sayfa CTA'sı üzerinden erişilen iki durumlu analiz çalışma alanıdır:
  1. **Cihazdan görsel yükleme & sürükle-bırak** (`JPG`, `JPEG`, `PNG`, `WEBP`, maks. 25 MB).
  2. **Canlı kamera fotoğraf çekimi** (`"Kamerayı Aç"` -> `<video>` canlı önizleme -> `"Fotoğraf Çek"` -> `"Kamerayı Kapat"` / `"Kamerayı Yeniden Aç"`).
  3. **Çekilen fotoğrafı mevcut analiz boru hattında doğrudan işleme** (`analyzeImageSource`, K-Means++ 5–8 renk kümeleme, CIELAB / ΔE 2000 adlandırma ve göreli sıcaklık analizi).
  4. **5 hazır başyapıt önayarı** (Vermeer, Hokusai, Monet, Cézanne, Mona Lisa) ile hızlı doğrulama.
  5. **Analiz süresince/sonrasında fotoğraf önizlemesini ekranda tutma** ve giriş ekranını gizleyen odaklı iki sütunlu sonuç düzeni.
  6. **Yeni Görsel Analiz (`onStartNewAnalysis`):** Önceki analiz verisini sıfırlayıp dosya yükleme / kamera / örnek seçim durumuna tek tıkla dönüş.
  7. **Orantılı renk dağılımı, yatay/ızgara kart görünümleri, tek tıkla HEX kopyalama ve JSON indirme.**
  8. **Otomatik donanım temizliği:** Fotoğraf çekimi tamamlandığında, kamera kapatıldığında, sekme değiştirildiğinde veya bileşen kapandığında tüm `MediaStreamTrack` akışları durdurulur.
- **Dijital Arşiv (`ArchiveGallery`, `ArtworkModal`, `ColorMeaningsGrid`, `ColorMeaningModal`):** Yalnızca 205 açık erişimli müze eseri üzerinde metin, sanatçı, dönem/departman, renk ailesi ve sıcaklık filtreleme; eksik paletler için tekil ve toplu (maks. 2 eşzamanlı) gerçek piksel paleti üretimi; 11 renk ailesinin kültürel anlam kartları ve detay penceresi yer alır.
- **Renk Arama (`SearchBar`, `ColorHistoricalContextPanel`):** HEX, RGB veya Türkçe/İngilizce ad ile arama; 368 sözlük rengi arasında en yakın 10 eşleşme; arşiv eserlerinde ΔE 2000 yakınlık araması; tarihsel pigment ve kültürel bağlam paneli sunar.
- **İstatistikler (`Statistics`):** İndekslenen eser sayısı, analiz edilen eser sayısı, palet bekleyen eser sayısı, toplam renk kümesi, ortalama kromatik çeşitlilik, ağırlıklı göreli sıcaklık dağılımı ve en sık kullanılan renk ailelerini raporlar.
- **Proje Hakkında (`About`):** Metodoloji, kullanım alanları, açık erişim veri kaynakları, bilimsel sıcaklık referansları ve teknik mimari bilgilerini içerir.
- **Yardım ve Kullanım Rehberi (`Help.tsx`):** Görsel analiz, kamera ile fotoğraf çekme, dijital arşiv, renk arama, renk sıcaklığı, istatistikler ve uygulamanın diğer özellikleri için görselleştirilmiş kullanım anlatımları, hızlı başlangıç, teknik terimler sözlüğü ve sık sorulan sorular sunar.
  - **Navigasyon Entegrasyonu:** Üst menüye (`Navbar.tsx`) ve mobil menüye `Proje Hakkında` sonrasına **Yardım** sekmesi eklenmiş (`"Görsel Analiz Et"` sağ CTA düzeni korunmuştur); ayrıca `HomeOverview.tsx` (Ana Sayfa *"Nasıl Kullanılır?"* / *"Yardım Rehberi"*) ve `Footer.tsx` alt bilgi çubuğu üzerinden doğrudan erişim sağlanmıştır.
  - **Kullanıcı Deneyimi:** Üst bölümde tıklanabilir içindekiler çubuğu, oklarla bağlanan 4 adımlı hızlı başlangıç şeması, açılır-kapanır modül rehberleri, etkileşimli 5–8 küme ve yatay/ızgara önizleme örnekleri, `#B2AC88` açıklamalı renk kartı, ilgili modüllere yönlendiren çalışan aksiyon butonları, erişilebilir SSS akordeonu ve tüm ekran boyutlarına uyumlu duyarlı tasarım içerir.

### Gizlilik ve Veri Saklama

- **Kullanıcı Görselleri Arşivlenmez:** Cihazdan yüklenen dosyalar ve kamera ile çekilen fotoğraflar yalnızca geçici olarak tarayıcı belleğinde (RAM) HTML5 Canvas API üzerinden analiz edilir; dijital arşive, `localStorage` alanına, IndexedDB'ye veya herhangi bir uzak sunucuya kaydedilmez.
- **Eski Kayıt Temizliği:** Daha önceki oturumlardan `chromarchive_user_items` anahtarında kalmış özel kullanıcı fotoğrafı kayıtları (`isCustom: true`, `data:`, `blob:`, `custom_*`) uygulama açılışında otomatik olarak elenir.
- **Kamera İzni Politikası:** Sayfa yüklendiğinde kamera kesinlikle otomatik başlatılmaz; erişim yalnızca kullanıcı `"Kamerayı Aç"` butonuna bastığında istenir ve çekim sonrasında, kapatmada ya da sayfadan ayrılırken `MediaStreamTrack.stop()` ile tamamen serbest bırakılır.
- **Müze Palet Önbelleği:** Kalıcı tarayıcı önbelleği (`chromarchive_archive_palette_cache_v1`) yalnızca resmi müze kataloğu eserlerinin (`objectId` / `museumRecordId` sahibi, `isCustom: false`) eksik palet çıkarımlarını saklar.

---

## 5. Teknik Altyapı

| Katman | Teknoloji / Kütüphane |
| --- | --- |
| Arayüz Çatısı | React 19.0.1 |
| Tip Sistemi | TypeScript 7 (`strict: true`) |
| Derleme & Geliştirme | Vite 8.3.0, `@vitejs/plugin-react` |
| Stil Sistemi | Tailwind CSS v4 (`@tailwindcss/vite`) + özel küratöryel CSS (`src/styles/style.css`) |
| İkonlar | `lucide-react` |
| Piksel ve Medya İşleme | HTML5 2D Canvas API, `navigator.mediaDevices.getUserMedia()`, HTML5 Video API (`<video>`), `MediaStreamTrack.stop()` |
| Kalıcılık | Yalnızca resmi müze palet önbelleği: `localStorage` (`chromarchive_archive_palette_cache_v1`) |
| Görsel CORS Vekil Ucu | Vercel Serverless Function (`api/met-image.ts`) & Vite dev middleware |
| Çalışma Zamanı | Node.js `>=20.19.0 || >=22.12.0` (`.nvmrc`: `22.12.0`) |

---

## 6. Renk Analizinin Çalışma Mantığı

1. **Örnekleme (`colorAnalyzer.ts`):** Görsel bellek içinde en uzun kenarı `300 px` olacak şekilde HTML5 2D Canvas üzerine çizilir; `alpha >= 125` koşulunu sağlayan pikseller örneklenir.
2. **K-Means++ Kümeleme:** İlk küme merkezleri en uzak komşu olasılık dağılımıyla başlatılır. Uzaklık hesabı insan retinasının yeşil-kırmızı-mavi hassasiyetini yansıtan ağırlıklı Öklid metriğiyle ($\sqrt{2\Delta R^2 + 4\Delta G^2 + 3\Delta B^2}$) yapılır.
3. **Sözlük Adlandırması ve CIELAB Dönüşümü (`colorSearchService.ts`):** sRGB değerleri gamma doğrusallaştırması sonrası CIE XYZ (D65) ve CIELAB ($L^*, a^*, b^*$) koordinatlarına çevrilir; `368` kayıtlı sözlük rengi arasında CIEDE2000 (ΔE) formülüyle en yakın renk adı atanır.
4. **Göreli Sıcaklık Modeli (`colorTemperatureService.ts`):** Her renk kümesi için HSL ton açısı, CIELAB kroma ($C^*_{ab}$) nötr eşiği ve aydınlık faktörü kullanılarak `0–100` arası sürekli sıcaklık yönelimi skoru, güven aralığı ve sınıf etiketi (*Sıcak yönelimli*, *Geçişli / dengeli*, *Soğuk yönelimli*, *Nötr / akromatik*) üretilir. Ayrıca `240 px` ızgarada 4-komşuluk sınır örnekleriyle mekânsal sıcaklık karşıtlıkları hesaplanır. Bu değerler görsel yönelim göstergesidir; fiziksel Kelvin sıcaklığı değildir.

---

## 7. Dijital Arşiv Sistemi

- **Birleşik Katalog (`archiveService.ts`):** Başlangıçta The Met (`105` eser) ve CMA (`100` eser) kayıtları tekilleştirilerek `205` benzersiz eser elde edilir.
- **Önceden İndekslenmiş ve Eksik Paletler:** `src/data/archiveColorIndex.json` dosyası `140` eser (`40` The Met + `100` CMA) için hazır palet sağlar; kalan `65` The Met eseri başlangıçta `dominantColors: []` (palet bekliyor) durumundadır.
- **Tekil ve Toplu Palet Üretimi (`archivePaletteService.ts`):** Kullanıcı arşiv sayfasında tekil bir eser için **"Paleti oluştur"** veya tüm bekleyen eserler için **"Eksik paletleri oluştur"** işlemini başlatabilir. Toplu işlem en fazla `2` eşzamanlı istekle çalışır ve durdurulabilir.
- **Gerçek Piksel Zorunluluğu ve Hata Yönetimi:** Bir görsele CORS veya ağ hatası nedeniyle erişilemediğinde asla sahte/rastgele palet üretilmez; eser `"Görsel erişimi başarısız"` durumuna alınır ve `"Tekrar dene"` seçeneği sunulur.
- **Kalıcı Önbellek:** Başarıyla çıkarılan paletler `localStorage` içindeki `chromarchive_archive_palette_cache_v1` anahtarında saklanır ve sonraki oturumlarda otomatik yüklenir.
- **Müze Görseli Proxy Güvenliği (`api/met-image.ts`):** Yalnızca `https://images.metmuseum.org/CRDImages/...` adreslerine izin verir, yönlendirmeleri en fazla 3 adımda doğrular, `image/*` MIME tipini ve 18 MB boyut sınırını denetler. Kullanıcı tarafından yüklenen yerel dosyalar (`File` / `data:` URL) kesinlikle bu uca gönderilmez.

---

## 8. Dosya Yapısı

```text
chromarchive/
├── api/
│   └── met-image.ts                        # The Met CRDImages için kısıtlı Vercel proxy fonksiyonu
├── public/
│   ├── archive-data.json                   # Statik açık erişim arşiv kopyası
│   └── images/                             # Yerel başyapıt görselleri (Vermeer, Hokusai, Monet, Cézanne, Mona Lisa, Rembrandt, Van Gogh)
├── scripts/
│   ├── buildColorsDataset.mjs              # 368 renkli sözlük veri derleme betiği
│   ├── generateArchiveColorIndex.ts        # Arşiv renk indeksi üretim betiği
│   ├── generateCmaColorIndex.ts            # CMA renk indeksi üretim betiği
│   ├── resolveSeeds.mjs                    # Başlangıç tohum çözümleme betiği
│   ├── syncMetArchive.mjs                  # The Met Open Access senkronizasyon betiği
│   └── verificationReport.json             # Veri seti doğrulama raporu
├── src/
│   ├── components/
│   │   ├── About.tsx                       # Metodoloji, amaç ve açık erişim kaynakları
│   │   ├── ArchiveGallery.tsx              # Katalog, filtreleme, tekil/toplu palet analizi
│   │   ├── ArtworkModal.tsx                # Eser detayları ve metadata modalı
│   │   ├── ColorAnalysisInsights.tsx       # Göreli sıcaklık ve mekânsal karşıtlık paneli
│   │   ├── ColorHistoricalContextPanel.tsx # Pigment tarihi ve kültürel anlam çekmecesi
│   │   ├── ColorMeaningModal.tsx           # Renk ailesi kültürel anlam detay modalı
│   │   ├── ColorMeaningsGrid.tsx           # 11 renk ailesi kart ızgarası
│   │   ├── ColorPalette.tsx                # Baskın palet görünümü, Yeni Görsel Analiz sıfırlama ve JSON dışa aktarma
│   │   ├── Footer.tsx                      # Kompakt kurumsal alt bilgi çubuğu (Yardım & Hakkında bağlantıları)
│   │   ├── Help.tsx                        # Görselleştirilmiş kapsamlı kullanım rehberi, sözlük ve SSS
│   │   ├── HomeOverview.tsx                # Editoryal müze ana sayfası (Yardım Rehberi yönlendirmeli)
│   │   ├── ImageUploader.tsx               # İki durumlu yükleyici, canlı kamera çekimi ve örnek seçici
│   │   ├── Navbar.tsx                      # 3 bölgeli üst menü (Ana Sayfa–Yardım sekmeleri + tek Görsel Analiz Et CTA)
│   │   ├── SearchBar.tsx                   # CIELAB / ΔE 2000 renk ve eser arama motoru
│   │   ├── Statistics.tsx                  # Arşiv metrikleri ve erişilebilir ipucu kutuları
│   │   └── Toast.tsx                       # Bildirim bileşeni
│   ├── data/
│   │   ├── archive-additions-100-paintings.json # 100 CMA CC0 tablo kaydı
│   │   ├── archiveColorIndex.json          # 140 ön-indeksli eser paleti
│   │   ├── archiveData.backup.json         # Yedek The Met arşiv verisi
│   │   ├── archiveData.json                # 105 The Met Open Access kaydı
│   │   ├── colorMeanings.json              # 11 ana renk ailesi kültürel anlam verisi
│   │   ├── colorTemperatureRules.json      # Göreli sıcaklık sınıflandırma kuralları
│   │   ├── colors.json                     # 368 açık erişimli adlandırılmış renk sözlüğü
│   │   ├── historicalPigments.json         # 38 tarihsel pigment ve kaynak kaydı
│   │   └── warmCoolResearchReference.json  # Bilimsel sıcaklık literatür referansları
│   ├── services/
│   │   ├── archivePaletteService.ts        # Tekil ve maks. 2 eşzamanlı arşiv piksel analiz servisi
│   │   ├── archiveService.ts               # Müze kataloğu birleştirme, palet önbelleği, eski kullanıcı kaydı temizliği ve istatistikler
│   │   ├── colorAnalyzer.ts                # Canvas API + K-Means++ piksel motoru
│   │   ├── colorMeaningsService.ts         # Kültürel renk anlamları okuma servisi
│   │   ├── colorSearchService.ts           # CIELAB dönüşümü ve CIEDE2000 (ΔE) arama
│   │   ├── colorTemperatureService.ts      # 0–100 sıcaklık skoru ve mekânsal komşuluk analizi
│   │   └── historicalPigmentsService.ts    # Tarihsel pigment eşleme servisi
│   ├── styles/
│   │   └── style.css                       # Müze editoryal teması ve duyarlı stiller
│   ├── types/
│   │   └── index.ts                        # Tüm TypeScript arayüz ve tip tanımları
│   ├── App.tsx                             # Ana uygulama orkestrasyonu
│   ├── index.css                           # Tailwind CSS v4 giriş dosyası
│   └── main.tsx                            # React 19 kök giriş noktası
├── .nvmrc                                  # Sabitlenmiş Node.js sürümü (22.12.0)
├── index.html                              # Uygulama HTML kabuğu
├── metadata.json                           # Uygulama adı ve meta tanımları
├── package.json                            # Bağımlılıklar ve npm betikleri
├── tsconfig.json                           # TypeScript Strict yapılandırması
├── vercel.json                             # Vercel SPA + /api/* yönlendirme kuralları
├── vite.config.ts                          # Vite yapılandırması ve /api/met-image dev eklentisi
└── README.md
```

---

## 9. Yerel Kurulum

### Gereksinimler
- **Node.js:** `>=20.19.0` veya `>=22.12.0` (`.nvmrc` içinde `22.12.0` tanımlıdır)
- **npm**

### Adımlar

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirme sunucusunu başlatın (http://localhost:3000)
npm run dev

# 3. TypeScript tip denetimini çalıştırın
npm run lint

# 4. Üretim paketini derleyin (dist/)
npm run build
```

---

## 10. Vercel Dağıtımı

Proje `vercel.json` üzerinden doğrudan Vercel dağıtımına uygundur:

- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node.js Sürümü:** `package.json` içindeki `"engines": { "node": ">=20.19.0 || >=22.12.0" }` ve `.nvmrc` ile uyumludur.
- **Yönlendirme (`rewrites`):** `"/((?!api/).*)" -> "/index.html"` kuralı `/api/met-image` sunucu ucunun SPA HTML yönlendirmesi tarafından yakalanmasını engeller; tüm arayüz rotaları ise `index.html` üzerine yönlenir.

---

## 11. Veri Kaynakları ve Lisans Bilgileri

- **Sanat Eserleri:**
  - *The Metropolitan Museum of Art Open Access* (CC0 1.0 Public Domain)
  - *Cleveland Museum of Art Open Access* (CC0 1.0 Public Domain)
- **Adlandırılmış Renk Sözlüğü (`368` renk):**
  - Sanzo Wada — *The Dictionary of Color Combinations* (CC BY 4.0)
  - XKCD Color Survey (CC0 1.0 Public Domain)
  - W3C CSS Color Module Level 4 standart renk adları
- **Tarihsel Pigmentler ve Kültürel Anlamlar:** National Gallery of Art (*Artists’ Pigments*), MFA Boston CAMEO ve açık erişimli sanat tarihi kaynakları.
- **Göreli Sıcak/Soğuk Renk Literatürü:** Manalansan, Whitehead & Webster (2025), *Journal of Vision* 25(4):13 (CC BY 4.0); Koenderink, van Doorn & Braun (2024), *Journal of Vision* 24(7):5 (CC BY 4.0).
