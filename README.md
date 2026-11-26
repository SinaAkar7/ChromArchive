# ChromArchive — Görsel Renk Analizi ve Dijital Sanat Arşivi

**ChromArchive**, açık erişimli müze koleksiyonlarındaki (*The Metropolitan Museum of Art* ve *The Cleveland Museum of Art*) sanat eserlerini ve kullanıcıların yüklediği ya da canlı kamerayla çektiği görselleri doğrudan tarayıcı içinde piksel düzeyinde analiz eden; **K-Means++** kümeleme algoritmasıyla baskın renk paletleri çıkaran, **CIELAB / CIEDE2000 (ΔE 2000)** metriğiyle algısal renk ve eser araması sunan, çok boyutlu göreli renk sıcaklığı hesaplayan ve tarihsel pigment/kültürel anlam katmanlarını birleştiren tek sayfalık (SPA) bir dijital sanat arşivi ve görsel analiz platformudur.

---

## İçindekiler

1. [Projenin Amacı ve Kapsamı](#1-projenin-amacı-ve-kapsamı)
2. [Geliştirme Süreci ve Eklenen Özellikler (Adım Adım)](#2-geliştirme-süreci-ve-eklenen-özellikler-adım-adım)
3. [Kullanılan Teknolojiler ve Görevleri](#3-kullanılan-teknolojiler-ve-görevleri)
4. [JSON Veri Setleri ve Kaynakları](#4-json-veri-setleri-ve-kaynakları)
5. [Uygulama Sayfaları (Modüller) ve Çalışma Mantığı](#5-uygulama-sayfaları-modüller-ve-çalışma-mantığı)
6. [Algoritmik Altyapı ve Hesaplama Yöntemleri](#6-algoritmik-altyapı-ve-hesaplama-yöntemleri)
7. [Gizlilik, Güvenlik ve Veri Saklama Politikası](#7-gizlilik-güvenlik-ve-veri-saklama-politikası)
8. [Proje Dosya Yapısı](#8-proje-dosya-yapısı)
9. [Yerel Kurulum ve Vercel Dağıtımı](#9-yerel-kurulum-ve-vercel-dağıtımı)
10. [Sonuç ve Değerlendirme](#10-sonuç-ve-değerlendirme)

---

## 1. Projenin Amacı ve Kapsamı

### 1.1. Problem Tanımı
Geleneksel dijital müze katalogları ve sanat veri tabanları, eserleri çoğunlukla sanatçı adı, yapım yılı, teknik, dönem ve envanter numarası gibi **metinsel üst veriler** üzerinden dizinler. Bu yaklaşım tarihsel kataloglama için yeterli olsa da bir eserin görsel karakterini oluşturan renk dağılımını, ton dengesini ve kromatik ilişkilerini doğrudan sorgulamaya olanak tanımaz.

### 1.2. Projenin Amacı
ChromArchive, metin merkezli müze kataloglarına **doğrudan piksel verisinden hesaplanan ölçülebilir bir renk katmanı** kazandırmayı amaçlar:
- Kullanıcının cihazından yüklediği görsellerden veya kamerasıyla çektiği fotoğraflardan gerçek zamanlı ve sunucusuz biçimde **5–8 baskın renk kümesi**, HEX/RGB kodları, alan yüzdeleri, renk çeşitlilik skoru ve göreli sıcaklık profili üretmek.
- Açık erişimli müze koleksiyonlarından derlenen **205 eseri** yalnızca sanatçı ve dönemle değil, baskın renk aileleri ve algısal renk yakınlığı (**CIEDE2000 ΔE**) üzerinden aranabilir hâle getirmek.
- Tespit edilen dijital renkleri, **368 kayıtlı adlandırılmış renk sözlüğü**, **38 tarihsel pigment kaydı** ve **11 ana renk ailesinin belgelenmiş kültürel anlamlarıyla** bilimsel sınırları koruyarak (piksel rengi ≠ kimyasal pigment teşhisi ayrımını vurgulayarak) ilişkilendirmek.

### 1.3. Projenin Kapsamı
ChromArchive yedi ana modülden (**Ana Sayfa**, **Görsel Analizi**, **Dijital Arşiv**, **Renk Arama**, **İstatistikler**, **Proje Hakkında**, **Yardım**) oluşan bütünleşik bir web uygulamasıdır. İstemci tarafında çalışır; yalnızca The Met görsellerindeki CORS kısıtlamasını güvenli biçimde aşmak amacıyla sınırlandırılmış bir `/api/met-image` görsel vekil (proxy) ucu içerir.

---

## 2. Geliştirme Süreci ve Eklenen Özellikler (Adım Adım)

Aşağıdaki numaralandırılmış liste, ChromArchive projesinin geliştirilme sürecinde eklenen ve mevcut kaynak kodlarında doğrulanan tüm aşamaları kronolojik sırada ve **her özelliğin projeye sağladığı katkıyla** birlikte özetler:

1. **Müze ve Dijital Kürasyon Temalı Arayüz Tasarımı (`src/styles/style.css`, `index.html`) — *Eklendi***
   - *İçerik:* Krem/parşömen tonlu arka plan (`#FBF9F5`), kurumsal lacivert (`#1B2A4A`) ve sıcak toprak vurguları üzerine kurulu editoryal tasarım sistemi; `Cormorant Garamond` (başlık), `Plus Jakarta Sans` (gövde) ve `JetBrains Mono` (HEX/RGB/ΔE kodları) tipografisi.
   - *Projeye Katkısı:* Sanat tarihi ve müze estetiğine uygun, yüksek kontrastlı ve okunaklı bir görsel kimlik oluşturdu.

2. **3 Bölgeli Üst Navigasyon ve Kurumsal Alt Bilgi (`Navbar.tsx`, `Footer.tsx`) — *Eklendi***
   - *İçerik:* Sol bölgede marka logosu, orta bölgede sekme tabanlı sayfa bağlantıları, sağ bölgede tek birincil aksiyon butonu (`"Görsel Analiz Et"`) ve mobil uyumlu açılır menü; alt kısımda kompakt kurumsal alt bilgi çubuğu.
   - *Projeye Katkısı:* Tüm modüller arasında sezgisel ve tutarlı tek sayfa (SPA) geçişi sağladı.

3. **React 19 + TypeScript (Strict Mode) + Vite 8 + Tailwind CSS v4 Mimarisi (`package.json`, `tsconfig.json`) — *Eklendi***
   - *İçerik:* Bileşen, servis, veri seti ve tip tanımlarının (`src/types/index.ts`) katmanlı yapıda ayrıştırılması ve katı tip denetimi (`"strict": true`).
   - *Projeye Katkısı:* Büyük veri setleri ve karmaşık renk matematiği üzerinde hatasız, sürdürülebilir ve ölçeklenebilir bir kod tabanı sundu.

4. **Sürükle-Bırak Görsel Yükleyici ve 5 Yerel Başyapıt Önayarı (`ImageUploader.tsx`) — *Eklendi***
   - *İçerik:* `JPG`, `JPEG`, `PNG` ve `WEBP` formatlarını (maksimum `25 MB`) kabul eden dosya yükleyici, sürükle-bırak alanı ve 5 yerel başyapıt (Vermeer, Hokusai, Monet, Cézanne, Mona Lisa) ile tek tıkla test imkânı.
   - *Projeye Katkısı:* Kullanıcının kendi görseli olmadığında bile analiz motorunu anında deneyimleyebilmesini ve format/boyut doğrulamasıyla güvenli girdi alınmasını sağladı.

5. **HTML5 2D Canvas Piksel Örnekleme Motoru (`colorAnalyzer.ts`) — *Eklendi***
   - *İçerik:* Görsellerin uzak sunucuya gönderilmeden bellek içi `<canvas>` üzerinde ölçeklenmesi (güncel yapılandırmada `colorTemperatureRules.json` içindeki `maxCanvasDimensionPx: 240` ve `sampleStepPx: 2` ızgara örneklemesi; ilk sürümde 300 px üst sınırla kurgulanmıştır) ve saydam piksellerin (`alpha < 128`) elenmesi.
   - *Projeye Katkısı:* Yüksek çözünürlüklü görsellerde bile tarayıcıyı kilitlemeden milisaniyeler içinde temsilî sRGB piksel matrisi elde edilmesini sağladı.

6. **Algısal Ağırlıklı K-Means++ Renk Kümeleme Motoru (`colorAnalyzer.ts`) — *Eklendi***
   - *İçerik:* En uzak komşu olasılık dağılımlı K-Means++ merkez başlatma, insan retinası hassasiyetine göre ağırlıklandırılmış RGB mesafesi ($\sqrt{(2 + \bar{r}/256)\Delta R^2 + 4\Delta G^2 + (2 + (255-\bar{r})/256)\Delta B^2}$), otomatik (`5–7`) veya kullanıcı seçimi (`5`, `6`, `7`, `8`) küme modu, maksimum 10 iterasyonluk yakınsama ve yakın kümelerin birleştirilmesi (`colorDistance < 16`).
   - *Projeye Katkısı:* Rastgele başlatmalı kümelemenin aksine tekrarlanabilir, yerel minimumlara takılmayan ve insan gözünün algısına yakın baskın paletler üretti.

7. **Orantılı Renk Skalası, Çift Görünüm ve JSON Dışa Aktarma (`ColorPalette.tsx`) — *Eklendi***
   - *İçerik:* Piksel yüzdelerine göre bölünmüş spektrum çubuğu, Yatay Kartlar / Kompakt Izgara görünüm seçimi, tek tıkla HEX panoya kopyalama ve `exportMetadataAsJson` ile yapılandırılmış JSON metadata indirme.
   - *Projeye Katkısı:* Çıkarılan renk analizini hem görsel olarak anlaşılır hem de tasarım/araştırma yazılımlarında yeniden kullanılabilir hâle getirdi.

8. **The Met Open Access 105 Eserlik Başlangıç Arşivi (`src/data/archiveData.json`) — *Eklendi***
   - *İçerik:* *The Metropolitan Museum of Art* açık erişimli kamu malı koleksiyonundan doğrulama raporuyla (`scripts/verificationReport.json`) seçilen 105 eserin küratöryel metadata kataloğu.
   - *Projeye Katkısı:* Telif hakkı sorunu olmayan, gerçek müze envanter numaralarına ve kaynak URL'lerine dayalı güvenilir bir başlangıç koleksiyonu oluşturdu.

9. **CMA CC0 100 Tablo Eklemesi ve 205 Eserlik Birleşik Katalog (`archive-additions-100-paintings.json`, `archiveColorIndex.json`) — *Eklendi***
   - *İçerik:* *The Cleveland Museum of Art* CC0 koleksiyonundan 100 tablo/resim kaydının eklenmesi, `objectId`/`museumRecordId`/`accessionNumber` üzerinden tekilleştirilerek **205 benzersiz esere** ulaşılması ve 140 eserlik (`40` The Met + `100` CMA) doğrulanmış renk indeksinin bağlanması.
   - *Projeye Katkısı:* Koleksiyon çeşitliliğini iki katına çıkararak farklı coğrafya, dönem ve teknikler arasında karşılaştırmalı renk analizi yapılmasını mümkün kıldı.

10. **Eser Detay Penceresi ve "Analizörde Aç" Akışı (`ArtworkModal.tsx`) — *Eklendi***
    - *İçerik:* Sanatçı, tarih, kültür, teknik, boyut, kurum, envanter no, lisans, renk dağılımı ve resmî müze bağlantısını gösteren erişilebilir modal pencere ile `"Analizörde Aç"` butonu.
    - *Projeye Katkısı:* Arşivdeki eserlerle analiz motoru arasında çift yönlü geçiş kurarak seçili tablonun farklı küme sayılarıyla (`5–8`) yeniden incelenebilmesini sağladı.

11. **Kullanıcı Fotoğraflarının Arşivlenmemesi ve Eski Kayıt Temizliği (`archiveService.ts`) — *Güncellendi***
    - *İçerik:* Önceki sürümden kalabilecek `chromarchive_user_items` anahtarındaki özel kullanıcı kayıtlarının (`isCustom: true`, `data:`, `blob:`, `custom_*`) açılışta otomatik temizlenmesi (`sanitizeLegacyUserItemsStorage`).
    - *Projeye Katkısı:* Dijital müze arşivinin yalnızca doğrulanmış açık erişimli eserlerden oluşmasını ve kullanıcı görsellerinin kalıcı depolamaya sızmamasını garanti altına aldı.

12. **11 Ana Renk Ailesi ve Kaynaklandırılmış Kültürel Anlamlar (`ColorMeaningsGrid.tsx`, `ColorMeaningModal.tsx`) — *Eklendi***
    - *İçerik:* 11 temel renk ailesi için Türkçe/İngilizce adlandırma, tarihsel bağlam, dönemlere göre anlam değişimleri (`meaningShifts`), belgelenmiş anlamlar (`documentedMeanings`) ve 12 akademik kaynağa tıklanabilir bağlantılar.
    - *Projeye Katkısı:* Renklerin evrensel olmayan, kültür ve döneme göre değişen sembolik arka planını kanıta dayalı biçimde eğitsel bir katman olarak ekledi.

13. **CIELAB (D65) + CIEDE2000 (ΔE 2000) Renk Arama Motoru (`colorSearchService.ts`, `colors.json`) — *Eklendi***
    - *İçerik:* sRGB → Lineer RGB → CIE XYZ (D65) → CIELAB dönüşümü ve **368** kayıtlı açık erişimli renk sözlüğü üzerinde Sharma, Wu & Dalal (2005) CIEDE2000 formülüyle en yakın 10 eşleşmenin bulunması.
    - *Projeye Katkısı:* RGB Öklid farkının algısal hatalarını ortadan kaldırarak insan gözünün renk benzerliği algısına matematiksel olarak sadık arama sonuçları sundu.

14. **Çoklu Renk Arama Girdileri, 13 Aile Filtresi ve Tarihsel Bağlam Çekmecesi (`SearchBar.tsx`, `ColorHistoricalContextPanel.tsx`) — *Eklendi***
    - *İçerik:* Doğal renk seçici, HEX, RGB, Türkçe/İngilizce ad/etiket arama kutularının senkronize çalışması, 13 renk ailesi filtresi ve eşleşen renk için açılabilir tarihsel pigment & kültürel bağlam paneli.
    - *Projeye Katkısı:* Tasarımcıların, öğrencilerin ve araştırmacıların farklı formatlardaki renk girdileriyle tek ekrandan hem sözlüğe hem tarihçeye ulaşabilmesini sağladı.

15. **38 Tarihsel Pigment Veri Seti ve Toksisite/Koruma Uyarıları (`historicalPigments.json`, `historicalPigmentsService.ts`) — *Eklendi***
    - *İçerik:* 38 tarihsel pigment, 13 renk ailesi özeti, kimyasal bileşim, belgelenmiş sanatsal kullanım, 40 kaynak bağlantısı ve arsenik/cıva/kurşun/kadmiyum içeren pigmentler için otomatik güvenlik uyarısı.
    - *Projeye Katkısı:* Dijital bir piksel renginin sanat tarihindeki olası fiziksel boya karşılıklarını (XRF/Raman teşhisi yerine geçmediğini belirterek) disiplinlerarası biçimde bağlamlandırdı.

16. **Renk Aramadan Sanat Eserlerine Erişim (`SearchBar.tsx` — B Bölümü) — *Eklendi***
    - *İçerik:* Hedef RGB/HEX değeri ile arşivdeki paleti analiz edilmiş tüm eserlerin baskın renkleri arasında CIEDE2000 (ΔE) hesabı yapılarak benzer eserlerin sıralanması.
    - *Projeye Katkısı:* Projenin temel vaadi olan *"renkten sanat eserine ulaşma"* senaryosunu somut biçimde hayata geçirdi.

17. **Çok Boyutlu Göreli Renk Sıcaklığı ve Mekânsal Komşuluk Analizi (`colorTemperatureService.ts`, `colorTemperatureRules.json`) — *Eklendi***
    - *İçerik:* Hue polaritesi, HSL/HSV doygunluk, Lightness, CIELAB kroma (`C*ab`) nötr kapısı, toprak/bej yumuşatması ile `0–100` sıcaklık skoru, güven düzeyi ve `240 px` ızgarada 4-komşuluk sınır örnekleriyle mekânsal sıcaklık karşıtlıkları.
    - *Projeye Katkısı:* Basit ve hatalı "kırmızı=sıcak, mavi=soğuk" ikili ayrımı yerine sanat kuramına ve psikofiziksel araştırmalara dayalı açıklanabilir bir sıcaklık profili sundu.

18. **Koleksiyon İstatistikleri ve Erişilebilir İpucu Kutuları (`Statistics.tsx`) — *Eklendi***
    - *İçerik:* İndekslenen eser, analiz edilen/bekleyen eser sayısı, toplam renk kümesi, ortalama kromatik çeşitlilik, 4 sınıflı sıcaklık dağılımı, en baskın 5 renk ailesi ve dönem dağılımı; masaüstü hover, mobil dokunma ve klavye odak/Enter/Space destekli `?` ipucu kutuları.
    - *Projeye Katkısı:* Tüm koleksiyonun makro düzeydeki kromatik eğilimlerini anlaşılır metriklerle özetledi ve terim karmaşasını önledi.

19. **Ana Sayfa Vitrini ile Analiz Çalışma Alanının Ayrılması (`HomeOverview.tsx`, `App.tsx`) — *Eklendi***
    - *İçerik:* Ana sayfanın editoryal müze vitrinine (4 eserlik yerel başyapıt seçicisi, canlı spektrum şeridi, koleksiyon özeti) dönüştürülmesi ve sekmeler arası geçişlerde aktif analiz durumunun bellekte korunması.
    - *Projeye Katkısı:* İlk kez giren kullanıcıya net bir proje tanıtımı sunarken çalışan analiz oturumunun sayfa değişimlerinde kaybolmasını engelledi.

20. **Eksik Paletler İçin Tekil ve Eşzamanlılık Sınırlı Toplu Piksel Analizi (`archivePaletteService.ts`, `ArchiveGallery.tsx`) — *Eklendi***
    - *İçerik:* Başlangıçta paleti eksik olan 65 The Met eseri için kart bazlı `"Paleti oluştur"` ve durdurulabilir (`AbortController`), en fazla `2` eşzamanlı istekle çalışan `"Eksik paletleri oluştur"` akışı.
    - *Projeye Katkısı:* Sahte/uydurma renk verisi üretmeden, yalnızca gerçek piksel okumasıyla arşivin kalan eserlerinin paletlerinin tamamlanabilmesini sağladı.

21. **Müze Paletlerinin Kalıcı Tarayıcı Önbelleğinde Saklanması (`archiveService.ts`) — *Eklendi***
    - *İçerik:* Başarıyla analiz edilen müze eserlerinin `localStorage` içindeki `chromarchive_archive_palette_cache_v1` anahtarına kaydedilmesi ve sonraki oturumlarda otomatik birleştirilmesi.
    - *Projeye Katkısı:* Kullanıcının arşivde ürettiği gerçek piksel paletlerinin sayfa yenilendiğinde tekrar hesaplanmasına gerek kalmadan korunmasını sağladı.

22. **Sınırlandırılmış The Met CORS Görsel Vekil Ucu (`api/met-image.ts`, `vite.config.ts`, `vercel.json`) — *Eklendi***
    - *İçerik:* Yalnızca `https://images.metmuseum.org/CRDImages/...` adreslerine izin veren, yönlendirme/boyut/MIME doğrulamalı `/api/met-image` sunucu fonksiyonu ve Vite geliştirme ara katmanı.
    - *Projeye Katkısı:* Tarayıcı Canvas `getImageData()` güvenlik (CORS taint) engelini güvenli biçimde aşarak müze görsellerinin gerçek piksellerinin okunabilmesini sağladı.

23. **Paletsiz Eserlerin İstatistiklerden Ayrıştırılması (`archiveService.ts`) — *Eklendi***
    - *İçerik:* `dominantColors` dizisi boş olan bekleyen eserlerin nötr sıcaklık veya 0 çeşitlilik olarak sayılmaması; yalnızca analiz edilmiş eserler üzerinden istatistik hesaplanması.
    - *Projeye Katkısı:* Henüz taranmamış 65 eserin koleksiyon istatistiklerini yapay olarak "Nötr" yönüne kaydırmasını önleyerek bilimsel doğruluğu korudu.

24. **İki Durumlu Analiz Çalışma Alanı ve Canlı Kamera Fotoğraf Çekimi (`ImageUploader.tsx`, `App.tsx`) — *Eklendi***
    - *İçerik:* Tek girişli `"Görsel Analiz Et"` yönlendirmesi, yükleme/kamera girişi ile analiz önizlemesini ayıran iki durumlu ekran, `"Yeni Görsel Analiz"` sıfırlaması ve `navigator.mediaDevices.getUserMedia()` ile canlı kamera fotoğraf çekimi (`MediaStreamTrack.stop()` otomatik donanım temizliğiyle).
    - *Projeye Katkısı:* Kullanıcıların fiziksel dünyadaki nesneleri, tabloları veya renk örneklerini anında fotoğraflayıp analiz edebilmesini ve analiz sonrasında yalnızca sonuca odaklanmasını sağladı.

25. **Etkileşimli ve Görselleştirilmiş Yardım / Kullanım Rehberi (`Help.tsx`, `Navbar.tsx`, `Footer.tsx`, `HomeOverview.tsx`) — *Eklendi***
    - *İçerik:* Tıklanabilir içindekiler çubuğu, 4 adımlı oklu hızlı başlangıç akışı, açılır-kapanır modül kılavuzları, etkileşimli 5–8 küme ve Yatay/Izgara önizleme demoları, `#B2AC88` açıklamalı renk kartı, doğrudan modül butonları, 8 terimli görsel sözlük ve erişilebilir SSS akordeonu.
    - *Projeye Katkısı:* Teknik terimlere (K-Means++, CIELAB, ΔE 2000, HEX/RGB) aşina olmayan kullanıcıların bile uygulamayı ilk açılışta kolayca kullanabilmesini sağladı.

---

## 3. Kullanılan Teknolojiler ve Görevleri

| Katman | Teknoloji / Kütüphane | Sürüm / Yapı | Projedeki Görevi |
| --- | --- | --- | --- |
| **Arayüz Kütüphanesi** | React & React DOM | `19.0.1` | Tek sayfa uygulaması (SPA) bileşen hiyerarşisi, durum yönetimi ve modüler ekran akışları. |
| **Programlama Dili** | TypeScript | `7.0.2` (`strict: true`) | Tüm servisler, bileşenler ve JSON veri şemaları için derleme zamanı tip güvenliği (`src/types/index.ts`). |
| **Derleme & Geliştirme Sunucusu** | Vite & `@vitejs/plugin-react` | `8.3.0` / `6.1.1` | Hızlı geliştirme sunucusu (port `3000`), üretim paketleme (`dist/`) ve `/api/met-image` geliştirme ara katmanı (`vite.config.ts`). |
| **Stil ve Tasarım Sistemi** | Tailwind CSS v4 + Özel Küratöryel CSS | `4.3.3` (`@tailwindcss/vite`) | `src/index.css` üzerinden Tailwind entegrasyonu ve `src/styles/style.css` ile müze editoryal teması, duyarlı (responsive) düzen. |
| **İkonografi** | `lucide-react` | `0.546.0` | Arayüz modülleri, bilgi ipuçları, kamera kontrolleri ve aksiyon butonları için vektör ikon seti. |
| **Piksel İşleme Motoru** | HTML5 2D Canvas API | Tarayıcı Yerleşik | Görselleri bellek içinde ölçekleme (`drawImage`) ve `getImageData()` ile ham sRGB piksel dizisi çıkarma. |
| **Canlı Kamera Erişimi** | Web MediaDevices API (`getUserMedia`) & HTML5 `<video>` | Tarayıcı Yerleşik | Kullanıcı onayıyla canlı kamera görüntüsü alma, kare yakalama ve `MediaStreamTrack.stop()` ile akışı kapatma. |
| **Kalıcı Önbellek** | Web Storage API (`localStorage`) | Tarayıcı Yerleşik | Yalnızca resmi müze kataloğu eserlerinin eksik palet çıkarımlarını (`chromarchive_archive_palette_cache_v1`) saklama. |
| **CORS Görsel Vekil Ucu** | Node.js HTTP / Vercel Serverless Function | `api/met-image.ts` | Yalnızca The Met `CRDImages` görsellerini doğrulayarak CORS kısıtlamasını güvenli biçimde aşma. |
| **Çalışma Zamanı & Dağıtım** | Node.js & Vercel | `>=20.19.0 \|\| >=22.12.0` (`.nvmrc`: `22.12.0`) | Paket yönetimi, tip denetimi (`tsc --noEmit`), SPA routing ve güvenlik başlıkları (`vercel.json`). |
| **Ek Paket Bilgisi** | `motion`, `@google/genai` | `12.23.24` / `2.4.0` | `package.json` bağımlılıklarında yer alır; ancak aktif ChromArchive analiz, arama ve arşivleme akışları harici LLM çağrısı olmadan tamamen deterministik istemci algoritmalarıyla çalışır. |

---

## 4. JSON Veri Setleri ve Kaynakları

ChromArchive, çalışma zamanında harici bir veritabanına ihtiyaç duymadan `src/data/` altındaki doğrulanmış JSON veri setlerinden beslenir. Tüm sayılar doğrudan proje dosyalarından doğrulanmıştır:

| Dosya Yolu | Kayıt Sayısı / İçerik | Açıklama ve Kullanım Alanı | Veri Kaynakları ve Lisanslar |
| --- | --- | --- | --- |
| `src/data/archiveData.json` | **105** sanat eseri | *The Metropolitan Museum of Art* koleksiyonundan 4 departmana (*European Paintings*, *The American Wing*, *Drawings and Prints*, *Robert Lehman Collection*) ait kamu malı eserler. (`scripts/verificationReport.json`: 18 temel kayıttan 87 eser eklenerek 105'e çıkarıldı; 68 tohum telif/eksik görsel nedeniyle elendi.) | The Metropolitan Museum of Art Open Access (**CC0 1.0 Public Domain**) |
| `src/data/archive-additions-100-paintings.json` | **100** tablo / resim | *Cleveland Museum of Art* koleksiyonundan benzersiz `accessionNumber` taşıyan 100 eser (`73` yağlıboya, `24` asma/el rulosu resim, `2` kâğıt/ipek üzeri mürekkep-renkli resim, `1` tempera). The Met kayıtlarıyla birleştirilip tekilleştirilerek **205** esere ulaşılır. | The Cleveland Museum of Art Open Access API (**CC0 1.0 Public Domain**) |
| `src/data/archiveColorIndex.json` | **140** ön-indeksli palet | **40** The Met + **100** CMA eseri için önceden hesaplanmış baskın renk paletleri, çeşitlilik ve sıcaklık özetleri. Kalan **65** The Met eseri başlangıçta `pending_image_analysis` durumundadır. | ChromArchive yerel piksel indeksleme çıktısı (açık erişim görsellerden üretilmiştir) |
| `src/data/colors.json` | **368** benzersiz adlandırılmış renk | **13 renk ailesi** (*red, orange, yellow, green, cyan, blue, purple, pink, brown, beige, gray, black, white*) altında sınıflandırılmış sRGB/HEX/HSL renk sözlüğü. | Sanzo Wada *Dictionary of Color Combinations* (**130** renk, **CC BY 4.0**), W3C CSS Color Module Level 4 (**139** renk), XKCD Color Survey via Corpora (**99** renk, **CC0 1.0**) |
| `src/data/colorMeanings.json` | **11** renk ailesi, **12** kaynak (`S1–S12`) | *Kırmızı, Mavi, Sarı, Yeşil, Mor, Turuncu, Siyah, Beyaz, Kahverengi, Pembe, Gri* ailelerinin tarihsel bağlamı, anlam değişimleri, modern kullanımları ve kaynaklandırılmış kültürel anlamları. | National Gallery of Art (*Artists' Pigments* Vol. 1–4), The Met *Heilbrunn Timeline*, Royal Society of Chemistry, WebExhibits, Global Color Meaning Database (**CC BY 4.0** editoryal özetler) |
| `src/data/historicalPigments.json` | **38** pigment, **13** aile özeti, **40** kaynak | Tarihsel sanat pigmentlerinin kimyasal bileşimi, belgelenmiş sanatsal kullanımları, toksisite/koruma notları ve yaklaşık arayüz örnekleri (`displayHex`). | NGA *Artists' Pigments*, MFA Boston CAMEO ve açık erişimli müze konservasyon yayınları |
| `src/data/colorTemperatureRules.json` | `multi-factor-warm-cool-v2` kural seti (**4** kaynak) | `warmPoleHueDeg: 20°`, `coolPoleHueDeg: 200°`, nötr kapısı, çok faktörlü ağırlıklandırma, toprak/bej moderasyonu ve `240 px` / `2 px` adımlı 4-komşuluk mekânsal analiz kuralları. | Art Institute of Chicago, Manalansan et al. (2025), Koenderink et al. (2024), W3C CSS Color 4 |
| `src/data/warmCoolResearchReference.json` | **20** özet kayıt (`LvsM × SvsLM`) | Psikofiziksel sıcak/soğuk renk algısı araştırmasının özet bulguları ve `cone-opponent` uzayının HSL ile karıştırılmaması gerektiğine dair metodolojik uyarı. | Manalansan, Whitehead & Webster (2025), *Journal of Vision* 25(4):13 (**CC BY 4.0**); `color-perception-datasets` (Görkem Yıldız, **CC BY 4.0**) |
| `src/data/archiveData.backup.json` | **18** eser kaydı | Arşiv genişletme öncesi ilk sürüm yedek The Met veri dosyası. | The Metropolitan Museum of Art Open Access (**CC0 1.0**) |
| `public/archive-data.json` | **7** eser kaydı | Başlangıç statik vitrin/referans arşiv kopyası. | Açık erişimli müze seçkisi |

---

## 5. Uygulama Sayfaları (Modüller) ve Çalışma Mantığı

Uygulama `src/App.tsx` içinde `activeSection` durumu (`'home' | 'analyzer' | 'archive' | 'search' | 'stats' | 'about' | 'help'`) ile yönetilir. Sekmeler arasında geçiş yapıldığında aktif analiz oturumu bellekte korunur.

### 5.1. Ana Sayfa (`HomeOverview.tsx`)
- **Görünüm ve İçerik:** Görsel yükleme alanı içermeyen, müze editoryal açılış vitrini olarak tasarlanmıştır. Sol tarafta proje manifestosu, birincil aksiyon butonları (`"Görsel analizine başla"`, `"Dijital arşivi keşfet"`, `"Nasıl Kullanılır?"`) ve canlı veriden okunan 4'lü özet şeridi (**205** Arşiv Eseri, **140+** Hazır Palet, **368** Renk Sözlüğü, **38** Tarihsel Pigment) yer alır.
- **Sağ Vitrin:** 4 yerel başyapıt (*Vermeer — Süt Döken Kadın*, *Hokusai — Büyük Dalga*, *Monet — Nilüferler*, *Cézanne — Elmalı Natürmort*) arasında geçiş yapılabilen etkileşimli plaka, ilgili eserin arşivde analiz edilmiş renk spektrum şeridi ve `"Arşiv Kaydını Aç"` bağlantısı bulunur.

### 5.2. Görsel Analizi (`ImageUploader.tsx`, `ColorPalette.tsx`, `ColorAnalysisInsights.tsx`, `ColorHistoricalContextPanel.tsx`)
- **İki Durumlu Çalışma Alanı:**
  - *Durum A (Giriş Ekranı):* Kullanıcı üst menüdeki `"Görsel Analiz Et"` butonuna bastığında; (1) sürükle-bırak / dosya seçici (`JPG`, `JPEG`, `PNG`, `WEBP`, maks. `25 MB`), (2) `"Kamerayı Aç"` canlı kamera çekimi ve (3) 5 hazır başyapıt önayarı sunulur.
  - *Durum B (Önizleme + Sonuç Ekranı):* Görsel seçildiği veya kamera ile çekildiği anda giriş formu gizlenir; sol sütunda seçili görselin önizlemesi ile boyut/küme/sıcaklık şeridi sabit kalır, sağ sütunda K-Means++ analiz sonuçları gösterilir. `"Yeni Görsel Analiz"` butonu ile tüm sonuç temizlenip Durum A'ya dönülür.
- **Sonuç Paneli Yetenekleri:** Küme sayısını değiştirme (`Otomatik (5-8)`, `5`, `6`, `7`, `8` Renk), görünüm değiştirme (`Yatay Kartlar` / `Izgara`), orantılı spektrum şeridinden veya kartlardan tek tıkla HEX kopyalama, ağırlıklı göreli sıcaklık profili (`% sıcak / geçişli / soğuk / nötr`), `240 px` 4-komşuluk mekânsal sıcaklık karşıtlıkları, her kartın altında açılabilir **Tarihsel Renk ve Pigment Bağlamı** çekmecesi (en yakın 3 sözlük rengi, 3 tarihsel pigment örneği, toksisite uyarısı, kültürel anlam) ve `"JSON İndir"`.

### 5.3. Dijital Arşiv (`ArchiveGallery.tsx`, `ArtworkModal.tsx`, `ColorMeaningsGrid.tsx`, `ColorMeaningModal.tsx`)
- **İki Alt Sekme:**
  1. **Sanat Eserleri Kataloğu (205 Eser):** Metin araması (başlık, sanatçı, dönem, renk adı, HEX), sanatçı seçimi, dönem/departman seçimi, renk ailesi ve sıcaklık filtresi sunar. Ayrıca üst kısımda toplam/hazır/bekleyen/başarısız sayaçlarını gösteren yönetim paneli yer alır.
     - Paleti bekleyen (**65** The Met) eserler için kart üzerinde `"Paleti oluştur"` veya toplu yönetim panelinde en fazla `2` eşzamanlı istekle çalışan, durdurulabilir `"Eksik paletleri oluştur"` seçeneği bulunur. CORS/ağ hatası durumunda sahte palet üretilmez; `"Görsel erişimi başarısız"` ve `"Tekrar dene"` durumu gösterilir.
  2. **Renk Aileleri & Kültürel Anlamlar (11 Renk):** 11 ana renk ailesi kartlarını listeler; `"Detay & Tarihçe"` ile kaynaklandırılmış kültürel anlam penceresini (`ColorMeaningModal`), `"Eserleri Gör"` ile ise doğrudan ilgili renk filtresi uygulanmış kataloğu açar.
- **Eser Detay Modalı (`ArtworkModal.tsx`):** Eserin yüksek çözünürlüklü önizlemesini, renk spektrumunu, renk kartlarını, tüm müze metadata alanlarını (sanatçı, tarih, teknik, boyut, kurum, envanter no, lisans), JSON indirme butonunu, müze kaynak linkini ve `"Analizörde Aç"` aktarımını içerir.

### 5.4. Renk Arama (`SearchBar.tsx`)
- **Çok Modlu Girdi Senkronizasyonu:** Doğal renk seçici (`<input type="color">`), HEX girişi (`#RGB` / `#RRGGBB`), RGB girişi (`178, 172, 136` veya `rgb(...)`), Türkçe/İngilizce ad-etiket arama kutusu ve 8 hızlı test tonu birbirini anlık günceller.
- **13 Renk Ailesi Filtresi:** Sonuçları belirli bir renk ailesiyle daraltma imkânı verir.
- **Çift Katmanlı Çıktı:**
  - *Bölüm A (Renk Sözlüğü Sonuçları):* 368 sözlük rengi içinde CIEDE2000 (ΔE) mesafesine göre en yakın **10** rengi (ad aramasında **24**'e kadar) sıralar, benzerlik etiketi (*Birebir Eşleşme*, *Çok Yakın*, *Yakın Ton*, *Benzer*, *Uzak Ton*) ve kaynak bilgisini gösterir.
  - *Bölüm B (Arşivdeki Eser Eşleşmeleri):* Hedef renge en yakın baskın renge sahip analiz edilmiş müze eserlerini en düşük ΔE 2000 değerine göre sıralar; ilk 8 sonucu gösterir ve `"Tüm eşleşmeleri göster"` ile tüm eşleşmeleri açar.

### 5.5. İstatistikler (`Statistics.tsx`)
- **4 Ana Metrik Kartı:** İndekslenen Eser (`205` — analiz edilmiş ve bekleyen ayrımıyla), Toplam Renk Kümesi, Kromatik Çeşitlilik (`%`) ve Ağırlıklı Sıcaklık. Her kartta masaüstü hover, mobil dokunma ve klavye (`Tab` + `Enter`/`Space` + `Esc`) uyumlu `?` açıklama kutusu bulunur.
- **Dağılım Panelleri:** Göreli sıcaklık dağılım çubuğu (`Sıcak Yönelimli`, `Dengeli / Geçişli`, `Soğuk Yönelimli`, `Nötr Ağırlıklı`) + paletlerin ortalama alan payları + en baskın 5 renk ailesi frekans grafiği + koleksiyon dönem/tür dağılımı.

### 5.6. Proje Hakkında (`About.tsx`)
- Projenin vizyonu, 4 temel kullanım alanı, 4 aşamalı bilimsel iş akışı, Canvas K-Means++ ve CIELAB/CIEDE2000 metodolojisi, 8 temel yetenek özeti, açık erişim veri kaynakları/lisans atıfları ve teknik mimari bilgilerini içerir.

### 5.7. Yardım ve Kullanım Rehberi (`Help.tsx`)
- Uygulamayı ilk kez kullananlar için tasarlanmış görsel kullanım kılavuzudur. Üstte hızlı içindekiler çubuğu, 4 kartlı genel bakış, 4 adımlı oklu hızlı başlangıç diyagramı, açılır-kapanır modül rehberleri (etkileşimli 5–8 küme seçici, Yatay/Izgara karşılaştırması, `#B2AC88` açıklamalı renk kartı, mekânsal SVG diyagramı, JSON çıktısı örneği), Yardım vs. Hakkında farkı tablosu, 8 terimli görsel sözlük ve 9 maddelik erişilebilir SSS akordeonu sunar.

---

## 6. Algoritmik Altyapı ve Hesaplama Yöntemleri

1. **Piksel Örnekleme ve K-Means++ (`src/services/colorAnalyzer.ts`):**
   - Görsel bellek içinde en uzun kenarı `240 px` (`colorTemperatureRules.json` `maxCanvasDimensionPx`) olacak biçimde Canvas'a çizilir ve `2 px` adımla (`sampleStepPx: 2`) taranır.
   - `alpha < 128` olan saydam pikseller dışlanır.
   - Otomatik küme modunda örneklem parlaklık standart sapmasına ($\sigma_L$) göre `k` (`5`, `6` veya `7`) belirlenir; manuel seçimde `5–8` arası değer kullanılır.
   - Kümeleme sonrası `colorDistance < 16` olan aşırı yakın merkezler birleştirilir ve toplam yüzde `%100.0` olacak biçimde normalize edilir.

2. **CIELAB Dönüşümü ve CIEDE2000 / ΔE 2000 (`src/services/colorSearchService.ts`):**
   - 368 sözlük renginin CIELAB koordinatları modül yüklenirken bir kez bellekte hesaplanır (`INDEXED_COLORS`).
   - Adım sırası: `sRGB (0–255)` → Gamma doğrusallaştırma → `CIE XYZ (D65, 2°)` → `CIE L*a*b*`.
   - Renk farkı, Sharma, Wu & Dalal (2005) tarafından tanımlanan tam **CIEDE2000** ($k_L=k_C=k_H=1$) formülüyle hesaplanır.

3. **Göreli Sıcaklık ve Mekânsal Karşıtlık (`src/services/colorTemperatureService.ts`):**
   - **Nötr Kapısı:** `HSL S < 0.15`, `HSV S < 0.13`, `C*ab < 10.5` veya uç açıklık/düşük kroma koşullarında renk `nötr` (`warmthScore = 50`, düşük güven) sayılır ve kromatik ortalama hesabına katılmaz.
   - **Çok Boyutlu Skor (`0–100`):** Hue açısının sıcak kutba (`20°`) olan dairesel kosinüs polaritesi; `C*ab`, HSL/HSV doygunluğu, Lightness zarfı ve toprak/bej alt-ton moderasyonu ile modüle edilir.
   - **Mekânsal Komşuluk:** `240 px` örneklem ızgarasında yatay ve dikey 4-komşuluk sınırları sayılır; en az `8` ortak sınır örneğine ve en az `8` puan sıcaklık farkına sahip komşu küme çiftleri raporlanır (tam piksel segmentasyonu olmadığı özellikle belirtilir).

---

## 7. Gizlilik, Güvenlik ve Veri Saklama Politikası

ChromArchive, kişisel veri gizliliği ve istemci güvenliği ilkeleri üzerine kurulmuştur:

- **Kullanıcı Görselleri Arşivlenmez ve Sunucuya Gönderilmez:** Cihazdan yüklenen dosyalar (`FileReader`) ve canlı kamerayla çekilen fotoğraflar (`canvas.toDataURL`) yalnızca tarayıcı belleğinde (RAM) işlenir. Dijital arşive, `localStorage` alanına, `IndexedDB`'ye veya harici bir sunucuya kaydedilmez.
- **Eski Özel Kayıtların Otomatik Temizliği:** `archiveService.ts` içindeki `sanitizeLegacyUserItemsStorage` fonksiyonu, önceki sürümlerden kalmış olabilecek `chromarchive_user_items` içindeki özel kullanıcı kayıtlarını (`isCustom: true`, `data:`, `blob:`, `custom_*`, `USR-*`) uygulama açılışında otomatik olarak temizler.
- **Kamera İzni ve Donanım Yaşam Döngüsü:** Sayfa açılışında kamera asla otomatik başlatılmaz. Erişim yalnızca kullanıcı `"Kamerayı Aç"` butonuna bastığında, ses kapalı (`audio: false`) olarak ve yalnızca güvenli bağlamda (`HTTPS` veya `localhost`) istenir. Fotoğraf çekildiği anda, `"Kamerayı Kapat"` tıklandığında, analiz oturumu açıldığında veya kullanıcı başka sekmeye geçtiğinde tüm medya kanalları `MediaStreamTrack.stop()` ile kapatılır.
- **Müze Palet Önbelleği Sınırı:** Kalıcı `localStorage` anahtarı (`chromarchive_archive_palette_cache_v1`) yalnızca `objectId` veya `museumRecordId` sahibi resmi müze eserlerinin (`isCustom: false`) eksik palet çıkarımlarını saklar.
- **SSRF ve Proxy Güvenliği (`api/met-image.ts`):**
  - Yalnızca `GET` ve `OPTIONS` isteklerini kabul eder.
  - Sadece `https://images.metmuseum.org/CRDImages/` yol ön ekine izin verir; kimlik bilgisi içeren veya farklı alan adlarına/portlara giden URL'leri HTTP `403` ile reddeder.
  - En fazla `3` yönlendirmeyi (`redirect: 'manual'`) aynı alan adı kuralıyla doğrular, `15.000 ms` zaman aşımı uygular, `image/*` MIME tipini ve maksimum `18 MB` dosya boyutunu denetler.
- **HTTP Güvenlik Başlıkları (`vercel.json`):** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` ve `X-XSS-Protection: 1; mode=block` başlıkları tanımlıdır.

---

## 8. Proje Dosya Yapısı

```text
chromarchive/
├── api/
│   └── met-image.ts                        # The Met CRDImages için kısıtlı CORS proxy fonksiyonu
├── public/
│   ├── archive-data.json                   # 7 eserlik statik başlangıç arşiv kopyası
│   └── images/                             # Yerel başyapıt görselleri (11 JPG dosyası)
├── scripts/
│   ├── buildColorsDataset.mjs              # 368 renkli sözlük derleme betiği
│   ├── generateArchiveColorIndex.ts        # Arşiv renk indeksi üretim betiği
│   ├── generateCmaColorIndex.ts            # CMA renk indeksi üretim betiği
│   ├── resolveSeeds.mjs                    # Başlangıç tohum çözümleme betiği
│   ├── syncMetArchive.mjs                  # The Met Open Access senkronizasyon betiği
│   └── verificationReport.json             # 105 The Met eser doğrulama raporu
├── src/
│   ├── assets/images/                      # 7 yerel yüksek çözünürlüklü başyapıt görseli
│   ├── components/
│   │   ├── About.tsx                       # Proje vizyonu, metodoloji, kaynaklar ve mimari
│   │   ├── ArchiveGallery.tsx              # 205 eserlik katalog, filtreleme, tekil/toplu analiz
│   │   ├── ArtworkModal.tsx                # Eser detayları, metadata ve "Analizörde Aç" modalı
│   │   ├── ColorAnalysisInsights.tsx       # Sıcaklık araştırma dayanağı ve açık kaynak atıfları
│   │   ├── ColorHistoricalContextPanel.tsx # 368 sözlük + 38 pigment + kültürel anlam çekmecesi
│   │   ├── ColorMeaningModal.tsx           # 11 renk ailesi kültürel anlam detay modalı
│   │   ├── ColorMeaningsGrid.tsx           # 11 renk ailesi kart ızgarası
│   │   ├── ColorPalette.tsx                # Baskın palet görünümü, sıfırlama ve JSON indirme
│   │   ├── Footer.tsx                      # Kompakt kurumsal alt bilgi çubuğu
│   │   ├── Help.tsx                        # Görselleştirilmiş kapsamlı kullanım rehberi ve SSS
│   │   ├── HomeOverview.tsx                # Editoryal müze ana sayfası ve başyapıt seçicisi
│   │   ├── ImageUploader.tsx               # İki durumlu yükleyici, canlı kamera çekimi ve önayarlar
│   │   ├── Navbar.tsx                      # 3 bölgeli üst navigasyon ve mobil menü
│   │   ├── SearchBar.tsx                   # CIELAB / ΔE 2000 renk ve arşiv eseri arama motoru
│   │   ├── Statistics.tsx                  # Koleksiyon istatistikleri ve erişilebilir ? ipuçları
│   │   └── Toast.tsx                       # Erişilebilir bildirim bileşeni
│   ├── data/
│   │   ├── archive-additions-100-paintings.json # 100 CMA CC0 tablo kaydı
│   │   ├── archiveColorIndex.json          # 140 ön-indeksli eser paleti (40 Met + 100 CMA)
│   │   ├── archiveData.backup.json         # 18 eserlik yedek The Met verisi
│   │   ├── archiveData.json                # 105 The Met Open Access kaydı
│   │   ├── colorMeanings.json              # 11 ana renk ailesi ve 12 kaynak kaydı
│   │   ├── colorTemperatureRules.json      # Göreli sıcaklık kuralları (multi-factor-warm-cool-v2)
│   │   ├── colors.json                     # 368 açık erişimli adlandırılmış renk sözlüğü
│   │   ├── historicalPigments.json         # 38 tarihsel pigment, 13 aile, 40 kaynak kaydı
│   │   └── warmCoolResearchReference.json  # Manalansan et al. (2025) 20 satırlık özet referans
│   ├── services/
│   │   ├── archivePaletteService.ts        # Tekil ve maks. 2 eşzamanlı arşiv piksel analiz servisi
│   │   ├── archiveService.ts               # Katalog birleştirme, önbellek, temizlik ve istatistikler
│   │   ├── colorAnalyzer.ts                # HTML5 Canvas + K-Means++ piksel motoru
│   │   ├── colorMeaningsService.ts         # Kültürel renk anlamları ve tarihsel eşleme servisi
│   │   ├── colorSearchService.ts           # CIELAB dönüşümü ve CIEDE2000 (ΔE) arama motoru
│   │   ├── colorTemperatureService.ts      # 0–100 çok boyutlu sıcaklık skoru ve komşuluk motoru
│   │   └── historicalPigmentsService.ts    # 38 tarihsel pigment yakınlık ve tehlike uyarı servisi
│   ├── styles/
│   │   └── style.css                       # Müze editoryal teması ve duyarlı stiller
│   ├── types/
│   │   └── index.ts                        # Tüm TypeScript arayüz ve tip tanımları
│   ├── App.tsx                             # Ana SPA orkestrasyonu ve durum yönetimi
│   ├── index.css                           # Tailwind CSS v4 giriş dosyası
│   └── main.tsx                            # React 19 kök giriş noktası
├── .env.example                            # Ortam değişkeni şablonu
├── .nvmrc                                  # Sabitlenmiş Node.js sürümü (22.12.0)
├── index.html                              # HTML5 kabuğu, meta etiketleri ve Google Fonts
├── metadata.json                           # Uygulama adı ve yetenek tanımları
├── package.json                            # Bağımlılıklar ve npm betikleri
├── tsconfig.json                           # TypeScript Strict yapılandırması
├── vercel.json                             # Vercel SPA rewrite ve güvenlik başlıkları
├── vite.config.ts                          # Vite yapılandırması ve /api/met-image dev eklentisi
└── README.md                               # Proje dokümantasyonu
```

---

## 9. Yerel Kurulum ve Vercel Dağıtımı

### 9.1. Sistem Gereksinimleri
- **Node.js:** `>=20.19.0` veya `>=22.12.0` (`.nvmrc` dosyasında `22.12.0` tanımlıdır)
- **npm**

### 9.2. Yerel Geliştirme Adımları

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

### 9.3. Vercel Dağıtımı
Proje kök dizindeki `vercel.json` yapılandırması ile doğrudan Vercel üzerinde yayına hazırdır:
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Yönlendirme Kuralı (`rewrites`):** `"/((?!api/).*)" -> "/index.html"` kuralı sayesinde `/api/met-image` sunucu fonksiyonu korunurken diğer tüm arayüz rotaları SPA kabuğuna yönlendirilir.

---

## 10. Sonuç ve Değerlendirme

ChromArchive, başlangıçtaki klasik bir *"görselden renk çıkarma"* fikrinden yola çıkarak; bilgisayarlı görü, renk bilimi (kolorimetri), dijital kültürel miras ve küratöryel bilgi yönetimini bir araya getiren bütüncül bir akademik ve teknik platforma dönüşmüştür.

### Projenin Son Hâlinin Güçlü Yönleri
1. **Bilimsel Tutarlılık ve Şeffaflık:** Kümelemede insan retinası ağırlıklı RGB mesafesi, renk aramada ise algısal eşitliğe dayanan CIELAB (D65) ve CIEDE2000 (ΔE 2000) metriği kullanılmıştır. Göreli sıcaklık puanlaması fiziksel Kelvin değeri olarak sunulmamış; piksel renginin kimyasal pigment teşhisi olmadığı ve mekânsal komşulukların örneklem tabanlı olduğu arayüzde açıkça belirtilmiştir.
2. **Gerçek ve Doğrulanmış Veri Ekosistemi:** *The Met* (`105`) ve *Cleveland Museum of Art* (`100`) koleksiyonlarından tekilleştirilen `205` kamu malı eser, `368` açık kaynaklı sözlük rengi, `38` tarihsel pigment kaydı ve `11` kültürel renk ailesi tamamen belgelenmiş, telifsiz veya CC lisanslı kaynaklara dayandırılmıştır. Eksik paletli `65` eser için sahte veri üretilmemiş, gerçek piksel analizi ve kalıcı önbellek mekanizması geliştirilmiştir.
3. **Gizlilik Öncelikli Mimari:** Kullanıcı görsellerinin ve kamera çekimlerinin yalnızca tarayıcı belleğinde işlenmesi, eski özel kayıtların otomatik temizlenmesi, kamera donanımının yaşam döngüsü boyunca sıkı biçimde kapatılması ve `/api/met-image` ucunun yalnızca The Met `CRDImages` alan adına kilitlenmesi güvenli tasarım yaklaşımını yansıtır.
4. **Kullanıcı Deneyimi ve Erişilebilirlik:** Ana sayfanın editoryal vitrin olarak ayrılması, iki durumlu analiz ekranı, istatistiklerde çoklu etkileşimli `?` ipuçları ve kapsamlı görselleştirilmiş Yardım sayfası sayesinde proje hem uzman araştırmacılara hem de ilk kez kullanan öğrencilere hitap eden olgun bir son ürün hâline gelmiştir.
