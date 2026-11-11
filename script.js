/**
 * @file script.js
 * @description ChromArchive: Yapay Zekâ Destekli Görsel Renk Analizi ve Dijital Arşiv Sistemi
 * Tamamen istemci taraflı (Vanilla JS + HTML5 Canvas API + LocalStorage) statik web uygulaması.
 */

// ==========================================================================
// 1. ÖRNEK AÇIK ERİŞİMLİ DİJİTAL ARŞİV VERİ SETİ (DEMO / OFFLINE FALLBACK)
// ==========================================================================
const DEFAULT_ARCHIVE_DATA = [
  {
    id: "art-001",
    title: "Süt Döken Kadın (The Milkmaid)",
    artist: "Johannes Vermeer (1632–1675)",
    date: "yaklaşık 1658–1660",
    period: "Hollanda Altın Çağı / Barok",
    institution: "The Metropolitan Museum of Art (The Met Open Access)",
    accessionNumber: "ACC. 25.110.24",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/437881",
    license: "Açık Erişim / Public Domain (CC0)",
    medium: "Tuval üzerine yağlıboya",
    dimensions: "45.5 × 41 cm",
    description: "Doğal yan pencere ışığının süt döken kadının figürüne vurduğu, doğal lapis lazuli (ultramarin mavisi) kumaş ile hardal sarısı ceketin oluşturduğu dengeli chiaroscuro kompozisyonu.",
    imageUrl: "images/vermeer.jpg",
    dominantColors: [
      { hex: "#1E3A5F", rgb: [30, 58, 95], percentage: 28.5, name: "Prusya & Ultramarin Mavisi", family: "Mavi", temperature: "Soğuk" },
      { hex: "#D8A838", rgb: [216, 168, 56], percentage: 23.2, name: "Hardal Sarısı / Aşıboyası", family: "Sarı", temperature: "Sıcak" },
      { hex: "#D6CEBF", rgb: [214, 206, 191], percentage: 20.4, name: "Keten Beyazı / Alabaster", family: "Nötr", temperature: "Nötr" },
      { hex: "#8C3B24", rgb: [140, 59, 36], percentage: 15.1, name: "Pişmiş Toprak / Terracotta", family: "Kırmızı", temperature: "Sıcak" },
      { hex: "#2A231C", rgb: [42, 35, 28], percentage: 12.8, name: "Yanık Umber Kömürü", family: "Nötr", temperature: "Nötr" }
    ],
    overallTemperature: "Dengeli",
    dominantCount: 5,
    analysisDate: "2026-03-12",
    colorDiversityScore: 86,
    fileFormat: "JPEG"
  },
  {
    id: "art-002",
    title: "Kanagawa Açıklarında Büyük Dalga (The Great Wave)",
    artist: "Katsushika Hokusai (1760–1849)",
    date: "yaklaşık 1830–1832",
    period: "Edo Dönemi / Ukiyo-e Baskı",
    institution: "The Metropolitan Museum of Art (The Met Open Access)",
    accessionNumber: "ACC. JP1847",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/45434",
    license: "Açık Erişim / Public Domain (CC0)",
    medium: "Ahşap kalıp baskı (washi kağıdı)",
    dimensions: "25.7 × 37.8 cm",
    description: "Prusya mavisinin katmanlı tonlarıyla köpüklerin tebeşir beyazının tezat oluşturduğu, arka plandaki Fuji Dağı ile okyanusun devasa dinamizmini birleştiren ikonik şaheser.",
    imageUrl: "images/hokusai.jpg",
    dominantColors: [
      { hex: "#16325C", rgb: [22, 50, 92], percentage: 34.2, name: "Derin İndigo / Prusya Mavisi", family: "Mavi", temperature: "Soğuk" },
      { hex: "#3E74A6", rgb: [62, 116, 166], percentage: 24.6, name: "Okyanus Dalgası Mavisi", family: "Mavi", temperature: "Soğuk" },
      { hex: "#EDE5D3", rgb: [237, 229, 211], percentage: 21.8, name: "Antik Washi Kağıdı Beji", family: "Nötr", temperature: "Nötr" },
      { hex: "#BFA57A", rgb: [191, 165, 122], percentage: 11.5, name: "Bambu & Kıyı Kumu", family: "Sarı", temperature: "Sıcak" },
      { hex: "#F4F7F6", rgb: [244, 247, 246], percentage: 7.9, name: "Köpük Beyazı", family: "Nötr", temperature: "Nötr" }
    ],
    overallTemperature: "Soğuk",
    dominantCount: 5,
    analysisDate: "2026-03-14",
    colorDiversityScore: 79,
    fileFormat: "JPEG"
  },
  {
    id: "art-003",
    title: "Nilüferler ve Japon Köprüsü (Water Lilies / Nymphéas)",
    artist: "Claude Monet (1840–1926)",
    date: "1899",
    period: "Fransız İzlenimciliği (Impressionism)",
    institution: "The Metropolitan Museum of Art (The Met Open Access)",
    accessionNumber: "ACC. 1983.532",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/437135",
    license: "Açık Erişim / Public Domain (CC0)",
    medium: "Tuval üzerine yağlıboya",
    dimensions: "89.5 × 116.3 cm",
    description: "Giverny göletinin dingin sularında ışığın sürekli titreşimi; adaçayı yeşilleri, su mavileri ve nilüfer yapraklarının pembe-eflatun yansımalarıyla örülmüş atmosferik bir renk senfonisi.",
    imageUrl: "images/monet.jpg",
    dominantColors: [
      { hex: "#5D8A74", rgb: [93, 138, 116], percentage: 31.8, name: "Nilüfer Adaçayı Yeşili", family: "Yeşil", temperature: "Soğuk" },
      { hex: "#8EA3BC", rgb: [142, 163, 188], percentage: 25.1, name: "Gölet Sis Mavisi", family: "Mavi", temperature: "Soğuk" },
      { hex: "#B6A1C4", rgb: [182, 161, 196], percentage: 18.7, name: "Lavanta Menekşesi", family: "Mor", temperature: "Soğuk" },
      { hex: "#D8C5BC", rgb: [216, 197, 188], percentage: 14.2, name: "Pudra Pembe / Nilüfer Çiçeği", family: "Kırmızı", temperature: "Sıcak" },
      { hex: "#3E5743", rgb: [62, 87, 67], percentage: 10.2, name: "Söğüt Koyu Yeşili", family: "Yeşil", temperature: "Nötr" }
    ],
    overallTemperature: "Soğuk",
    dominantCount: 5,
    analysisDate: "2026-03-10",
    colorDiversityScore: 82,
    fileFormat: "JPEG"
  },
  {
    id: "art-004",
    title: "Elmalar ve Sürahi ile Natürmort (Still Life with Apples)",
    artist: "Paul Cézanne (1839–1906)",
    date: "yaklaşık 1890–1894",
    period: "Post-İzlenimcilik (Post-Impressionism)",
    institution: "The Metropolitan Museum of Art (The Met Open Access)",
    accessionNumber: "ACC. 1997.149.9",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/435882",
    license: "Açık Erişim / Public Domain (CC0)",
    medium: "Tuval üzerine yağlıboya",
    dimensions: "58.4 × 73 cm",
    description: "Geometrik fırça darbeleriyle kurulan formlar; topraktan yapılmış sırlı sarı sürahi, bordo kırmızısı elmalar ve zeytin yeşili meyvelerin kütlesel hacimleri.",
    imageUrl: "images/cezanne.jpg",
    dominantColors: [
      { hex: "#C98835", rgb: [201, 136, 53], percentage: 30.5, name: "Toprak Sürahi Aşıboyası", family: "Sarı", temperature: "Sıcak" },
      { hex: "#8A242B", rgb: [138, 36, 43], percentage: 22.3, name: "Olgun Elma Bordo Kırmızısı", family: "Kırmızı", temperature: "Sıcak" },
      { hex: "#5E6C38", rgb: [94, 108, 56], percentage: 18.9, name: "Meyve Zeytin Yeşili", family: "Yeşil", temperature: "Sıcak" },
      { hex: "#E3DCD0", rgb: [227, 220, 208], percentage: 16.1, name: "Keten Örtü Tebeşir Beyazı", family: "Nötr", temperature: "Nötr" },
      { hex: "#3D2A1C", rgb: [61, 42, 28], percentage: 12.2, name: "Koyu Meşe Gölgesi", family: "Nötr", temperature: "Nötr" }
    ],
    overallTemperature: "Sıcak",
    dominantCount: 5,
    analysisDate: "2026-03-08",
    colorDiversityScore: 88,
    fileFormat: "JPEG"
  },
  {
    id: "art-005",
    title: "Ayçiçekleri (Sunflowers / Tournesols)",
    artist: "Vincent van Gogh (1853–1890)",
    date: "1888",
    period: "Post-İzlenimcilik (Post-Impressionism)",
    institution: "National Gallery / The Met Ortak Arşiv (Open Access)",
    accessionNumber: "ACC. NG3863",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Vincent_Willem_van_Gogh_127.jpg",
    license: "Açık Erişim / Public Domain (CC0)",
    medium: "Tuval üzerine yağlıboya",
    dimensions: "92.1 × 73 cm",
    description: "Kadmiyum sarısının tüm spektrumu; kükürt sarısı taç yapraklarından toprak çömleğin terracotta rengine ve kurumuş yaprakların zeytin tonlarına kadar uzanan parlak bir ışık patlaması.",
    imageUrl: "images/vangogh.jpg",
    dominantColors: [
      { hex: "#E5A91E", rgb: [229, 169, 30], percentage: 38.6, name: "Kadmiyum Güneş Sarısı", family: "Sarı", temperature: "Sıcak" },
      { hex: "#A95E25", rgb: [169, 94, 37], percentage: 23.4, name: "Ayçiçeği Tohumu Aşıboyası", family: "Turuncu", temperature: "Sıcak" },
      { hex: "#6C652D", rgb: [108, 101, 45], percentage: 17.8, name: "Kuru Sap Zeytin Yeşili", family: "Yeşil", temperature: "Sıcak" },
      { hex: "#50301B", rgb: [80, 48, 27], percentage: 11.2, name: "Kavrulmuş Çömlek Toprağı", family: "Kırmızı", temperature: "Sıcak" },
      { hex: "#F2D77C", rgb: [242, 215, 124], percentage: 9.0, name: "Açık Çuha Sarısı", family: "Sarı", temperature: "Sıcak" }
    ],
    overallTemperature: "Sıcak",
    dominantCount: 5,
    analysisDate: "2026-03-05",
    colorDiversityScore: 76,
    fileFormat: "JPEG"
  },
  {
    id: "art-006",
    title: "Çalışma Odasında Bilgin (Scholar in his Study)",
    artist: "Rembrandt van Rijn (1606–1669)",
    date: "1652",
    period: "Hollanda Baroğu / Chiaroscuro",
    institution: "The Metropolitan Museum of Art (The Met Open Access)",
    accessionNumber: "ACC. 14.40.618",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/437397",
    license: "Açık Erişim / Public Domain (CC0)",
    medium: "Meşe panel üzerine yağlıboya",
    dimensions: "54.6 × 44.5 cm",
    description: "Yoğun chiaroscuro aydınlatma; vitraylı pencereden süzülen altın ışık huzmesi, bilginin bordo kadife cübbesini ve altın zincirini aydınlatırken çevredeki derin umber gölgelerle bir kontrast oluşturur.",
    imageUrl: "images/rembrandt.jpg",
    dominantColors: [
      { hex: "#1A1513", rgb: [26, 21, 19], percentage: 37.4, name: "Barok Kömür Karası / Gölge", family: "Nötr", temperature: "Nötr" },
      { hex: "#541B26", rgb: [84, 27, 38], percentage: 22.8, name: "Kadife Nar Bordo", family: "Kırmızı", temperature: "Sıcak" },
      { hex: "#A87A38", rgb: [168, 122, 56], percentage: 18.5, name: "Altın Varak / Kehribar Işığı", family: "Sarı", temperature: "Sıcak" },
      { hex: "#5C412C", rgb: [92, 65, 44], percentage: 12.1, name: "Eski Meşe Cilası", family: "Nötr", temperature: "Nötr" },
      { hex: "#E0C99E", rgb: [224, 201, 158], percentage: 9.2, name: "Parşömen Sarısı", family: "Sarı", temperature: "Sıcak" }
    ],
    overallTemperature: "Sıcak",
    dominantCount: 5,
    analysisDate: "2026-03-01",
    colorDiversityScore: 81,
    fileFormat: "JPEG"
  },
  {
    "id": "art-007",
    "title": "Mona Lisa (La Gioconda)",
    "artist": "Leonardo da Vinci (1452–1519)",
    "date": "yaklaşık 1503–1519",
    "period": "Yüksek Rönesans (High Renaissance)",
    "institution": "Musée du Louvre / Açık Erişim (Open Access)",
    "accessionNumber": "INV. 779",
    "sourceUrl": "https://collections.louvre.fr/en/ark:/53355/cl010062370",
    "license": "Açık Erişim / Public Domain (CC0)",
    "medium": "Kavak panel üzerine yağlıboya (Sfumato)",
    "dimensions": "77 × 53 cm",
    "description": "Leonardo da Vinci'nin sfumato tekniğinin zirvesi; keskin çizgilerin duman gibi kaybolduğu, koyu zeytin yeşili ve koyu umber elbise tonları, sıcak kehribar-fildişi ten nüansı ve arka plandaki puslu su-hava mavisi arasındaki chiaroscuro dengesi.",
    "imageUrl": "images/monalisa.jpg",
    "dominantColors": [
      { "hex": "#1C1713", "rgb": [28, 23, 19], "percentage": 31.5, "name": "Derin Sfumato Kömürü", "family": "Nötr", "temperature": "Nötr" },
      { "hex": "#3E3829", "rgb": [62, 56, 41], "percentage": 24.2, "name": "Koyu Zeytin / İtalyan Kadife", "family": "Yeşil", "temperature": "Nötr" },
      { "hex": "#846E4A", "rgb": [132, 110, 74], "percentage": 18.6, "name": "Aşıboyası / Sfumato Amberi", "family": "Sarı", "temperature": "Sıcak" },
      { "hex": "#5D6F76", "rgb": [93, 111, 118], "percentage": 13.8, "name": "Puslu Gölet & Alp Mavisi", "family": "Mavi", "temperature": "Soğuk" },
      { "hex": "#D2BA98", "rgb": [210, 186, 152], "percentage": 11.9, "name": "Sıcak Fildişi Ten Nüansı", "family": "Sarı", "temperature": "Sıcak" }
    ],
    "overallTemperature": "Dengeli",
    "dominantCount": 5,
    "analysisDate": "2026-03-15",
    "colorDiversityScore": 85,
    "fileFormat": "JPEG"
  }
];

// ==========================================================================
// 2. UYGULAMA DURUM YÖNETİMİ (STATE)
// ==========================================================================
const AppState = {
  archiveItems: [],
  currentAnalysis: null,
  currentImageElement: null,
  currentImageSrc: null,
  currentImageMeta: {},
  analysisClusterCount: "auto", // 'auto' | 5 | 6 | 7 | 8
  paletteViewMode: "horizontal", // 'horizontal' | 'grid'
  activeSection: "home",
  archiveFilterCategory: "all",
  archiveFilterTemperature: "all",
  archiveSearchQuery: "",
  activeModalItem: null
};

// ==========================================================================
// 3. RENK TEORİSİ VE SINIFLANDIRMA MOTORU (COLOR ENGINE)
// ==========================================================================

/**
 * RGB değerlerini HEX koduna çevirir.
 */
function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * HEX kodunu RGB dizisine çevirir.
 */
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean, 16);
  if (isNaN(bigint)) return [0, 0, 0];
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

/**
 * RGB'den HSL değerlerini hesaplar.
 */
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // akromatik / gri
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

/**
 * İki RGB renk arasındaki algısal mesafeyi (Ağırlıklı Öklid - Delta E yaklaşımı) hesaplar.
 */
function colorDistance(rgb1, rgb2) {
  const rMean = (rgb1[0] + rgb2[0]) / 2;
  const rDiff = rgb1[0] - rgb2[0];
  const gDiff = rgb1[1] - rgb2[1];
  const bDiff = rgb1[2] - rgb2[2];
  const weightR = 2 + rMean / 256;
  const weightG = 4.0;
  const weightB = 2 + (255 - rMean) / 256;
  return Math.sqrt(weightR * rDiff * rDiff + weightG * gDiff * gDiff + weightB * bDiff * bDiff);
}

/**
 * Rengin sıcak, soğuk veya nötr sınıfını yaklaşık olarak belirler.
 */
function determineTemperature(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b);

  // Çok düşük doygunluk veya aşırı uç parlaklık nötr sayılır
  if (s < 0.16 || l < 0.10 || l > 0.90) {
    return "Nötr";
  }

  // Renk çarkı açısına göre sınıflandırma
  // Kırmızı, Turuncu, Sarı: 0° - 65° ve 330° - 360° (Sıcak)
  // Yeşil / Sarı-Yeşil: 65° - 150° (Dengeli / Sıcak-Nötr)
  // Mavi, Camgöbeği, Mor: 150° - 290° (Soğuk)
  // Eflatun / Pembe: 290° - 330° (Sıcak)
  if (h >= 330 || h <= 65) {
    return "Sıcak";
  } else if (h > 65 && h < 150) {
    return (s > 0.4 && h < 100) ? "Sıcak" : "Nötr";
  } else if (h >= 150 && h <= 290) {
    return "Soğuk";
  } else {
    return "Sıcak";
  }
}

/**
 * Türkçe renk adını ve renk ailesini yaklaşık olarak belirler.
 */
function determineColorNameAndFamily(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b);

  if (l < 0.15) {
    return { name: "Kömür Karası / Gece", family: "Nötr" };
  }
  if (l > 0.88 && s < 0.18) {
    return { name: "Tebeşir / Alabaster Beyazı", family: "Nötr" };
  }
  if (s < 0.15) {
    if (l < 0.4) return { name: "Antrasit Grisi", family: "Nötr" };
    if (l < 0.7) return { name: "Küllü Müze Grisi", family: "Nötr" };
    return { name: "Kırık Parşömen Beji", family: "Nötr" };
  }

  // Renk aileleri
  if (h >= 350 || h < 15) {
    if (l < 0.35) return { name: "Bordo / Koyu Karmin", family: "Kırmızı" };
    if (s > 0.6) return { name: "Kırmızı Lal / Kadmiyum", family: "Kırmızı" };
    return { name: "Pişmiş Toprak / Terracotta", family: "Kırmızı" };
  }
  if (h >= 15 && h < 45) {
    if (l < 0.35) return { name: "Yanık Umber / Kahve", family: "Turuncu" };
    if (s > 0.6) return { name: "Aşıboyası / Sıcak Amber", family: "Turuncu" };
    return { name: "Toprak Kahverengisi", family: "Turuncu" };
  }
  if (h >= 45 && h < 70) {
    if (l < 0.45) return { name: "Hardal / Antik Altın", family: "Sarı" };
    return { name: "Güneş / Kadmiyum Sarısı", family: "Sarı" };
  }
  if (h >= 70 && h < 165) {
    if (l < 0.35) return { name: "Zeytin / Koyu Orman Yeşili", family: "Yeşil" };
    if (s < 0.4) return { name: "Adaçayı / Nilüfer Yeşili", family: "Yeşil" };
    return { name: "Zümrüt Yeşili", family: "Yeşil" };
  }
  if (h >= 165 && h < 260) {
    if (l < 0.28) return { name: "Prusya / Derin İndigo", family: "Mavi" };
    if (s < 0.45) return { name: "Sisli Gölet Mavisi", family: "Mavi" };
    return { name: "Ultramarin / Okyanus Mavisi", family: "Mavi" };
  }
  if (h >= 260 && h < 315) {
    if (l < 0.35) return { name: "Mürdüm / Gece Menekşesi", family: "Mor" };
    return { name: "Lavanta Moru", family: "Mor" };
  }
  return { name: "Gül Kurusu / Pudra Pembe", family: "Kırmızı" };
}

// ==========================================================================
// 4. JAVASCRIPT & CANVAS API İLE PİKSEL RENK ANALİZİ
// ==========================================================================

/**
 * Bir görselin gerçek piksel verilerini Canvas API ile okur ve
 * K-Means++ renk kümeleme algoritmasıyla en baskın 5-8 rengini tespit eder.
 * Mona Lisa ve karmaşık sanatsal kompozisyonlardaki chiaroscuro, sfumato ve ince ton geçişlerini doğru gruplar.
 *
 * @param {HTMLImageElement} imgElement - Analiz edilecek HTML görsel elementi
 * @param {string|number} requestedK - Hedef küme sayısı ('auto' veya 5, 6, 7, 8)
 * @returns {Object} Analiz sonucu (baskın renkler, sıcaklık, çeşitlilik vb.)
 */
function analyzeImagePixelsWithCanvas(imgElement, requestedK = "auto") {
  // 1. Görsel doğrulama ve Canvas hazırlığı
  if (!imgElement || !imgElement.complete || (imgElement.naturalWidth === 0 && imgElement.width === 0)) {
    throw new Error("Görsel yüklenemedi veya geçerli piksel verisi bulunamadı.");
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Tarayıcıda Canvas 2D bağlamı oluşturulamadı.");
  }

  // 2. Performans ve temsiliyet optimizasyonu: En fazla 240x240 örnekleme
  const maxDimension = 240;
  let width = imgElement.naturalWidth || imgElement.width || 300;
  let height = imgElement.naturalHeight || imgElement.height || 300;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.max(1, Math.round((height * maxDimension) / width));
      width = maxDimension;
    } else {
      width = Math.max(1, Math.round((width * maxDimension) / height));
      height = maxDimension;
    }
  }

  canvas.width = width;
  canvas.height = height;

  try {
    ctx.drawImage(imgElement, 0, 0, width, height);
  } catch (err) {
    throw new Error("Görsel Canvas üzerine aktarılırken hata oluştu: " + err.message);
  }

  let imageData;
  try {
    imageData = ctx.getImageData(0, 0, width, height);
  } catch (err) {
    throw new Error("Canvas piksel verisi okunamadı (CORS veya güvenlik engeli): " + err.message);
  }

  const data = imageData.data;
  const pixels = [];
  const step = 2; // Her 2 pikselde bir örnekleme (~14.400 piksel)

  for (let i = 0; i < data.length; i += 4 * step) {
    const alpha = data[i + 3];
    if (alpha < 128) continue; // Saydam pikselleri analiz dışı bırak
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  if (pixels.length === 0) {
    throw new Error("Görselde analiz edilecek geçerli renk pikseli bulunamadı.");
  }

  // 3. Küme Sayısını (K) Belirleme (5 ile 8 arası)
  let k = 6;
  if (requestedK === "auto") {
    // Görselin parlaklık ve renk dağılım varyansını örnekle
    const sampleSize = Math.min(600, pixels.length);
    const stride = Math.floor(pixels.length / sampleSize);
    let sumL = 0;
    for (let i = 0; i < sampleSize; i++) {
      const p = pixels[i * stride];
      sumL += (0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]);
    }
    const meanL = sumL / sampleSize;

    let varL = 0;
    for (let i = 0; i < sampleSize; i++) {
      const p = pixels[i * stride];
      const lum = (0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]);
      varL += (lum - meanL) * (lum - meanL);
    }
    const stdDev = Math.sqrt(varL / sampleSize);

    // Yüksek varyans / chiaroscuro / zengin sfumato tonları içeren eserlerde 7 veya 8 renk
    if (stdDev > 46) {
      k = 7;
    } else if (stdDev > 30) {
      k = 6;
    } else {
      k = 5;
    }
  } else {
    k = Math.max(5, Math.min(8, parseInt(requestedK, 10) || 6));
  }

  // 4. K-Means++ Merkez Başlatma (Centroid Seeding)
  // İlk merkezi medyan / orta alandan al
  const centroids = [];
  centroids.push([...pixels[Math.floor(pixels.length / 2)]]);

  // Sonraki merkezleri, mevcut merkezlere olan minimum mesafenin karesiyle orantılı seç
  for (let c = 1; c < k; c++) {
    const distances = new Float64Array(pixels.length);
    let sumDistSq = 0;

    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i];
      let minDist = Infinity;
      for (let j = 0; j < centroids.length; j++) {
        const d = colorDistance(p, centroids[j]);
        if (d < minDist) minDist = d;
      }
      const dSq = minDist * minDist;
      distances[i] = dSq;
      sumDistSq += dSq;
    }

    if (sumDistSq === 0) {
      centroids.push([...pixels[Math.floor(Math.random() * pixels.length)]]);
      continue;
    }

    const threshold = Math.random() * sumDistSq;
    let runningSum = 0;
    let chosenIdx = 0;
    for (let i = 0; i < pixels.length; i++) {
      runningSum += distances[i];
      if (runningSum >= threshold) {
        chosenIdx = i;
        break;
      }
    }
    centroids.push([...pixels[chosenIdx]]);
  }

  // 5. K-Means İteratif Yakınsama (10 İterasyon)
  const maxIterations = 10;
  const assignments = new Uint8Array(pixels.length);

  for (let iter = 0; iter < maxIterations; iter++) {
    const sumsR = new Float64Array(k);
    const sumsG = new Float64Array(k);
    const sumsB = new Float64Array(k);
    const counts = new Uint32Array(k);

    // Her pikseli algısal olarak en yakın kümeye ata
    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i];
      let bestDist = Infinity;
      let bestCluster = 0;

      for (let j = 0; j < k; j++) {
        const d = colorDistance(p, centroids[j]);
        if (d < bestDist) {
          bestDist = d;
          bestCluster = j;
        }
      }

      assignments[i] = bestCluster;
      sumsR[bestCluster] += p[0];
      sumsG[bestCluster] += p[1];
      sumsB[bestCluster] += p[2];
      counts[bestCluster]++;
    }

    // Yeni merkezleri hesapla
    let maxShift = 0;
    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        const newR = Math.round(sumsR[j] / counts[j]);
        const newG = Math.round(sumsG[j] / counts[j]);
        const newB = Math.round(sumsB[j] / counts[j]);
        const shift = Math.abs(centroids[j][0] - newR) + Math.abs(centroids[j][1] - newG) + Math.abs(centroids[j][2] - newB);
        if (shift > maxShift) maxShift = shift;
        centroids[j] = [newR, newG, newB];
      } else {
        // Boş kalan kümeyi en uzak pikselle yeniden konumlandır
        centroids[j] = [...pixels[Math.floor(Math.random() * pixels.length)]];
      }
    }

    if (maxShift < 2) break; // Hızlı yakınsama tamamlandı
  }

  // 6. Küme Ağırlıklarını Hesaplama ve Birbirine Çok Yakın Renkleri Birleştirme
  const finalCounts = new Uint32Array(k);
  for (let i = 0; i < pixels.length; i++) {
    finalCounts[assignments[i]]++;
  }

  let rawClusters = [];
  for (let j = 0; j < k; j++) {
    if (finalCounts[j] > 0) {
      rawClusters.push({
        rgb: centroids[j],
        count: finalCounts[j]
      });
    }
  }

  // Çok yakın merkezleri birleştir (Delta-E < 16)
  const clusters = [];
  for (const cl of rawClusters) {
    let merged = false;
    for (const m of clusters) {
      if (colorDistance(cl.rgb, m.rgb) < 16) {
        m.count += cl.count;
        merged = true;
        break;
      }
    }
    if (!merged) {
      clusters.push({ ...cl });
    }
  }

  // Kullanım oranına göre azalan sırada sırala
  clusters.sort((a, b) => b.count - a.count);

  const totalPixelsCount = clusters.reduce((sum, c) => sum + c.count, 0) || 1;

  const dominantColors = clusters.map((cluster) => {
    const rawPercent = (cluster.count / totalPixelsCount) * 100;
    const hex = rgbToHex(cluster.rgb[0], cluster.rgb[1], cluster.rgb[2]);
    const { name, family } = determineColorNameAndFamily(cluster.rgb[0], cluster.rgb[1], cluster.rgb[2]);
    const temperature = determineTemperature(cluster.rgb[0], cluster.rgb[1], cluster.rgb[2]);

    return {
      hex,
      rgb: [cluster.rgb[0], cluster.rgb[1], cluster.rgb[2]],
      rgbString: `rgb(${cluster.rgb[0]}, ${cluster.rgb[1]}, ${cluster.rgb[2]})`,
      percentage: parseFloat(rawPercent.toFixed(1)),
      name,
      family,
      temperature
    };
  });

  // Yüzdelerin toplamını tam %100'e normalize et
  const sumPercent = dominantColors.reduce((acc, c) => acc + c.percentage, 0);
  if (dominantColors.length > 0 && Math.abs(sumPercent - 100) > 0.01) {
    dominantColors[0].percentage = parseFloat((dominantColors[0].percentage + (100 - sumPercent)).toFixed(1));
  }

  // Genel Renk Sıcaklığı Hesapla
  let warmScore = 0;
  let coolScore = 0;
  dominantColors.forEach((c) => {
    if (c.temperature === "Sıcak") warmScore += c.percentage;
    if (c.temperature === "Soğuk") coolScore += c.percentage;
  });

  let overallTemperature = "Dengeli";
  if (warmScore > 55) overallTemperature = "Sıcak Ağırlıklı";
  else if (coolScore > 55) overallTemperature = "Soğuk Ağırlıklı";
  else if (warmScore > coolScore + 12) overallTemperature = "Sıcak / Ilık Nüanslı";
  else if (coolScore > warmScore + 12) overallTemperature = "Soğuk / Serin Nüanslı";

  // Renk Çeşitlilik Endeksi (0-100)
  let totalPairwiseDist = 0;
  let pairCount = 0;
  for (let i = 0; i < dominantColors.length; i++) {
    for (let j = i + 1; j < dominantColors.length; j++) {
      totalPairwiseDist += colorDistance(dominantColors[i].rgb, dominantColors[j].rgb);
      pairCount++;
    }
  }
  const avgDist = pairCount > 0 ? totalPairwiseDist / pairCount : 150;
  const colorDiversityScore = Math.min(100, Math.max(30, Math.round((avgDist / 380) * 100)));

  return {
    dominantColors,
    overallTemperature,
    colorDiversityScore,
    clusterCountUsed: dominantColors.length,
    analyzedPixels: pixels.length,
    sampleResolution: `${width}×${height} px`
  };
}

// ==========================================================================
// 5. TOAST VE ARAYÜZ YARDIMCILARI
// ==========================================================================

function showToast(message, duration = 3000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Panoya HEX kodu kopyalar ve kullanıcıya toast bildirimi gösterir.
 */
function copyHexToClipboard(hex) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(hex).then(() => {
      showToast(`${hex} panoya kopyalandı!`);
    }).catch(() => {
      prompt("Renk kodunu kopyalayın:", hex);
    });
  } else {
    prompt("Renk kodunu kopyalayın:", hex);
  }
}

// ==========================================================================
// 6. GÖRSEL ANALİZ ARAYÜZÜ İŞLEMLERİ (K-MEANS YÖNETİMİ)
// ==========================================================================

function handleFileSelection(file) {
  if (!file) return;

  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type.toLowerCase())) {
    showToast("Hata: Yalnızca JPG, PNG veya WEBP formatları desteklenmektedir.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    processImageForAnalysis(dataUrl, {
      title: file.name.replace(/\.[^/.]+$/, ""),
      format: file.type.split("/")[1].toUpperCase(),
      size: `${(file.size / 1024).toFixed(1)} KB`,
      isCustom: true
    });
  };
  reader.onerror = function() {
    showToast("Hata: Dosya okunurken bir sorun oluştu.");
  };
  reader.readAsDataURL(file);
}

/**
 * Yeni bir görseli analiz eder. Önceki analizi sıfırlar, yüklenme durumunu gösterir,
 * Canvas API ile pikselleri K-Means algoritmasıyla gruplar.
 */
function processImageForAnalysis(imageSrc, meta = {}) {
  const previewImg = document.getElementById("analysisPreviewImg");
  const previewContainer = document.getElementById("previewContainer");
  const resultsContainer = document.getElementById("analysisResultsContainer");
  const loadingState = document.getElementById("analysisLoadingState");

  // 1. Önceki analizi tamamen temizle ve yüklenme durumuna geç
  AppState.currentAnalysis = null;
  AppState.currentImageSrc = imageSrc;
  AppState.currentImageMeta = meta;

  if (resultsContainer) resultsContainer.style.display = "none";
  if (loadingState) loadingState.style.display = "flex";

  // Konteyner içeriklerini temizle
  const distBar = document.getElementById("analysisDistributionBar");
  const horizList = document.getElementById("analysisPaletteHorizontal");
  const cardsGrid = document.getElementById("analysisPaletteCards");
  const jsonPre = document.getElementById("analysisJsonPre");

  if (distBar) distBar.innerHTML = "";
  if (horizList) horizList.innerHTML = "";
  if (cardsGrid) cardsGrid.innerHTML = "";
  if (jsonPre) jsonPre.textContent = "";

  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onerror = function() {
    if (loadingState) loadingState.style.display = "none";
    showToast("Görsel yüklenemedi. Lütfen geçerli bir JPG, PNG veya WEBP dosyası deneyin.");
  };

  img.onload = function() {
    AppState.currentImageElement = img;

    // Tarayıcının yüklenme animasyonunu işlemesi için kısa gecikmeyle analizi başlat
    setTimeout(() => {
      try {
        const clusterCount = AppState.analysisClusterCount || "auto";
        const analysis = analyzeImagePixelsWithCanvas(img, clusterCount);

        // Metadata nesnesini hazırla
        AppState.currentAnalysis = {
          id: "usr-" + Date.now(),
          title: meta.title || "Kullanıcı Görseli",
          artist: meta.artist || "Bilinmiyor / Kullanıcı Yüklemesi",
          date: meta.date || new Date().toLocaleDateString("tr-TR"),
          period: meta.period || "Modern / Dijital Koleksiyon",
          institution: meta.institution || "Kişisel Arşiv",
          accessionNumber: "USR-" + Math.floor(Math.random() * 90000 + 10000),
          sourceUrl: meta.sourceUrl || "Yerel Yükleme (İstemci Taraflı Analiz)",
          license: "Kullanıcıya Ait / İstemci Analizi",
          medium: "Dijital Görsel",
          dimensions: `${img.naturalWidth || img.width} × ${img.naturalHeight || img.height} px`,
          description: "ChromArchive K-Means kümeleme motoru tarafından hesaplanan gerçek piksel renk paleti.",
          imageUrl: imageSrc,
          dominantColors: analysis.dominantColors,
          overallTemperature: analysis.overallTemperature,
          dominantCount: analysis.dominantColors.length,
          analysisDate: new Date().toISOString().split("T")[0],
          colorDiversityScore: analysis.colorDiversityScore,
          fileFormat: meta.format || "JPEG"
        };

        // Önizleme görüntüsünü ve meta şeridini güncelle
        if (previewImg) previewImg.src = imageSrc;
        if (previewContainer) previewContainer.classList.add("active");

        const metaStrip = document.getElementById("previewMetaStrip");
        if (metaStrip) {
          metaStrip.textContent = `${AppState.currentAnalysis.title} · ${AppState.currentAnalysis.dimensions} · ${AppState.currentAnalysis.dominantCount} Baskın Renk (K-Means)`;
        }

        // Yüklenme durumunu kapat, sonuç panelini göster
        if (loadingState) loadingState.style.display = "none";
        if (resultsContainer) resultsContainer.style.display = "flex";

        // Sonuçları DOM'a aktar
        renderAnalysisResults(AppState.currentAnalysis);
        showToast(`K-Means ile ${AppState.currentAnalysis.dominantCount} baskın renk başarıyla gruplandı.`);
      } catch (err) {
        if (loadingState) loadingState.style.display = "none";
        console.error("Renk analizi sırasında hata:", err);
        showToast("Hata: " + err.message);
      }
    }, 40);
  };

  img.src = imageSrc;
}

/**
 * K-Means renk analizi çıktılarını arayüzde hem yatay renk kartları hem skala hem de ızgara olarak gösterir.
 */
function renderAnalysisResults(analysisData) {
  if (!analysisData || !analysisData.dominantColors) return;

  const colors = analysisData.dominantColors;

  // 1. Genel Renk Dağılım Skalası (Proportional Spectrum Bar)
  const barContainer = document.getElementById("analysisDistributionBar");
  if (barContainer) {
    barContainer.innerHTML = colors.map(c => `
      <div class="palette-segment" 
           style="width: ${c.percentage}%; background-color: ${c.hex};" 
           title="${c.name} (${c.hex}) - %${c.percentage} - ${c.rgbString}"
           onclick="copyHexToClipboard('${c.hex}')">
      </div>
    `).join("");
  }

  // 2. Yatay Renk Kartları Listesi (Öncelikli Gerçek Renk Paleti)
  const horizContainer = document.getElementById("analysisPaletteHorizontal");
  if (horizContainer) {
    horizContainer.innerHTML = colors.map(c => `
      <div class="horizontal-color-card" onclick="copyHexToClipboard('${c.hex}')" title="HEX kodunu kopyalamak için tıklayın">
        <div class="h-color-swatch" style="background-color: ${c.hex};">
          <span class="copy-badge">Kopyala</span>
        </div>

        <div class="h-color-info-group">
          <div class="h-color-hex-row">
            <span class="h-color-hex">${c.hex}</span>
            <span class="h-color-rgb">${c.rgbString}</span>
          </div>
          <div class="h-color-name-group">
            <span class="h-color-name">${c.name}</span>
            <span class="h-color-tags">· ${c.temperature} · ${c.family}</span>
          </div>
        </div>

        <div class="h-color-percentage-box">
          <span class="h-color-percent-number tabular-nums">%${c.percentage}</span>
          <div class="h-color-progress-track">
            <div class="h-color-progress-fill" style="width: ${Math.min(100, c.percentage * 2.2)}%; background-color: ${c.hex};"></div>
          </div>
        </div>

        <button class="h-color-copy-action" aria-label="Kopyala">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
    `).join("");
  }

  // 3. Kompakt Renk Kartları Izgarası (Grid View)
  const cardsGrid = document.getElementById("analysisPaletteCards");
  if (cardsGrid) {
    cardsGrid.innerHTML = colors.map(c => `
      <div class="color-card" onclick="copyHexToClipboard('${c.hex}')" title="Kopyalamak için tıkla">
        <div class="color-swatch-box" style="background-color: ${c.hex};">
          <span class="copy-badge">Kopyala</span>
        </div>
        <div class="color-card-body">
          <div class="color-hex">${c.hex}</div>
          <div class="color-percentage">%${c.percentage} Oran</div>
          <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--text-muted);">${c.rgbString}</div>
          <div class="color-name">${c.name}</div>
          <div class="color-temperature-tag">${c.temperature} · ${c.family}</div>
        </div>
      </div>
    `).join("");
  }

  // Görünüm Modunu Uygula (Yatay veya Izgara)
  syncPaletteViewMode();

  // 4. Özet Metrikler
  const tempEl = document.getElementById("metricOverallTemp");
  const divScoreEl = document.getElementById("metricDiversityScore");
  const countEl = document.getElementById("metricDominantCount");

  if (tempEl) tempEl.textContent = analysisData.overallTemperature;
  if (divScoreEl) divScoreEl.textContent = `${analysisData.colorDiversityScore} / 100`;
  if (countEl) countEl.textContent = `${analysisData.dominantColors.length} Renk (K-Means)`;

  // 5. JSON Metadata Çıktısı
  const jsonPre = document.getElementById("analysisJsonPre");
  if (jsonPre) {
    jsonPre.textContent = JSON.stringify(analysisData, null, 2);
  }
}

/**
 * Yatay kartlar veya Izgara görünümü arasında geçişi senkronize eder.
 */
function syncPaletteViewMode() {
  const horizList = document.getElementById("analysisPaletteHorizontal");
  const cardsGrid = document.getElementById("analysisPaletteCards");
  const toggleHoriz = document.getElementById("viewToggleHorizontal");
  const toggleGrid = document.getElementById("viewToggleGrid");

  if (!horizList || !cardsGrid) return;

  if (AppState.paletteViewMode === "grid") {
    horizList.style.display = "none";
    cardsGrid.style.display = "grid";
    if (toggleHoriz) toggleHoriz.classList.remove("active");
    if (toggleGrid) toggleGrid.classList.add("active");
  } else {
    horizList.style.display = "flex";
    cardsGrid.style.display = "none";
    if (toggleHoriz) toggleHoriz.classList.add("active");
    if (toggleGrid) toggleGrid.classList.remove("active");
  }
}

/**
 * Analiz edilen görseli yerel depolamaya (localStorage) kaydeder ve arşive ekler.
 */
function saveCurrentAnalysisToArchive() {
  if (!AppState.currentAnalysis) {
    showToast("Kaydedilecek analiz bulunamadı.");
    return;
  }

  // localStorage'dan mevcut kullanıcı kayıtlarını oku
  let userItems = [];
  try {
    const raw = localStorage.getItem("chromarchive_user_items");
    if (raw) userItems = JSON.parse(raw);
  } catch (err) {
    console.error("LocalStorage okuma hatası:", err);
  }

  userItems.unshift(AppState.currentAnalysis);

  try {
    localStorage.setItem("chromarchive_user_items", JSON.stringify(userItems));
  } catch (err) {
    console.warn("Depolama alanı dolmuş olabilir:", err);
  }

  // Arşiv listesini güncelle
  loadArchiveData();
  renderStatistics();
  showToast("Görsel dijital arşive başarıyla eklendi!");
}

/**
 * Analiz metadata'sını JSON dosyası olarak indirir.
 */
function downloadAnalysisMetadataJson() {
  if (!AppState.currentAnalysis) return;
  const jsonStr = JSON.stringify(AppState.currentAnalysis, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeTitle = AppState.currentAnalysis.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
  a.href = url;
  a.download = `chromarchive_${safeTitle}_metadata.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Metadata JSON dosyası indirildi.");
}

// ==========================================================================
// 7. DİJİTAL GÖRSEL ARŞİVİ VE FİLTRELEME
// ==========================================================================

function loadArchiveData() {
  let combined = [...DEFAULT_ARCHIVE_DATA];

  try {
    const userRaw = localStorage.getItem("chromarchive_user_items");
    if (userRaw) {
      const userItems = JSON.parse(userRaw);
      combined = [...userItems, ...DEFAULT_ARCHIVE_DATA];
    }
  } catch (err) {
    console.error("Kullanıcı arşiv verisi yüklenirken hata:", err);
  }

  AppState.archiveItems = combined;
  renderArchiveGallery();
  renderStatistics();
}

function filterArchiveItems() {
  const query = AppState.archiveSearchQuery.toLowerCase().trim();
  const category = AppState.archiveFilterCategory;
  const temp = AppState.archiveFilterTemperature;

  return AppState.archiveItems.filter(item => {
    // Metin araması
    const matchesQuery = !query || 
      item.title.toLowerCase().includes(query) ||
      item.artist.toLowerCase().includes(query) ||
      (item.period && item.period.toLowerCase().includes(query)) ||
      (item.institution && item.institution.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      item.dominantColors.some(c => c.name.toLowerCase().includes(query) || c.hex.toLowerCase().includes(query));

    // Kategori araması
    let matchesCategory = true;
    if (category !== "all") {
      matchesCategory = item.dominantColors.some(c => c.family.toLowerCase() === category.toLowerCase());
    }

    // Sıcaklık araması
    let matchesTemp = true;
    if (temp !== "all") {
      matchesTemp = item.overallTemperature.toLowerCase().includes(temp.toLowerCase()) ||
                    item.dominantColors.some(c => c.temperature.toLowerCase() === temp.toLowerCase());
    }

    return matchesQuery && matchesCategory && matchesTemp;
  });
}

function renderArchiveGallery() {
  const grid = document.getElementById("archiveGalleryGrid");
  const countEl = document.getElementById("archiveResultsCount");
  if (!grid) return;

  const filtered = filterArchiveItems();

  if (countEl) {
    countEl.textContent = `${filtered.length} eser listeleniyor`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md);">
        <p style="font-size: 1.125rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Arama kriterlerine uygun eser bulunamadı.</p>
        <p style="font-size: 0.875rem; color: var(--text-muted);">Lütfen filtreleri sıfırlayın veya farklı bir renk araması deneyin.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="archive-card" data-id="${item.id}">
      <div class="archive-card-image-box">
        <img src="${item.imageUrl}" 
             alt="${item.title}" 
             class="archive-card-img" 
             loading="lazy" 
             referrerPolicy="no-referrer"
             onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'300\\' viewBox=\\'0 0 400 300\\'><rect width=\\'400\\' height=\\'300\\' fill=\\'%23f0ebe1\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%236b7280\\' font-family=\\'serif\\' font-size=\\'18\\'>${encodeURIComponent(item.title)}</text></svg>'">
      </div>
      <div class="archive-card-palette-strip">
        ${item.dominantColors.map(c => `
          <div style="flex: ${c.percentage}; background-color: ${c.hex};" title="${c.name} (%${c.percentage})"></div>
        `).join("")}
      </div>
      <div class="archive-card-content">
        <div class="archive-card-meta-line">
          <span>${item.period || 'Müze Koleksiyonu'}</span>
          <span>·</span>
          <span>${item.date}</span>
        </div>
        <h3 class="archive-card-title">${item.title}</h3>
        <p class="archive-card-artist">${item.artist}</p>
        
        <div class="archive-card-palette-details">
          ${item.dominantColors.map(c => `
            <div class="mini-swatch" style="background-color: ${c.hex};" title="${c.hex} - ${c.name}"></div>
          `).join("")}
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: auto;">${item.overallTemperature}</span>
        </div>

        <div class="archive-card-footer">
          <button class="btn-view-detail" onclick="openArtworkModal('${item.id}')">
            <span>Detayları İncele</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

// ==========================================================================
// 8. AKILLI RENK ARAMA MOTORU (COLOR-BASED SIMILARITY SEARCH)
// ==========================================================================

function performColorSimilaritySearch(targetHex) {
  const targetRgb = hexToRgb(targetHex);
  const resultsContainer = document.getElementById("colorSearchResultsGrid");
  const countBadge = document.getElementById("colorSearchSimilarityBadge");
  const currentHexDisplay = document.getElementById("selectedColorHexDisplay");

  if (!resultsContainer) return;

  if (currentHexDisplay) currentHexDisplay.textContent = targetHex.toUpperCase();

  // Her eserin 5 baskın rengi ile hedef renk arasındaki en yakın mesafeyi bul
  const scoredItems = AppState.archiveItems.map(item => {
    let minDistance = Infinity;
    let closestColor = null;

    for (const c of item.dominantColors) {
      const dist = colorDistance(targetRgb, c.rgb);
      if (dist < minDistance) {
        minDistance = dist;
        closestColor = c;
      }
    }

    // Maksimum renk mesafesi yaklaşık 765'tir (Siyah ile Beyaz arası)
    const similarityPercent = Math.max(0, Math.min(100, Math.round(100 - (minDistance / 440) * 100)));

    return {
      ...item,
      similarityScore: similarityPercent,
      closestColor
    };
  });

  // Benzerlik puanına göre azalan sırada sırala
  scoredItems.sort((a, b) => b.similarityScore - a.similarityScore);

  if (countBadge) {
    countBadge.textContent = `${targetHex} rengine göre en yakın ${scoredItems.length} eser`;
  }

  resultsContainer.innerHTML = scoredItems.map(item => `
    <div class="archive-card">
      <div class="archive-card-image-box">
        <img src="${item.imageUrl}" 
             alt="${item.title}" 
             class="archive-card-img" 
             loading="lazy" 
             referrerPolicy="no-referrer">
      </div>
      <div class="archive-card-palette-strip">
        ${item.dominantColors.map(c => `
          <div style="flex: ${c.percentage}; background-color: ${c.hex};"></div>
        `).join("")}
      </div>
      <div class="archive-card-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
          <span class="similarity-badge" style="background-color: var(--navy-subtle); color: var(--navy-primary);">
            %${item.similarityScore} Benzerlik
          </span>
          <div style="display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: var(--text-muted);">
            <span>En Yakın:</span>
            <span style="display: inline-block; width: 14px; height: 14px; border-radius: 3px; background-color: ${item.closestColor.hex}; border: 1px solid var(--border-light);"></span>
            <span>${item.closestColor.hex}</span>
          </div>
        </div>

        <h3 class="archive-card-title">${item.title}</h3>
        <p class="archive-card-artist">${item.artist}</p>

        <div class="archive-card-palette-details">
          ${item.dominantColors.map(c => `
            <div class="mini-swatch" style="background-color: ${c.hex}; ${c.hex === item.closestColor.hex ? 'box-shadow: 0 0 0 2px var(--navy-primary); transform: scale(1.15);' : ''}" title="${c.hex}"></div>
          `).join("")}
        </div>

        <div class="archive-card-footer">
          <button class="btn-view-detail" onclick="openArtworkModal('${item.id}')">
            <span>Detayları İncele</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

// ==========================================================================
// 9. İSTATİSTİK VE RAPORLAMA MODÜLÜ
// ==========================================================================

function renderStatistics() {
  const items = AppState.archiveItems;
  if (!items || items.length === 0) return;

  // 1. Üst Özet Kartları
  const statTotalArtworks = document.getElementById("statTotalArtworks");
  const statTotalColors = document.getElementById("statTotalColors");
  const statAvgDiversity = document.getElementById("statAvgDiversity");
  const statDominantTemp = document.getElementById("statDominantTemp");

  const totalColorsCount = items.reduce((sum, item) => sum + item.dominantColors.length, 0);
  const avgDiversity = Math.round(items.reduce((sum, item) => sum + (item.colorDiversityScore || 75), 0) / items.length);

  if (statTotalArtworks) statTotalArtworks.textContent = items.length;
  if (statTotalColors) statTotalColors.textContent = totalColorsCount;
  if (statAvgDiversity) statAvgDiversity.textContent = `${avgDiversity} / 100`;

  // Sıcaklık Dağılımı Hesapla
  let warmCount = 0, coolCount = 0, neutralCount = 0;
  items.forEach(item => {
    const t = item.overallTemperature.toLowerCase();
    if (t.includes("sıcak")) warmCount++;
    else if (t.includes("soğuk")) coolCount++;
    else neutralCount++;
  });

  const dominantTempName = warmCount >= coolCount && warmCount >= neutralCount ? "Sıcak Ağırlıklı" : 
                           (coolCount >= warmCount && coolCount >= neutralCount ? "Soğuk Ağırlıklı" : "Dengeli");
  if (statDominantTemp) statDominantTemp.textContent = dominantTempName;

  // Sıcaklık Yüzdeleri ve Grafik
  const totalItems = items.length;
  const warmPercent = Math.round((warmCount / totalItems) * 100);
  const coolPercent = Math.round((coolCount / totalItems) * 100);
  const neutralPercent = 100 - warmPercent - coolPercent;

  const tempBarVisual = document.getElementById("statsTempBarVisual");
  if (tempBarVisual) {
    tempBarVisual.innerHTML = `
      <div style="width: ${warmPercent}%; background-color: #c25e34;" title="Sıcak Tonlar: %${warmPercent}"></div>
      <div style="width: ${coolPercent}%; background-color: #2b5c8f;" title="Soğuk Tonlar: %${coolPercent}"></div>
      <div style="width: ${neutralPercent}%; background-color: #8c857b;" title="Nötr Tonlar: %${neutralPercent}"></div>
    `;
  }

  const tempValWarm = document.getElementById("tempValWarm");
  const tempValCool = document.getElementById("tempValCool");
  const tempValNeutral = document.getElementById("tempValNeutral");

  if (tempValWarm) tempValWarm.textContent = `${warmCount} Eser (%${warmPercent})`;
  if (tempValCool) tempValCool.textContent = `${coolCount} Eser (%${coolPercent})`;
  if (tempValNeutral) tempValNeutral.textContent = `${neutralCount} Eser (%${neutralPercent})`;

  // 2. Arşivde En Çok Karşılaşılan 5 Renk Grubu (Histogram & Cluster)
  const familyCountMap = {};
  items.forEach(item => {
    item.dominantColors.forEach(c => {
      const fam = c.family || "Nötr";
      familyCountMap[fam] = (familyCountMap[fam] || 0) + 1;
    });
  });

  const familyColors = {
    "Mavi": "#2a598c",
    "Sarı": "#d8a838",
    "Yeşil": "#4a7c59",
    "Kırmızı": "#a83838",
    "Turuncu": "#c9702c",
    "Mor": "#7c5991",
    "Nötr": "#78716c"
  };

  const sortedFamilies = Object.keys(familyCountMap)
    .map(key => ({
      family: key,
      count: familyCountMap[key],
      percent: Math.round((familyCountMap[key] / totalColorsCount) * 100),
      color: familyColors[key] || "#78716c"
    }))
    .sort((a, b) => b.count - a.count);

  const topColorsList = document.getElementById("statsTopColorsList");
  if (topColorsList) {
    topColorsList.innerHTML = sortedFamilies.slice(0, 5).map(f => `
      <div class="stats-rank-item">
        <div class="stats-rank-color-group">
          <div class="rank-swatch" style="background-color: ${f.color};"></div>
          <span class="rank-color-name">${f.family} Renk Ailesi</span>
        </div>
        <div class="stats-rank-bar-container">
          <div class="stats-rank-bar-fill" style="width: ${f.percent}%; background-color: ${f.color};"></div>
        </div>
        <span class="rank-percentage tabular-nums">%${f.percent}</span>
      </div>
    `).join("");
  }
}

// ==========================================================================
// 10. DETAY MODAL İŞLEMLERİ
// ==========================================================================

function openArtworkModal(itemId) {
  const item = AppState.archiveItems.find(x => x.id === itemId);
  if (!item) return;

  AppState.activeModalItem = item;
  const modal = document.getElementById("artworkModal");
  if (!modal) return;

  document.getElementById("modalArtworkTitle").textContent = item.title;
  document.getElementById("modalArtworkArtist").textContent = item.artist;
  document.getElementById("modalArtworkDate").textContent = item.date;
  document.getElementById("modalArtworkPeriod").textContent = item.period || "—";
  document.getElementById("modalArtworkMedium").textContent = item.medium || "—";
  document.getElementById("modalArtworkDimensions").textContent = item.dimensions || "—";
  document.getElementById("modalArtworkInstitution").textContent = item.institution || "Açık Erişim Koleksiyonu";
  document.getElementById("modalArtworkAccession").textContent = item.accessionNumber || "—";
  document.getElementById("modalArtworkLicense").textContent = item.license || "Public Domain (CC0)";
  document.getElementById("modalArtworkDescription").textContent = item.description || "—";

  const sourceLink = document.getElementById("modalArtworkSourceLink");
  if (sourceLink) {
    if (item.sourceUrl && item.sourceUrl.startsWith("http")) {
      sourceLink.href = item.sourceUrl;
      sourceLink.style.display = "inline-flex";
      sourceLink.textContent = "Müze Kayıt Sayfasını Aç ↗";
    } else {
      sourceLink.style.display = "none";
    }
  }

  const modalImg = document.getElementById("modalArtworkImg");
  if (modalImg) {
    modalImg.src = item.imageUrl;
    modalImg.alt = item.title;
  }

  // Renk Çubuğu
  const bar = document.getElementById("modalArtworkPaletteBar");
  if (bar) {
    bar.innerHTML = item.dominantColors.map(c => `
      <div style="flex: ${c.percentage}; background-color: ${c.hex}; height: 28px;" title="${c.name} - %${c.percentage}"></div>
    `).join("");
  }

  // Renk Kartları
  const grid = document.getElementById("modalArtworkPaletteGrid");
  if (grid) {
    grid.innerHTML = item.dominantColors.map(c => `
      <div class="color-card" onclick="copyHexToClipboard('${c.hex}')" title="Kopyalamak için tıkla">
        <div class="color-swatch-box" style="background-color: ${c.hex}; height: 50px;">
          <span class="copy-badge">Kopyala</span>
        </div>
        <div class="color-card-body" style="padding: 0.5rem;">
          <div class="color-hex" style="font-size: 0.75rem;">${c.hex}</div>
          <div class="color-percentage" style="font-size: 0.6875rem;">%${c.percentage}</div>
          <div class="color-name" style="font-size: 0.6875rem;">${c.name}</div>
        </div>
      </div>
    `).join("");
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeArtworkModal() {
  const modal = document.getElementById("artworkModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
  AppState.activeModalItem = null;
}

function downloadModalItemJson() {
  if (!AppState.activeModalItem) return;
  const jsonStr = JSON.stringify(AppState.activeModalItem, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeTitle = AppState.activeModalItem.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
  a.href = url;
  a.download = `chromarchive_${safeTitle}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Eser metadata JSON dosyası indirildi.");
}

// ==========================================================================
// 11. NAVİGASYON VE SEKME GEÇİŞLERİ (SPA ROUTING)
// ==========================================================================

function switchSection(sectionId) {
  const sections = document.querySelectorAll(".app-section");
  const navLinks = document.querySelectorAll(".nav-link");

  sections.forEach(sec => {
    if (sec.id === sectionId) {
      sec.classList.add("active");
    } else {
      sec.classList.remove("active");
    }
  });

  navLinks.forEach(link => {
    if (link.getAttribute("data-section") === sectionId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  AppState.activeSection = sectionId;
  window.location.hash = sectionId;
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Mobil menüyü kapat
  const mobileNav = document.getElementById("mainNav");
  if (mobileNav) mobileNav.classList.remove("mobile-active");
}

// ==========================================================================
// 12. UYGULAMA BAŞLANGIÇ DİNLİYİCİLERİ VE OLAYLAR (EVENT LISTENERS)
// ==========================================================================

document.addEventListener("DOMContentLoaded", function() {
  // 1. Arşiv verilerini yükle
  loadArchiveData();

  // 2. Hash router kontrolü
  const currentHash = window.location.hash.replace("#", "");
  if (currentHash && document.getElementById(currentHash)) {
    switchSection(currentHash);
  } else {
    switchSection("home");
  }

  // Navigasyon tıklamaları
  document.querySelectorAll("[data-navigate]").forEach(el => {
    el.addEventListener("click", function(e) {
      e.preventDefault();
      const target = this.getAttribute("data-navigate");
      switchSection(target);
    });
  });

  // Mobil Menü Butonu
  const mobileToggle = document.getElementById("mobileMenuToggle");
  const mainNav = document.getElementById("mainNav");
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      mainNav.classList.toggle("mobile-active");
    });
  }

  // 3. Dosya Yükleme Olayları (File Input & Drag-and-drop)
  const fileInput = document.getElementById("imageFileInput");
  const dropZone = document.getElementById("imageDropZone");

  if (dropZone && fileInput) {
    dropZone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelection(e.target.files[0]);
      }
    });

    ["dragenter", "dragover"].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
      });
    });

    dropZone.addEventListener("drop", (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });
  }

  // 4. Örnek Eser Butonları (Anında Analiz Testi)
  document.querySelectorAll(".sample-thumbnail-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const src = this.getAttribute("data-src");
      const title = this.getAttribute("data-title");
      const artist = this.getAttribute("data-artist");
      const period = this.getAttribute("data-period");

      document.querySelectorAll(".sample-thumbnail-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");

      processImageForAnalysis(src, {
        title,
        artist,
        period,
        format: "JPEG"
      });
    });
  });

  // 4b. K-Means Küme Sayısı Seçici (5 - 8 veya Otomatik)
  document.querySelectorAll(".cluster-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".cluster-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");

      const count = this.getAttribute("data-cluster-count");
      AppState.analysisClusterCount = count;

      // Eğer halihazırda bir görsel analiz edilmişse, yeni küme sayısıyla tekrar kümele
      if (AppState.currentImageElement && AppState.currentAnalysis) {
        try {
          const analysis = analyzeImagePixelsWithCanvas(AppState.currentImageElement, count);
          AppState.currentAnalysis.dominantColors = analysis.dominantColors;
          AppState.currentAnalysis.overallTemperature = analysis.overallTemperature;
          AppState.currentAnalysis.colorDiversityScore = analysis.colorDiversityScore;
          AppState.currentAnalysis.dominantCount = analysis.dominantColors.length;

          renderAnalysisResults(AppState.currentAnalysis);
          showToast(`K-Means ile ${analysis.dominantColors.length} renk kümesi yeniden hesaplandı.`);
        } catch (err) {
          console.error("Yeniden kümeleme hatası:", err);
        }
      }
    });
  });

  // 4c. Palet Görünüm Seçici (Yatay Kartlar / Izgara)
  const viewToggleH = document.getElementById("viewToggleHorizontal");
  const viewToggleG = document.getElementById("viewToggleGrid");
  if (viewToggleH) {
    viewToggleH.addEventListener("click", () => {
      AppState.paletteViewMode = "horizontal";
      syncPaletteViewMode();
    });
  }
  if (viewToggleG) {
    viewToggleG.addEventListener("click", () => {
      AppState.paletteViewMode = "grid";
      syncPaletteViewMode();
    });
  }

  // 5. Arşive Kaydet ve JSON İndir Butonları
  const saveBtn = document.getElementById("saveToArchiveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveCurrentAnalysisToArchive);
  }

  const downloadJsonBtn = document.getElementById("downloadJsonMetadataBtn");
  if (downloadJsonBtn) {
    downloadJsonBtn.addEventListener("click", downloadAnalysisMetadataJson);
  }

  // 6. Arşiv Filtre ve Arama Olayları
  const archiveSearch = document.getElementById("archiveSearchInput");
  if (archiveSearch) {
    archiveSearch.addEventListener("input", (e) => {
      AppState.archiveSearchQuery = e.target.value;
      renderArchiveGallery();
    });
  }

  const categorySelect = document.getElementById("archiveCategorySelect");
  if (categorySelect) {
    categorySelect.addEventListener("change", (e) => {
      AppState.archiveFilterCategory = e.target.value;
      renderArchiveGallery();
    });
  }

  const tempSelect = document.getElementById("archiveTempSelect");
  if (tempSelect) {
    tempSelect.addEventListener("change", (e) => {
      AppState.archiveFilterTemperature = e.target.value;
      renderArchiveGallery();
    });
  }

  // 7. Akıllı Renk Arama Olayları
  const colorPicker = document.getElementById("nativeColorPicker");
  const hexInput = document.getElementById("hexColorInput");

  if (colorPicker && hexInput) {
    colorPicker.addEventListener("input", (e) => {
      hexInput.value = e.target.value.toUpperCase();
      performColorSimilaritySearch(e.target.value);
    });

    hexInput.addEventListener("change", (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith("#")) val = "#" + val;
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        colorPicker.value = val;
        performColorSimilaritySearch(val);
      }
    });
  }

  // Renk Preset Çipleri
  document.querySelectorAll(".preset-chip-btn").forEach(chip => {
    chip.addEventListener("click", function() {
      const hex = this.getAttribute("data-hex");
      if (colorPicker) colorPicker.value = hex;
      if (hexInput) hexInput.value = hex;
      performColorSimilaritySearch(hex);
    });
  });

  // 8. Modal Kapatma Olayları
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalBackdrop = document.getElementById("artworkModal");
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeArtworkModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeArtworkModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeArtworkModal();
  });

  // Modal içi JSON indir
  const modalDownloadBtn = document.getElementById("modalDownloadJsonBtn");
  if (modalDownloadBtn) {
    modalDownloadBtn.addEventListener("click", downloadModalItemJson);
  }

  // İlk renk arama başlangıç çalıştırması
  if (colorPicker) {
    performColorSimilaritySearch(colorPicker.value || "#1E3A5F");
  }
});
