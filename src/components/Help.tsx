/**
 * @file src/components/Help.tsx
 * @description ChromArchive ilk kez kullananlar dahil tüm kullanıcılar için görselleştirilmiş,
 * adım adım etkileşimli kullanım rehberi ve sık sorulan sorular sayfası.
 */

import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Compass,
  Copy,
  Download,
  Eye,
  Filter,
  Grid,
  History,
  Image as ImageIcon,
  Layers,
  List,
  Palette,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from 'lucide-react';
import type { NavigationSection } from '../types';

interface HelpProps {
  onNavigate: (section: NavigationSection) => void;
}

const TOC_ITEMS = [
  { id: 'help-welcome', label: 'Hoş Geldiniz' },
  { id: 'help-quickstart', label: 'Hızlı Başlangıç' },
  { id: 'help-analyzer', label: 'Görsel Analizi' },
  { id: 'help-archive', label: 'Dijital Arşiv' },
  { id: 'help-search', label: 'Renk Arama' },
  { id: 'help-stats', label: 'İstatistikler' },
  { id: 'help-about-diff', label: 'Hakkında Farkı' },
  { id: 'help-glossary', label: 'Terimler Sözlüğü' },
  { id: 'help-faq', label: 'Sık Sorulan Sorular' },
] as const;

const CLUSTER_DEMOS: Record<5 | 6 | 7 | 8, Array<{ hex: string; pct: number; name: string }>> = {
  5: [
    { hex: '#23395B', pct: 31, name: 'Prusya Mavisi' },
    { hex: '#D4A843', pct: 24, name: 'Hardal Sarısı' },
    { hex: '#B2AC88', pct: 20, name: 'Adaçayı Yeşili' },
    { hex: '#8F3D29', pct: 15, name: 'Terrakota' },
    { hex: '#EAE2D3', pct: 10, name: 'Fildişi' },
  ],
  6: [
    { hex: '#23395B', pct: 27, name: 'Prusya Mavisi' },
    { hex: '#D4A843', pct: 21, name: 'Hardal Sarısı' },
    { hex: '#B2AC88', pct: 18, name: 'Adaçayı Yeşili' },
    { hex: '#8F3D29', pct: 14, name: 'Terrakota' },
    { hex: '#4B6B7A', pct: 11, name: 'Çelik Mavi' },
    { hex: '#EAE2D3', pct: 9, name: 'Fildişi' },
  ],
  7: [
    { hex: '#23395B', pct: 24, name: 'Prusya Mavisi' },
    { hex: '#D4A843', pct: 19, name: 'Hardal Sarısı' },
    { hex: '#B2AC88', pct: 16, name: 'Adaçayı Yeşili' },
    { hex: '#8F3D29', pct: 13, name: 'Terrakota' },
    { hex: '#4B6B7A', pct: 11, name: 'Çelik Mavi' },
    { hex: '#C69F73', pct: 9, name: 'Toprak Beji' },
    { hex: '#EAE2D3', pct: 8, name: 'Fildişi' },
  ],
  8: [
    { hex: '#23395B', pct: 22, name: 'Prusya Mavisi' },
    { hex: '#D4A843', pct: 17, name: 'Hardal Sarısı' },
    { hex: '#B2AC88', pct: 15, name: 'Adaçayı Yeşili' },
    { hex: '#8F3D29', pct: 12, name: 'Terrakota' },
    { hex: '#4B6B7A', pct: 10, name: 'Çelik Mavi' },
    { hex: '#C69F73', pct: 9, name: 'Toprak Beji' },
    { hex: '#5D473A', pct: 8, name: 'Koyu Umber' },
    { hex: '#EAE2D3', pct: 7, name: 'Fildişi' },
  ],
};

const COLOR_FAMILIES_13 = [
  { tr: 'Kırmızı', hex: '#A83838' },
  { tr: 'Turuncu', hex: '#C9702C' },
  { tr: 'Sarı', hex: '#D8A838' },
  { tr: 'Yeşil', hex: '#4A7C59' },
  { tr: 'Camgöbeği', hex: '#3B828E' },
  { tr: 'Mavi', hex: '#2A598C' },
  { tr: 'Mor', hex: '#7C5991' },
  { tr: 'Pembe', hex: '#C27488' },
  { tr: 'Kahverengi', hex: '#7C5338' },
  { tr: 'Bej', hex: '#CBB99C' },
  { tr: 'Gri', hex: '#78716C' },
  { tr: 'Siyah', hex: '#1C1917' },
  { tr: 'Beyaz', hex: '#F3EFE6' },
];

const FAQ_ITEMS = [
  {
    id: 'faq-upload',
    q: 'Görselimi yükledim ama analiz başlamadı. Ne yapmalıyım?',
    a: 'Önce dosya formatının JPG, JPEG, PNG veya WEBP olduğundan ve boyutunun 25 MB sınırını aşmadığından emin olun. Ardından görselin önizleme alanına yerleşip yerleşmediğini kontrol edin; desteklenmeyen formatlarda (ör. PDF, SVG, HEIC) sağ alt köşede uyarı bildirimi görünür.',
  },
  {
    id: 'faq-camera',
    q: 'Kameram açılmıyor. Ne yapmalıyım?',
    a: 'Canlı kamera erişimi yalnızca güvenli HTTPS bağlantısında (veya geliştirme ortamında localhost üzerinde) çalışır. Adres çubuğundan tarayıcı kamera izninin açık olduğunu, cihazınızda çalışan bir kamera bulunduğunu ve kameranın Zoom/Meet gibi başka bir uygulama ya da sekme tarafından kullanılmadığını kontrol edin; ardından "Kamerayı Yeniden Aç" butonunu deneyebilirsiniz.',
  },
  {
    id: 'faq-permission',
    q: 'Kamera iznini reddedersem uygulamayı kullanabilir miyim?',
    a: 'Evet. Kamera iznini vermeseniz bile aynı ekrandaki "Dosya Seç", sürükle-bırak alanı ve 5 hazır başyapıt önayarı kesintisiz şekilde çalışmaya devam eder.',
  },
  {
    id: 'faq-archive-save',
    q: 'Yüklediğim fotoğraf dijital arşive ekleniyor mu?',
    a: 'Hayır. Cihazınızdan yüklediğiniz veya kameranızla çektiğiniz fotoğraflar dijital müze arşivine, tarayıcı arşiv kayıtlarına ya da uzak bir sunucuya kesinlikle kaydedilmez. Görseller yalnızca o anki analiz işlemi için tarayıcı belleğinde işlenir.',
  },
  {
    id: 'faq-copy-hex',
    q: 'Analiz sonucundaki HEX kodunu nasıl kopyalayabilirim?',
    a: 'Baskın renk paletindeki herhangi bir renk kartına, renk dağılım şeridindeki renk dilimine veya yatay karttaki kopyala ikonuna tek bir kez tıklamanız yeterlidir. Kod otomatik olarak panoya kopyalanır ve ekranda onay bildirimi görünür.',
  },
  {
    id: 'faq-temp',
    q: 'Renk sıcaklığı gerçek sıcaklığı mı gösteriyor?',
    a: 'Hayır. Gösterilen 0–100 skoru ve Sıcak/Soğuk/Geçişli/Nötr etiketleri fiziksel ısı veya Kelvin ışık ölçümü değildir; renklerin sanat ve görsel algı açısından sıcak ya da soğuk tarafa olan görsel yönelimini ifade eder.',
  },
  {
    id: 'faq-missing-palette',
    q: 'Bir müze eserinin renk paleti neden görünmüyor?',
    a: '205 müze eserinden bazılarının renk paleti henüz çıkarılmamış olabilir veya müzenin harici görsel sunucusu geçici olarak yanıt vermemiş olabilir. Kart üzerindeki "Paleti oluştur" butonuyla tekil analiz başlatabilir, görsel erişimi başarısız olduysa "Tekrar dene" seçeneğini kullanabilirsiniz.',
  },
  {
    id: 'faq-json',
    q: 'JSON dosyası ne işe yarıyor?',
    a: 'Sonuç panelindeki "JSON İndir" butonu; baskın renklerin HEX/RGB kodlarını, oranlarını, renk adlarını ve sıcaklık profilini yapılandırılmış bir veri dosyası olarak indirmenizi sağlar. Bu dosyayı tasarım araçlarında, sunumlarda veya veri inceleme yazılımlarında kullanabilirsiniz.',
  },
  {
    id: 'faq-mobile-cam',
    q: 'Mobil cihazdan fotoğraf çekebilir miyim?',
    a: 'Evet. Mobil cihazınızda ve tarayıcınızda kamera erişimine izin verdiğiniz takdirde "Kamerayı Aç" ve "Fotoğraf Çek" adımları telefonunuzun kamerasıyla çalışır. Fotoğraf çekildikten sonra kamera akışı otomatik olarak kapatılır.',
  },
];

export const Help: React.FC<HelpProps> = ({ onNavigate }) => {
  const [demoClusterCount, setDemoClusterCount] = useState<5 | 6 | 7 | 8>(5);
  const [demoViewMode, setDemoViewMode] = useState<'horizontal' | 'grid'>('horizontal');
  const [copiedDemoHex, setCopiedDemoHex] = useState(false);

  // Açılır kapanır detaylı anlatımlar (Varsayılan olarak açık başlar; kullanıcı daraltıp açabilir)
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({
    analyzerSteps: true,
    archiveGuides: true,
    searchGuides: true,
    statsGuides: true,
  });

  // SSS Akordeonu (İlk soru açık başlar)
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({
    'faq-upload': true,
    'faq-archive-save': true,
  });

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePanel = (key: string) => {
    setExpandedPanels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopySampleHex = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('#B2AC88').catch(() => {});
    }
    setCopiedDemoHex(true);
    window.setTimeout(() => setCopiedDemoHex(false), 1800);
  };

  const demoSwatches = CLUSTER_DEMOS[demoClusterCount];

  return (
    <div className="help-guide-page">
      {/* ==================================================================
          ETKİLEŞİMLİ İÇERİK MENÜSÜ (ÜST HIZLI GEÇİŞ ÇUBUĞU)
          ================================================================== */}
      <nav className="help-toc-bar" aria-label="Yardım İçindekiler">
        <div className="help-toc-label">
          <BookOpen size={15} aria-hidden="true" />
          <span>Rehber Bölümleri</span>
        </div>
        <div className="help-toc-links">
          {TOC_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="help-toc-btn"
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ==================================================================
          BÖLÜM A – CHROMARCHIVE'A HOŞ GELDİNİZ
          ================================================================== */}
      <section id="help-welcome" className="help-section help-hero-section" aria-labelledby="helpWelcomeTitle">
        <div className="help-hero-header">
          <span className="section-kicker">Kullanım Kılavuzu ve Görsel Rehber</span>
          <h1 id="helpWelcomeTitle" className="help-hero-title">
            ChromArchive Nasıl Kullanılır?
          </h1>
          <p className="help-hero-lead">
            ChromArchive&apos;ın tüm özelliklerini keşfedin. Görsellerin renklerini analiz edin,
            dijital sanat koleksiyonunu inceleyin, renkleri karşılaştırın ve tarihsel anlamlarını keşfedin.
          </p>
        </div>

        <div className="help-four-cards-grid">
          <article className="help-feature-card">
            <div className="help-mini-diagram" aria-hidden="true">
              <div className="diagram-palette-strip">
                <span style={{ width: '32%', backgroundColor: '#1E3A5F' }} />
                <span style={{ width: '26%', backgroundColor: '#D8A838' }} />
                <span style={{ width: '24%', backgroundColor: '#B2AC88' }} />
                <span style={{ width: '18%', backgroundColor: '#8C3B24' }} />
              </div>
              <div className="diagram-mini-rows">
                <span>#1E3A5F · %32</span>
                <span>#D8A838 · %26</span>
              </div>
            </div>
            <div className="help-card-icon-title">
              <Camera size={18} aria-hidden="true" />
              <h2>1. Görselleri analiz et</h2>
            </div>
            <p className="help-card-desc">
              Üst menüdeki <strong>&quot;Görsel Analiz Et&quot;</strong> butonundan fotoğraf yükleyin,
              kamerayı açın veya örnek tablo seçin; baskın renkleri ve yüzdelerini görün.
            </p>
            <button
              type="button"
              className="help-card-cta"
              onClick={() => onNavigate('analyzer')}
            >
              <span>Görsel Analiz Et</span>
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>

          <article className="help-feature-card">
            <div className="help-mini-diagram" aria-hidden="true">
              <div className="diagram-archive-grid">
                <div className="diagram-art-thumb">
                  <div className="diagram-art-canvas" />
                  <div className="diagram-art-bar" />
                </div>
                <div className="diagram-art-thumb">
                  <div className="diagram-art-canvas alt" />
                  <div className="diagram-art-bar" />
                </div>
              </div>
            </div>
            <div className="help-card-icon-title">
              <ImageIcon size={18} aria-hidden="true" />
              <h2>2. Sanat eserlerini keşfet</h2>
            </div>
            <p className="help-card-desc">
              <strong>Dijital Arşiv</strong> sekmesinde 205 müze eserini sanatçı, dönem ve renge göre
              filtreleyin; 11 renk ailesinin kültürel anlamlarını okuyun.
            </p>
            <button
              type="button"
              className="help-card-cta"
              onClick={() => onNavigate('archive')}
            >
              <span>Dijital Arşive Git</span>
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>

          <article className="help-feature-card">
            <div className="help-mini-diagram" aria-hidden="true">
              <div className="diagram-search-box">
                <span className="diagram-swatch-dot" style={{ backgroundColor: '#B2AC88' }} />
                <span className="mono-font">#B2AC88</span>
                <ArrowRight size={12} />
                <span>368 Renk &amp; Eser</span>
              </div>
            </div>
            <div className="help-card-icon-title">
              <Search size={18} aria-hidden="true" />
              <h2>3. Renkleri karşılaştır</h2>
            </div>
            <p className="help-card-desc">
              <strong>Renk Arama</strong> bölümünde HEX, RGB veya ad ile arayın; 368 sözlük rengini,
              tarihsel pigmentleri ve benzer müze tablolarını bulun.
            </p>
            <button
              type="button"
              className="help-card-cta"
              onClick={() => onNavigate('search')}
            >
              <span>Renk Aramaya Git</span>
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>

          <article className="help-feature-card">
            <div className="help-mini-diagram" aria-hidden="true">
              <div className="diagram-bars-chart">
                <span style={{ height: '78%', backgroundColor: '#9A3412' }} />
                <span style={{ height: '54%', backgroundColor: '#1E3A5F' }} />
                <span style={{ height: '90%', backgroundColor: '#D8A838' }} />
                <span style={{ height: '42%', backgroundColor: '#4A7C59' }} />
              </div>
            </div>
            <div className="help-card-icon-title">
              <BarChart3 size={18} aria-hidden="true" />
              <h2>4. Koleksiyon istatistiklerini incele</h2>
            </div>
            <p className="help-card-desc">
              <strong>İstatistikler</strong> sayfasında indekslenen eser sayısını, sıcaklık dağılımını ve
              koleksiyonda öne çıkan renk ailelerini okuyun.
            </p>
            <button
              type="button"
              className="help-card-cta"
              onClick={() => onNavigate('stats')}
            >
              <span>İstatistikleri Gör</span>
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>
        </div>
      </section>

      {/* ==================================================================
          BÖLÜM B – HIZLI BAŞLANGIÇ (4 AŞAMALI OKLU AKIŞ ŞEMASI)
          ================================================================== */}
      <section id="help-quickstart" className="help-section" aria-labelledby="helpQuickstartTitle">
        <div className="help-section-header">
          <span className="section-kicker">Adım Adım İlk Kullanım</span>
          <h2 id="helpQuickstartTitle" className="help-section-title">
            Hızlı Başlangıç: 4 Adımda ChromArchive
          </h2>
          <p className="help-section-lead">
            Uygulamayı ilk kez açtığınızda aşağıdaki sırayı izleyerek dakikalar içinde kendi renk analizinizi yapabilir ve müze arşivinde gezinebilirsiniz.
          </p>
        </div>

        <div className="help-flow-track" role="list" aria-label="4 adımlı hızlı başlangıç süreci">
          <div className="help-flow-step" role="listitem">
            <div className="help-step-num mono-font">01</div>
            <h3>Uygulamayı keşfet</h3>
            <p>
              <strong>Ana Sayfa</strong> üzerindeki örnek tablo değiştiriciye ve modül kartlarına bakarak
              tüm bölümlere tek tıkla geçebilirsiniz.
            </p>
            <span className="help-step-cue">Hedef: Ana Sayfa</span>
          </div>

          <div className="help-flow-arrow" aria-hidden="true">
            <ArrowRight size={20} />
          </div>

          <div className="help-flow-step" role="listitem">
            <div className="help-step-num mono-font">02</div>
            <h3>Bir görsel analiz et</h3>
            <p>
              Sağ üst köşedeki <strong>&quot;Görsel Analiz Et&quot;</strong> butonuna basın. Fotoğraf yükleyin,
              kamerayla çekin veya örnek eser seçin.
            </p>
            <span className="help-step-cue">Buton: Görsel Analiz Et</span>
          </div>

          <div className="help-flow-arrow" aria-hidden="true">
            <ArrowRight size={20} />
          </div>

          <div className="help-flow-step" role="listitem">
            <div className="help-step-num mono-font">03</div>
            <h3>Renk sonuçlarını incele</h3>
            <p>
              Çıkan baskın renkleri, <strong>#B2AC88</strong> gibi HEX kodlarını, kullanım yüzdelerini
              ve göreli sıcaklık dağılımını inceleyin.
            </p>
            <span className="help-step-cue">Sonuç: Baskın Palet</span>
          </div>

          <div className="help-flow-arrow" aria-hidden="true">
            <ArrowRight size={20} />
          </div>

          <div className="help-flow-step" role="listitem">
            <div className="help-step-num mono-font">04</div>
            <h3>Diğer özellikleri keşfet</h3>
            <p>
              <strong>Dijital Arşiv</strong>&apos;de 205 müze eserini inceleyin, <strong>Renk Arama</strong>&apos;da
              ton karşılaştırın ve <strong>İstatistikler</strong>&apos;i görün.
            </p>
            <span className="help-step-cue">Üst Menü Sekmeleri</span>
          </div>
        </div>
      </section>

      {/* ==================================================================
          5. GÖRSEL ANALİZ NASIL KULLANILIR?
          ================================================================== */}
      <section id="help-analyzer" className="help-section" aria-labelledby="helpAnalyzerTitle">
        <div className="help-section-header help-header-with-toggle">
          <div>
            <span className="section-kicker">Modül 01 · Görsel Analizi</span>
            <h2 id="helpAnalyzerTitle" className="help-section-title">
              Görsel Analiz Nasıl Kullanılır?
            </h2>
            <p className="help-section-lead">
              Kendi fotoğrafınızı, kameradan çektiğiniz görüntüyü veya hazır başyapıtları tarayıcı içinde analiz edip renk paletine dönüştürmenin tüm adımları.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary help-collapse-btn"
            aria-expanded={expandedPanels.analyzerSteps}
            aria-controls="helpAnalyzerBody"
            onClick={() => togglePanel('analyzerSteps')}
          >
            <span>{expandedPanels.analyzerSteps ? 'Bölümü Daralt' : 'Adımları Genişlet'}</span>
            {expandedPanels.analyzerSteps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {expandedPanels.analyzerSteps && (
          <div id="helpAnalyzerBody" className="help-module-body">
            {/* 5.1 & 5.2 Fotoğraf Yükleme ve Kamera ile Fotoğraf Çekme */}
            <div className="help-two-col-grid">
              {/* 5.1 Fotoğraf Yükleme */}
              <article className="help-guide-card">
                <div className="help-subhead-row">
                  <Upload size={18} aria-hidden="true" />
                  <h3>5.1. Cihazdan Fotoğraf Yükleme</h3>
                </div>
                <ol className="help-numbered-steps">
                  <li>
                    <strong>Nereye gidin:</strong> Üst menünün sağındaki <strong>&quot;Görsel Analiz Et&quot;</strong> butonuna basın.
                  </li>
                  <li>
                    <strong>Alanı bulun:</strong> Açılan giriş ekranında kesikli çizgili yükleme kutusuna veya <strong>&quot;Dosya Seç&quot;</strong> butonuna tıklayın.
                  </li>
                  <li>
                    <strong>Format seçin:</strong> Bilgisayarınızdan veya telefonunuzdan <strong>JPG, JPEG, PNG</strong> ya da <strong>WEBP</strong> türünde bir görsel seçin.
                  </li>
                  <li>
                    <strong>Sürükle-bırak alternatifi:</strong> İsterseniz görsel dosyasını doğrudan tarayıcıdaki yükleme kutusunun üzerine sürükleyip bırakın.
                  </li>
                  <li>
                    <strong>Sonucu görün:</strong> Görsel sol önizleme paneline yerleşir ve hemen sağ tarafta renk analizi başlatılır.
                  </li>
                </ol>

                <div className="help-visual-box" aria-label="Dosya yükleme arayüz özeti">
                  <div className="mock-dropzone">
                    <ImageIcon size={22} aria-hidden="true" />
                    <span className="mock-drop-title">Görseli Buraya Sürükleyin veya Seçin</span>
                    <span className="mock-drop-meta">JPG · JPEG · PNG · WEBP · Maksimum 25 MB</span>
                  </div>
                </div>
              </article>

              {/* 5.2 Kamerayla Fotoğraf Çekme */}
              <article className="help-guide-card">
                <div className="help-subhead-row">
                  <Camera size={18} aria-hidden="true" />
                  <h3>5.2. Kamerayla Fotoğraf Çekme</h3>
                </div>
                <ol className="help-numbered-steps">
                  <li>
                    <strong>Butona basın:</strong> Görsel analiz ekranında <strong>&quot;Kamerayı Aç&quot;</strong> butonuna tıklayın.
                  </li>
                  <li>
                    <strong>İzin verin:</strong> Tarayıcı kamera erişimi sorduğunda onaylayın (izin yalnızca canlı görüntü karesi almak için istenir; ses açılmaz).
                  </li>
                  <li>
                    <strong>Önizlemeyi görün:</strong> Açılan panelde cihaz kameranızın canlı görüntüsünü çerçeve içinde görün.
                  </li>
                  <li>
                    <strong>Çekim yapın:</strong> İstediğiniz kadraj hazır olduğunda <strong>&quot;Fotoğraf Çek&quot;</strong> butonuna basın.
                  </li>
                  <li>
                    <strong>Otomatik aktarım:</strong> Çekilen fotoğraf anında analiz alanına aktarılır ve <strong>kamera donanımı otomatik kapatılır</strong>.
                  </li>
                  <li>
                    <strong>Analizi inceleyin:</strong> Sağ tarafta oluşan baskın renk kartlarını ve sıcaklık dağılımını inceleyin.
                  </li>
                </ol>

                <div className="help-note-box">
                  <ShieldCheck size={16} aria-hidden="true" />
                  <div>
                    <strong>Kamera izni verilmezse ne olur?</strong> Kamera erişimini reddetseniz bile dosya yükleme ve sürükle-bırak alanı her zaman çalışır. Kamerayı kapatmak istediğinizde <strong>&quot;Kamerayı Kapat&quot;</strong>, yeniden başlatmak için <strong>&quot;Kamerayı Yeniden Aç&quot;</strong> butonunu kullanabilirsiniz.
                  </div>
                </div>
              </article>
            </div>

            {/* 5.3 Örnek Eser Kullanımı */}
            <article className="help-guide-card">
              <div className="help-subhead-row">
                <Sparkles size={18} aria-hidden="true" />
                <h3>5.3. Kendi Fotoğrafınız Olmadan Deneyin: Hazır Örnek Eserler</h3>
              </div>
              <p className="help-prose">
                Cihazınızdan fotoğraf yüklemek istemiyorsanız giriş ekranının altındaki <strong>&quot;Veya Örnek Eserle Test Edin&quot;</strong> satırından 5 hazır başyapıttan birine tıklayarak renk analiz motorunu tek tıkla deneyebilirsiniz.
              </p>
              <div className="help-presets-strip" aria-label="Hazır örnek başyapıtlar">
                {[
                  { name: 'Vermeer', sub: 'Süt Döken Kadın', colors: ['#1E3A5F', '#D8A838', '#8C5B32'] },
                  { name: 'Hokusai', sub: 'Büyük Dalga', colors: ['#23446B', '#D9D3C4', '#4B6B7A'] },
                  { name: 'Monet', sub: 'Nilüferler', colors: ['#4A7C59', '#6B8CA6', '#B2AC88'] },
                  { name: 'Cézanne', sub: 'Elmalı Natürmort', colors: ['#B8432E', '#D8A838', '#E8E0D0'] },
                  { name: 'Mona Lisa', sub: 'Leonardo da Vinci', colors: ['#3D3428', '#7B6746', '#9B8969'] },
                ].map((preset) => (
                  <div key={preset.name} className="help-preset-chip">
                    <div className="help-preset-dots" aria-hidden="true">
                      {preset.colors.map((hex) => (
                        <span key={hex} style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                    <div className="help-preset-text">
                      <strong>{preset.name}</strong>
                      <span>{preset.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* 5.4 & 5.5 Küme Sayısı (Etkileşimli) ve Yatay / Izgara Görünümü (Önce / Sonra) */}
            <div className="help-two-col-grid">
              {/* 5.4 Küme Sayısı */}
              <article className="help-guide-card">
                <div className="help-subhead-row">
                  <SlidersHorizontal size={18} aria-hidden="true" />
                  <h3>5.4. Renk Küme Sayısı Seçimi</h3>
                </div>
                <p className="help-prose">
                  Sonuç panelinin üst çubuğunda <strong>Otomatik (5-8)</strong>, <strong>5 Renk</strong>, <strong>6 Renk</strong>, <strong>7 Renk</strong> ve <strong>8 Renk</strong> seçenekleri bulunur. Küme sayısını artırdıkça görseldeki daha ince renk geçişleri ayrı kartlar hâlinde ortaya çıkar. Aşağıdan sayıyı seçerek farkı deneyebilirsiniz:
                </p>

                <div className="help-interactive-demo" role="region" aria-label="Etkileşimli küme sayısı örneği">
                  <div className="demo-controls-bar" role="group" aria-label="Örnek küme sayısı seçimi">
                    {([5, 6, 7, 8] as const).map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        className={`cluster-btn ${demoClusterCount === cnt ? 'active' : ''}`}
                        onClick={() => setDemoClusterCount(cnt)}
                      >
                        {cnt} Renk
                      </button>
                    ))}
                  </div>
                  <div className="demo-spectrum-bar" aria-label={`${demoClusterCount} renk kümesi önizlemesi`}>
                    {demoSwatches.map((s) => (
                      <div
                        key={s.hex}
                        className="demo-spectrum-seg"
                        style={{ width: `${s.pct}%`, backgroundColor: s.hex }}
                        title={`${s.name} (${s.hex}) · %${s.pct}`}
                      />
                    ))}
                  </div>
                  <div className="demo-swatches-caption">
                    {demoSwatches.map((s) => (
                      <span key={s.hex} className="demo-swatch-mini-label">
                        <span className="mini-color-box" style={{ backgroundColor: s.hex }} aria-hidden="true" />
                        <span className="mono-font">{s.hex}</span>
                        <span>%{s.pct}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </article>

              {/* 5.5 Yatay Kartlar ve Izgara Görünümü */}
              <article className="help-guide-card">
                <div className="help-subhead-row">
                  <Grid size={18} aria-hidden="true" />
                  <h3>5.5. Yatay Kartlar ve Izgara Görünümü</h3>
                </div>
                <p className="help-prose">
                  Sonuç araç çubuğundaki görünüm anahtarıyla aynı renk paletini <strong>Yatay Kartlar</strong> (detaylı satır düzeni) veya <strong>Izgara</strong> (kompakt kare kart düzeni) biçiminde görüntüleyebilirsiniz:
                </p>

                <div className="help-interactive-demo" role="region" aria-label="Yatay kart ve ızgara görünüm karşılaştırması">
                  <div className="palette-view-toggle help-demo-view-toggle" role="group" aria-label="Örnek görünüm modu">
                    <button
                      type="button"
                      className={`view-toggle-btn ${demoViewMode === 'horizontal' ? 'active' : ''}`}
                      onClick={() => setDemoViewMode('horizontal')}
                    >
                      <List size={14} aria-hidden="true" />
                      <span>Yatay Kartlar</span>
                    </button>
                    <button
                      type="button"
                      className={`view-toggle-btn ${demoViewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setDemoViewMode('grid')}
                    >
                      <Grid size={14} aria-hidden="true" />
                      <span>Izgara</span>
                    </button>
                  </div>

                  {demoViewMode === 'horizontal' ? (
                    <div className="demo-layout-horizontal">
                      <div className="demo-h-row">
                        <span className="demo-h-swatch" style={{ backgroundColor: '#B2AC88' }} />
                        <div className="demo-h-meta">
                          <strong className="mono-font">#B2AC88</strong>
                          <span>Adaçayı Yeşili · Yeşil · Geçişli</span>
                        </div>
                        <span className="demo-h-pct mono-font">%28</span>
                      </div>
                      <div className="demo-h-row">
                        <span className="demo-h-swatch" style={{ backgroundColor: '#23395B' }} />
                        <div className="demo-h-meta">
                          <strong className="mono-font">#23395B</strong>
                          <span>Prusya Mavisi · Mavi · Soğuk</span>
                        </div>
                        <span className="demo-h-pct mono-font">%24</span>
                      </div>
                    </div>
                  ) : (
                    <div className="demo-layout-grid">
                      {[
                        { hex: '#B2AC88', pct: '%28', name: 'Adaçayı Yeşili' },
                        { hex: '#23395B', pct: '%24', name: 'Prusya Mavisi' },
                        { hex: '#D4A843', pct: '%19', name: 'Hardal Sarısı' },
                      ].map((g) => (
                        <div key={g.hex} className="demo-g-card">
                          <div className="demo-g-swatch" style={{ backgroundColor: g.hex }} />
                          <strong className="mono-font">{g.hex}</strong>
                          <span>{g.pct} · {g.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </div>

            {/* 5.6 Renk Kartlarını İnceleme (#B2AC88 örnek açıklamalı kartı) */}
            <article className="help-guide-card">
              <div className="help-subhead-row">
                <Copy size={18} aria-hidden="true" />
                <h3>5.6. Renk Kartlarını İnceleme ve Tek Tıkla HEX Kopyalama</h3>
              </div>
              <p className="help-prose">
                Analiz sonucundaki her renk kartı 7 temel bilgiyi bir arada sunar. Kartın üzerine veya renk şeridine tıkladığınızda HEX kodu otomatik olarak panoya kopyalanır:
              </p>

              <div className="help-annotated-card-grid">
                <div className="annotated-sample-card">
                  <button
                    type="button"
                    className="annotated-sample-btn"
                    onClick={handleCopySampleHex}
                    aria-label="#B2AC88 örnek rengini panoya kopyala"
                  >
                    <div className="annotated-swatch" style={{ backgroundColor: '#B2AC88' }}>
                      <span className="annotated-copy-hint">
                        {copiedDemoHex ? (
                          <>
                            <Check size={13} aria-hidden="true" />
                            <span>Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} aria-hidden="true" />
                            <span>Kopyalamak için tıkla</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="annotated-body">
                      <div className="annotated-top-line">
                        <strong className="mono-font">#B2AC88</strong>
                        <span className="mono-font">rgb(178, 172, 136)</span>
                      </div>
                      <div className="annotated-name-line">
                        <span>Adaçayı Yeşili</span>
                        <span aria-hidden="true">·</span>
                        <span>Yeşil Ailesi</span>
                      </div>
                      <div className="annotated-footer-line">
                        <span>Oran: %28.4</span>
                        <span aria-hidden="true">·</span>
                        <span>Sıcaklık: Geçişli / dengeli</span>
                      </div>
                    </div>
                  </button>
                </div>

                <ul className="help-callout-list">
                  <li><strong>1. Renk Örneği:</strong> Rengin gerçek ton kutusu; tıklandığında kopyalama yapar.</li>
                  <li><strong>2. HEX Kodu:</strong> <code className="mono-inline">#B2AC88</code> gibi 6 haneli dijital renk kodu.</li>
                  <li><strong>3. RGB Değeri:</strong> Kırmızı, yeşil ve mavi bileşenleri (<code className="mono-inline">rgb(178, 172, 136)</code>).</li>
                  <li><strong>4. Renk Adı:</strong> 368 renk sözlüğünden seçilen en yakın ad (ör. Adaçayı Yeşili).</li>
                  <li><strong>5. Kullanım Yüzdesi:</strong> Rengin görseldeki yaklaşık kaplama oranı (<code className="mono-inline">%28.4</code>).</li>
                  <li><strong>6. Renk Ailesi:</strong> Rengin ait olduğu ana grup (ör. Yeşil, Mavi, Nötr).</li>
                  <li><strong>7. Göreli Sıcaklık:</strong> Rengin sıcak/soğuk görsel yönelim bilgisi ve skoru.</li>
                </ul>
              </div>
            </article>

            {/* 5.7 Renk Sıcaklığı & 5.8 Mekânsal Renk İlişkileri */}
            <div className="help-two-col-grid">
              {/* 5.7 Renk Sıcaklığı Analizi */}
              <article className="help-guide-card">
                <div className="help-subhead-row">
                  <Sparkles size={18} aria-hidden="true" />
                  <h3>5.7. Renk Sıcaklığı Analizi</h3>
                </div>
                <p className="help-prose">
                  Analiz sonucunda fotoğrafınızdaki renklerin görsel sıcaklık dağılımı 4 grupta özetlenir. Renklerin yüzdeleri yalnızca renkle değil metin etiketleriyle de gösterilir:
                </p>

                <div className="help-temp-explain-list">
                  <div className="help-temp-row">
                    <span className="temp-color-block" style={{ backgroundColor: '#B45309' }} aria-hidden="true" />
                    <div>
                      <strong>Sıcak yönelimli</strong>
                      <span>Kırmızı, turuncu, altın sarısı ve sıcak toprak tonları baskındır.</span>
                    </div>
                  </div>
                  <div className="help-temp-row">
                    <span className="temp-color-block" style={{ backgroundColor: '#7C7A52' }} aria-hidden="true" />
                    <div>
                      <strong>Geçişli / dengeli</strong>
                      <span>Sıcak ve soğuk arasında kalan zeytin, ara yeşil ve morumsu geçiş tonlarıdır.</span>
                    </div>
                  </div>
                  <div className="help-temp-row">
                    <span className="temp-color-block" style={{ backgroundColor: '#1E4E79' }} aria-hidden="true" />
                    <div>
                      <strong>Soğuk yönelimli</strong>
                      <span>Mavi, camgöbeği, serin yeşil ve soğuk menekşe tonlarıdır.</span>
                    </div>
                  </div>
                  <div className="help-temp-row">
                    <span className="temp-color-block" style={{ backgroundColor: '#78716C' }} aria-hidden="true" />
                    <div>
                      <strong>Nötr / akromatik</strong>
                      <span>Siyah, beyaz, gri ve renk doygunluğu çok düşük tonlardır (ortalamaya katılmaz).</span>
                    </div>
                  </div>
                </div>

                <p className="help-disclaimer-line">
                  <strong>Önemli:</strong> Bu skor fiziksel ısı veya Kelvin ışık sıcaklığı değildir; yalnızca renklerin görsel sıcak/soğuk yönelimini ifade eder.
                </p>
              </article>

              {/* 5.8 Mekânsal Renk İlişkileri */}
              <article className="help-guide-card">
                <div className="help-subhead-row">
                  <Layers size={18} aria-hidden="true" />
                  <h3>5.8. Mekânsal Renk İlişkileri (Komşu Kontrastlar)</h3>
                </div>
                <p className="help-prose">
                  Sistem yalnızca görselde hangi renklerin bulunduğuna değil, fotoğrafın farklı bölgelerinde hangi renklerin yan yana durduğuna da bakar. Yan yana duran sıcak ve soğuk bölgeler arasındaki kontrast görsel olarak listelenir.
                </p>

                <div className="help-spatial-svg-wrap" aria-label="Mekânsal komşuluk şeması">
                  <svg viewBox="0 0 340 155" className="help-spatial-svg" role="img" aria-label="Sıcak ve soğuk komşu renk bölgeleri şeması">
                    <rect x="8" y="8" width="145" height="106" rx="6" fill="#C98A3E" />
                    <text x="80" y="55" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600">Sıcak Bölge</text>
                    <text x="80" y="73" textAnchor="middle" fill="#FBF9F5" fontSize="11" fontFamily="monospace">#C98A3E</text>

                    <rect x="187" y="8" width="145" height="106" rx="6" fill="#2A598C" />
                    <text x="260" y="55" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600">Soğuk Bölge</text>
                    <text x="260" y="73" textAnchor="middle" fill="#FBF9F5" fontSize="11" fontFamily="monospace">#2A598C</text>

                    <line x1="157" y1="61" x2="183" y2="61" stroke="#1C1917" strokeWidth="2" />
                    <circle cx="170" cy="61" r="10" fill="#FBF9F5" stroke="#1C1917" strokeWidth="1.5" />
                    <text x="170" y="65" textAnchor="middle" fill="#1C1917" fontSize="11" fontWeight="700">↔</text>

                    <text x="170" y="138" textAnchor="middle" fill="#57534E" fontSize="11">
                      Ortak komşuluk sınırı: Sıcak–Soğuk kontrast çifti
                    </text>
                  </svg>
                </div>
              </article>
            </div>

            {/* 5.9 JSON İndirme & 5.10 Yeni Görsel Analiz + Gizlilik */}
            <div className="help-two-col-grid">
              {/* 5.9 JSON İndirme */}
              <article className="help-guide-card">
                <div className="help-subhead-row">
                  <Download size={18} aria-hidden="true" />
                  <h3>5.9. JSON İndirme</h3>
                </div>
                <p className="help-prose">
                  Baskın renk paleti başlığının sağındaki <strong>&quot;JSON İndir&quot;</strong> butonuna bastığınızda elde edilen renklerin kodları, yüzdeleri ve sıcaklık özeti düzenli bir JSON dosyası olarak bilgisayarınıza iner. Bu dosyayı tasarım yazılımlarında, akademik incelemelerde veya başka uygulamalarda kullanabilirsiniz.
                </p>
                <pre className="help-json-snippet" aria-label="Örnek JSON çıktısı">
{`{
  "title": "Kamera Fotoğrafı",
  "overallTemperature": "Geçişli / dengeli",
  "dominantColors": [
    { "hex": "#B2AC88", "percentage": 28.4, "name": "Adaçayı Yeşili" }
  ]
}`}
                </pre>
              </article>

              {/* 5.10 Yeni Görsel Analizi & Gizlilik */}
              <article className="help-guide-card">
                <div className="help-subhead-row">
                  <RotateCcw size={18} aria-hidden="true" />
                  <h3>5.10. Yeni Görsel Analizi ve Gizlilik Güvencesi</h3>
                </div>
                <p className="help-prose">
                  Bir analizi bitirdikten sonra yeni bir fotoğraf denemek için sonuç başlığındaki veya önizleme kutusundaki <strong>&quot;Yeni Görsel Analiz&quot;</strong> butonuna basmanız yeterlidir. Bu işlem önceki sonucu temizler ve sizi tekrar fotoğraf yükleme / kamera ekranına döndürür.
                </p>

                <div className="help-before-after-strip" aria-label="Yeni Görsel Analiz geçiş akışı">
                  <div className="ba-box">
                    <span className="ba-label">Sonuç Ekranı</span>
                    <strong>Önizleme + Palet</strong>
                  </div>
                  <div className="ba-arrow">
                    <ArrowRight size={16} aria-hidden="true" />
                    <span>Yeni Görsel Analiz</span>
                  </div>
                  <div className="ba-box">
                    <span className="ba-label">Giriş Ekranı</span>
                    <strong>Yükle · Kamera · Örnekler</strong>
                  </div>
                </div>

                <div className="help-privacy-alert" role="note">
                  <ShieldCheck size={18} aria-hidden="true" />
                  <div>
                    <strong>Önemli Gizlilik Açıklaması:</strong> Yüklediğiniz veya kamerayla çektiğiniz hiçbir fotoğraf dijital müze arşivine ya da uzak bir sunucuya kaydedilmez. Fotoğraflar yalnızca o anki renk analizi işlemi için tarayıcı belleğinizde kullanılır.
                  </div>
                </div>
              </article>
            </div>

            <div className="help-section-cta-row">
              <button
                type="button"
                className="btn-primary"
                onClick={() => onNavigate('analyzer')}
              >
                <Camera size={16} aria-hidden="true" />
                <span>Şimdi Görsel Analiz Et</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ==================================================================
          6. DİJİTAL ARŞİV NASIL KULLANILIR?
          ================================================================== */}
      <section id="help-archive" className="help-section" aria-labelledby="helpArchiveTitle">
        <div className="help-section-header help-header-with-toggle">
          <div>
            <span className="section-kicker">Modül 02 · Dijital Arşiv</span>
            <h2 id="helpArchiveTitle" className="help-section-title">
              Dijital Arşiv Nasıl Kullanılır?
            </h2>
            <p className="help-section-lead">
              The Metropolitan Museum of Art ve Cleveland Museum of Art açık erişim koleksiyonlarından derlenen 205 müze eserini keşfedin, filtreleyin ve eksik paletleri oluşturun.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary help-collapse-btn"
            aria-expanded={expandedPanels.archiveGuides}
            aria-controls="helpArchiveBody"
            onClick={() => togglePanel('archiveGuides')}
          >
            <span>{expandedPanels.archiveGuides ? 'Bölümü Daralt' : 'Adımları Genişlet'}</span>
            {expandedPanels.archiveGuides ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {expandedPanels.archiveGuides && (
          <div id="helpArchiveBody" className="help-module-body">
            <div className="help-two-col-grid">
              {/* 6.1 & 6.2 Eserleri Keşfetme + Arama & Filtreleme */}
              <article className="help-guide-card">
                <div className="help-subhead-row">
                  <Filter size={18} aria-hidden="true" />
                  <h3>6.1 &amp; 6.2. 205 Müze Eserini Keşfetme ve Filtreleme</h3>
                </div>
                <p className="help-prose">
                  Üst menüden <strong>&quot;Dijital Arşiv&quot;</strong> sekmesini açtığınızda <strong>The Met</strong> (105 eser) ve <strong>Cleveland Museum of Art</strong> (100 eser) kaynaklı toplam <strong>205 sanat eseri</strong> listelenir. Üstteki kontrol çubuğunu kullanarak koleksiyonu şu ölçütlere göre daraltabilirsiniz:
                </p>

                <div className="help-filter-diagram" aria-label="Arşiv filtreleme alanları diyagramı">
                  <div className="filter-pill-row">
                    <span><Search size={13} aria-hidden="true" /> Eser Adı / Kelime</span>
                    <span>Sanatçı</span>
                    <span>Dönem / Departman</span>
                    <span>Renk Ailesi (Mavi, Sarı…)</span>
                    <span>Renk Sıcaklığı</span>
                  </div>
                </div>
              </article>

              {/* 6.3 & 6.4 Eser Detayları + Analizörde Aç */}
              <article className="help-guide-card">
                <div className="help-subhead-row">
                  <Eye size={18} aria-hidden="true" />
                  <h3>6.3 &amp; 6.4. Eser Detaylarını İnceleme ve &quot;Analizörde Aç&quot;</h3>
                </div>
                <p className="help-prose">
                  Herhangi bir eser kartına tıkladığınızda ayrıntılı inceleme penceresi açılır. Burada mevcutsa <strong>Eser adı, Sanatçı, Tarih, Malzeme/teknik, Müze bilgisi, Renk paleti</strong> ve <strong>resmî müze kaynak bağlantısını</strong> inceleyebilirsiniz.
                </p>
                <div className="help-modal-wireframe" aria-label="Eser detay penceresi ve Analizörde Aç akışı">
                  <div className="wireframe-col-info">
                    <strong>Eser Detay Penceresi</strong>
                    <span>Eser Adı · Sanatçı · Tarih · Malzeme/Teknik · Müze · Kaynak Bağlantısı</span>
                  </div>
                  <div className="wireframe-col-action">
                    <span className="wireframe-btn-sample">Analizörde Aç</span>
                    <small>Eseri kümeleme ekranına aktarır</small>
                  </div>
                </div>
              </article>

              {/* 6.5 Eksik Paletleri Oluşturma */}
              <article className="help-guide-card">
                <div className="help-subhead-row">
                  <RefreshCw size={18} aria-hidden="true" />
                  <h3>6.5. Eksik Renk Paletlerini Oluşturma</h3>
                </div>
                <p className="help-prose">
                  Katalogdaki bazı eserlerin renk paleti henüz çıkarılmamış olabilir. İki farklı yöntemle gerçek görsel piksellerinden palet üretebilirsiniz:
                </p>
                <ul className="help-callout-list">
                  <li>
                    <strong>Tekil Oluşturma:</strong> Bekleyen eserin kartındaki <strong>&quot;Paleti oluştur&quot;</strong> butonuna basın.
                  </li>
                  <li>
                    <strong>Toplu Oluşturma:</strong> Arşiv üst panelindeki <strong>&quot;Eksik paletleri oluştur&quot;</strong> butonu bekleyen eserleri sırayla işler; ilerleme çubuğunu izleyebilir, istediğiniz an <strong>&quot;Analizi Durdur&quot;</strong> diyebilirsiniz.
                  </li>
                  <li>
                    <strong>Hata Durumu:</strong> Müze görsel sunucusuna geçici olarak ulaşılamazsa kartta <strong>&quot;Tekrar dene&quot;</strong> seçeneği belirir.
                  </li>
                </ul>
              </article>

              {/* 6.6 Renklerin Kültürel Anlamları */}
              <article className="help-guide-card">
                <div className="help-subhead-row">
                  <History size={18} aria-hidden="true" />
                  <h3>6.6. Renklerin Kültürel Anlamları (11 Ana Renk Ailesi)</h3>
                </div>
                <p className="help-prose">
                  Dijital Arşiv sayfasındaki ikinci sekme olan <strong>&quot;Renk Aileleri &amp; Kültürel Anlamlar&quot;</strong> alanına geçtiğinizde 11 ana renk ailesi kartlarını görürsünüz. Bir renk kartına tıkladığınızda o rengin farklı dönem ve coğrafyalardaki tarihsel anlamlarını, pigmentlerini ve akademik kaynaklarını açabilirsiniz.
                </p>
                <div className="help-meanings-mini-strip" aria-label="11 ana renk ailesi özeti">
                  {COLOR_FAMILIES_13.slice(0, 11).map((fam) => (
                    <span key={fam.tr} className="meaning-mini-chip">
                      <span className="mini-color-box" style={{ backgroundColor: fam.hex }} aria-hidden="true" />
                      <span>{fam.tr}</span>
                    </span>
                  ))}
                </div>
              </article>
            </div>

            <div className="help-section-cta-row">
              <button
                type="button"
                className="btn-primary"
                onClick={() => onNavigate('archive')}
              >
                <ImageIcon size={16} aria-hidden="true" />
                <span>Arşivi Keşfet</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ==================================================================
          7. RENK ARAMA NASIL KULLANILIR?
          ================================================================== */}
      <section id="help-search" className="help-section" aria-labelledby="helpSearchTitle">
        <div className="help-section-header help-header-with-toggle">
          <div>
            <span className="section-kicker">Modül 03 · Renk Arama</span>
            <h2 id="helpSearchTitle" className="help-section-title">
              Renk Arama Nasıl Kullanılır?
            </h2>
            <p className="help-section-lead">
              Aklınızdaki bir renk kodunu, RGB değerini veya renk adını yazarak hem 368 renk sözlüğünde en yakın 10 eşleşmeyi hem de o renge benzeyen müze tablolarını bulun.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary help-collapse-btn"
            aria-expanded={expandedPanels.searchGuides}
            aria-controls="helpSearchBody"
            onClick={() => togglePanel('searchGuides')}
          >
            <span>{expandedPanels.searchGuides ? 'Bölümü Daralt' : 'Adımları Genişlet'}</span>
            {expandedPanels.searchGuides ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {expandedPanels.searchGuides && (
          <div id="helpSearchBody" className="help-module-body">
            {/* 7.1, 7.2, 7.3, 7.4 */}
            <div className="help-three-col-grid">
              <article className="help-guide-card">
                <h3>7.1. HEX ile Arama</h3>
                <p className="help-prose">
                  <strong>&quot;HEX Kodu ile Ara&quot;</strong> kutusuna <code className="mono-inline">#B2AC88</code> gibi 6 haneli bir renk kodu yazın veya soldaki renk seçici kutudan görsel olarak bir ton seçin.
                </p>
                <div className="help-input-preview">
                  <span className="mini-color-box lg" style={{ backgroundColor: '#B2AC88' }} aria-hidden="true" />
                  <span className="mono-font">#B2AC88</span>
                </div>
              </article>

              <article className="help-guide-card">
                <h3>7.2. RGB ile Arama</h3>
                <p className="help-prose">
                  Elinde kırmızı-yeşil-mavi değerleri olanlar <strong>&quot;RGB Değeri ile Ara&quot;</strong> alanına <code className="mono-inline">178, 172, 136</code> biçiminde değer girebilir.
                </p>
                <div className="help-input-preview">
                  <span className="mono-font">rgb(178, 172, 136)</span>
                </div>
              </article>

              <article className="help-guide-card">
                <h3>7.3. Renk Adına Göre Arama</h3>
                <p className="help-prose">
                  Türkçe veya İngilizce renk adlarıyla (ör. <em>Adaçayı</em>, <em>Prussian Blue</em>, <em>Ultramarine</em>) arama yaparak doğrudan sözlük eşleşmelerini listeleyin.
                </p>
                <div className="help-input-preview">
                  <Search size={14} aria-hidden="true" />
                  <span>&quot;Prussian Blue&quot; · &quot;Adaçayı&quot;</span>
                </div>
              </article>
            </div>

            {/* 7.4 Renk Ailesi Filtresi */}
            <article className="help-guide-card">
              <div className="help-subhead-row">
                <Palette size={18} aria-hidden="true" />
                <h3>7.4. 13 Renk Ailesine Göre Filtreleme</h3>
              </div>
              <p className="help-prose">
                Arama sonuçlarını yalnızca belirli bir renk grubuyla sınırlamak isterseniz 13 renk ailesi filtresinden birini seçebilirsiniz:
              </p>
              <div className="help-families-13-grid" aria-label="13 renk ailesi filtresi">
                {COLOR_FAMILIES_13.map((fam) => (
                  <div key={fam.tr} className="family-13-item">
                    <span className="mini-color-box" style={{ backgroundColor: fam.hex }} aria-hidden="true" />
                    <span>{fam.tr}</span>
                  </div>
                ))}
              </div>
            </article>

            {/* 7.5, 7.6, 7.7 Görsel Akış & Tarihsel Bağlam */}
            <div className="help-two-col-grid">
              <article className="help-guide-card">
                <div className="help-subhead-row">
                  <Compass size={18} aria-hidden="true" />
                  <h3>7.5. En Yakın 10 Renk &amp; 7.6. Sanat Eserlerinde Arama</h3>
                </div>
                <p className="help-prose">
                  Girdiğiniz renk, insan gözünün algısına uygun <strong>CIEDE2000</strong> karşılaştırma yöntemiyle <strong>368 renk kaydı</strong> arasında taranır ve size en yakın <strong>10 renk eşleşmesi</strong> sunulur. Aynı anda arşivdeki paleti analiz edilmiş müze eserleri de hedef renge olan yakınlığına göre sıralanır.
                </p>
                <div className="help-funnel-diagram" aria-label="Renk arama çıktı şeması">
                  <div className="funnel-node">
                    <span className="mini-color-box" style={{ backgroundColor: '#B2AC88' }} aria-hidden="true" />
                    <span>Hedef Renk</span>
                  </div>
                  <ArrowDown size={16} aria-hidden="true" />
                  <div className="funnel-node accent">
                    <span>CIEDE2000 Algısal Karşılaştırma (368 Renk &amp; Arşiv Paletleri)</span>
                  </div>
                  <ArrowDown size={16} aria-hidden="true" />
                  <div className="funnel-split">
                    <div>En Yakın 10 Sözlük Rengi</div>
                    <div>Benzer Sanat Eserleri Listesi</div>
                  </div>
                </div>
              </article>

              <article className="help-guide-card">
                <div className="help-subhead-row">
                  <History size={18} aria-hidden="true" />
                  <h3>7.7. Tarihsel Renk ve Pigment Bilgisi</h3>
                </div>
                <p className="help-prose">
                  Bulduğunuz her eşleşme kartının altındaki <strong>&quot;Tarihsel renk ve pigment bağlamı&quot;</strong> butonuna basarak yalnızca günümüzdeki rengi değil, o tona en yakın tarihsel sanat pigmentini (38 kayıt), kimyasal içeriğini ve kültürel anlamlarını aynı panel içinde okuyabilirsiniz.
                </p>
                <div className="help-drawer-preview">
                  <div className="drawer-preview-head">
                    <History size={15} aria-hidden="true" />
                    <span>Tarihsel Renk ve Pigment Bağlamı</span>
                  </div>
                  <p>
                    Örnek: Doğal Toprak Yeşili (Terre Verte) · Kullanım dönemi, kaynak müze notları ve kültürel bağlam çekmecesi.
                  </p>
                </div>
              </article>
            </div>

            <div className="help-section-cta-row">
              <button
                type="button"
                className="btn-primary"
                onClick={() => onNavigate('search')}
              >
                <Search size={16} aria-hidden="true" />
                <span>Renk Aramaya Git</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ==================================================================
          8. İSTATİSTİKLER NASIL OKUNUR?
          ================================================================== */}
      <section id="help-stats" className="help-section" aria-labelledby="helpStatsTitle">
        <div className="help-section-header help-header-with-toggle">
          <div>
            <span className="section-kicker">Modül 04 · İstatistikler</span>
            <h2 id="helpStatsTitle" className="help-section-title">
              İstatistikler Nasıl Okunur?
            </h2>
            <p className="help-section-lead">
              İstatistikler sekmesi dijital koleksiyondaki renk eğilimlerini bir bakışta görmenizi sağlar. Her kartın yanındaki soru işareti (?) simgesinin üzerine gelerek veya tıklayarak da kısa açıklamayı görebilirsiniz.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary help-collapse-btn"
            aria-expanded={expandedPanels.statsGuides}
            aria-controls="helpStatsBody"
            onClick={() => togglePanel('statsGuides')}
          >
            <span>{expandedPanels.statsGuides ? 'Bölümü Daralt' : 'Adımları Genişlet'}</span>
            {expandedPanels.statsGuides ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {expandedPanels.statsGuides && (
          <div id="helpStatsBody" className="help-module-body">
            <div className="help-stats-explain-grid">
              <div className="stat-explain-item">
                <h3>1. İndekslenen Eser Sayısı</h3>
                <p>Dijital arşiv kataloğunda kayıtlı ve aranabilir durumda olan toplam benzersiz müze eseri sayısını gösterir.</p>
              </div>
              <div className="stat-explain-item">
                <h3>2. Analiz Edilen Eser Sayısı</h3>
                <p>Gerçek görsel piksellerinden baskın renk paleti çıkarılmış ve renk istatistiklerine katılan eser adedidir.</p>
              </div>
              <div className="stat-explain-item">
                <h3>3. Paleti Bekleyen Eser Sayısı</h3>
                <p>Katalogda yer alan ancak henüz piksel paleti oluşturulmamış eserleri sayar; bu eserler sıcaklık ortalamasını bozmasın diye nötr kabul edilmez.</p>
              </div>
              <div className="stat-explain-item">
                <h3>4. Toplam Renk Kümesi</h3>
                <p>Analizi tamamlanmış tüm eserlerden çıkarılan baskın renk kartlarının toplam adedidir.</p>
              </div>
              <div className="stat-explain-item">
                <h3>5. Ortalama Kromatik Çeşitlilik</h3>
                <p>Eserlerin paletlerindeki renklerin birbirinden ne kadar farklılaştığını gösteren 0–100 arası ortalama puandır.</p>
              </div>
              <div className="stat-explain-item">
                <h3>6. Genel Renk Sıcaklığı Dağılımı</h3>
                <p>Analiz edilmiş koleksiyonda sıcak, geçişli, soğuk ve nötr ağırlıklı eserlerin yüzdesel dağılımını gösterir.</p>
              </div>
              <div className="stat-explain-item">
                <h3>7. En Sık Kullanılan Renk Aileleri</h3>
                <p>Müze koleksiyonundaki eserlerde en sık tekrar eden renk ailelerini (ör. Mavi, Sarı, Yeşil, Kırmızı) sıralar.</p>
              </div>
              <div className="stat-explain-item highlight-tip">
                <div className="help-subhead-row">
                  <CircleHelp size={17} aria-hidden="true" />
                  <h3>Soru İşareti (?) İpucu Kutuları</h3>
                </div>
                <p>
                  Kartların köşesindeki <strong>?</strong> simgesine masaüstünde fareyle gelin, mobilde dokunun veya klavyeyle odaklanıp Enter&apos;a basın; açıklayıcı ipucu kutusu hemen açılır.
                </p>
              </div>
            </div>

            {/* Sade Grafik Örnekleri */}
            <div className="help-two-col-grid">
              <article className="help-guide-card">
                <h3>Örnek: Koleksiyon Sıcaklık Dağılımı Çubuğu</h3>
                <p className="help-prose">
                  Yatay çubuk; analiz edilmiş eserlerin görsel sıcaklık yönelim oranlarını yüzdeleriyle birlikte özetler:
                </p>
                <div className="help-sample-temp-bar" role="img" aria-label="Örnek sıcaklık dağılım çubuğu">
                  <div style={{ width: '42%', backgroundColor: '#B45309' }}>Sıcak %42</div>
                  <div style={{ width: '24%', backgroundColor: '#7C7A52' }}>Geçişli %24</div>
                  <div style={{ width: '26%', backgroundColor: '#1E4E79' }}>Soğuk %26</div>
                  <div style={{ width: '8%', backgroundColor: '#78716C' }}>Nötr %8</div>
                </div>
              </article>

              <article className="help-guide-card">
                <h3>Örnek: En Sık Kullanılan Renk Aileleri</h3>
                <p className="help-prose">
                  Çubuk grafiği hangi renk grubunun koleksiyonda ne yoğunlukta kullanıldığını karşılaştırmanıza yardımcı olur:
                </p>
                <div className="help-mini-bar-list">
                  {[
                    { name: 'Sarı & Toprak', pct: 34, hex: '#D8A838' },
                    { name: 'Mavi', pct: 26, hex: '#2A598C' },
                    { name: 'Kırmızı', pct: 18, hex: '#A83838' },
                  ].map((item) => (
                    <div key={item.name} className="mini-bar-row">
                      <span>{item.name}</span>
                      <div className="mini-bar-track">
                        <div className="mini-bar-fill" style={{ width: `${item.pct * 2.2}%`, backgroundColor: item.hex }} />
                      </div>
                      <span className="mono-font">%{item.pct}</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="help-section-cta-row">
              <button
                type="button"
                className="btn-primary"
                onClick={() => onNavigate('stats')}
              >
                <BarChart3 size={16} aria-hidden="true" />
                <span>İstatistikleri Gör</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ==================================================================
          9. PROJE HAKKINDA SAYFASI İLE ARASINDAKİ FARK
          ================================================================== */}
      <section id="help-about-diff" className="help-section" aria-labelledby="helpAboutDiffTitle">
        <div className="help-section-header">
          <span className="section-kicker">Sayfa Ayrımı</span>
          <h2 id="helpAboutDiffTitle" className="help-section-title">
            Yardım ve Proje Hakkında Sayfalarının Farkı Nedir?
          </h2>
        </div>

        <div className="help-two-col-grid">
          <article className="help-guide-card">
            <div className="help-subhead-row">
              <CircleHelp size={18} aria-hidden="true" />
              <h3>Yardım Sayfası (Şu An Buradasınız)</h3>
            </div>
            <p className="help-prose">
              Günlük kullanım kılavuzudur. Hangi butona basacağınızı, fotoğrafı veya kamerayı nasıl kullanacağınızı, sonuç kartlarını nasıl okuyacağınızı ve olası sorunları nasıl çözeceğinizi adım adım gösterir.
            </p>
          </article>

          <article className="help-guide-card">
            <div className="help-subhead-row">
              <BookOpen size={18} aria-hidden="true" />
              <h3>Proje Hakkında Sayfası</h3>
            </div>
            <p className="help-prose">
              ChromArchive&apos;ın akademik ve teknik arka planını anlatır: projenin kuruluş amacı, renk analiz algoritmalarının bilimsel metodolojisi, teknik mimari ve açık erişimli müze veri kaynakları orada yer alır.
            </p>
            <div className="help-inline-action">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onNavigate('about')}
              >
                <span>Proje Hakkında Sayfasına Git</span>
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* ==================================================================
          10. SÖZLÜK: BİLMEN GEREKEN TERİMLER
          ================================================================== */}
      <section id="help-glossary" className="help-section" aria-labelledby="helpGlossaryTitle">
        <div className="help-section-header">
          <span className="section-kicker">Kolay Anlaşılır Sözlük</span>
          <h2 id="helpGlossaryTitle" className="help-section-title">
            Bilmen Gereken Terimler
          </h2>
          <p className="help-section-lead">
            Uygulama ekranlarında karşılaştığınız teknik kavramların kısa ve sade açıklamaları.
          </p>
        </div>

        <div className="help-glossary-grid">
          <article className="glossary-card">
            <div className="glossary-visual mono-font">
              <span className="mini-color-box" style={{ backgroundColor: '#B2AC88' }} aria-hidden="true" />
              <span>#B2AC88</span>
            </div>
            <h3>HEX</h3>
            <p>Bir rengin web ve tasarım araçlarında kullanılan 6 haneli dijital renk kodudur.</p>
          </article>

          <article className="glossary-card">
            <div className="glossary-visual mono-font">
              <span className="rgb-dot r" aria-hidden="true" />
              <span className="rgb-dot g" aria-hidden="true" />
              <span className="rgb-dot b" aria-hidden="true" />
              <span>178, 172, 136</span>
            </div>
            <h3>RGB</h3>
            <p>Ekranlarda renk oluşturan Kırmızı (Red), Yeşil (Green) ve Mavi (Blue) ışık bileşenleridir.</p>
          </article>

          <article className="glossary-card">
            <div className="glossary-visual">
              <span className="mini-color-box" style={{ backgroundColor: '#23395B' }} aria-hidden="true" />
              <span>%31 Alan</span>
            </div>
            <h3>Baskın Renk</h3>
            <p>Bir görselde en geniş alanı kaplayan ve eserin genel karakterini belirleyen ana renklerden biridir.</p>
          </article>

          <article className="glossary-card">
            <div className="glossary-visual">
              <span>5–8 Benzer Grup</span>
            </div>
            <h3>K-Means++</h3>
            <p>Görseldeki milyonlarca pikseli renk yakınlığına göre 5 ile 8 ana grup altında toplayan analiz yöntemidir.</p>
          </article>

          <article className="glossary-card">
            <div className="glossary-visual">
              <span>L* · a* · b*</span>
            </div>
            <h3>CIELAB</h3>
            <p>Renkleri bilgisayar ekranı yerine insan gözünün gerçekte algıladığı biçime daha yakın ifade eden renk uzayıdır.</p>
          </article>

          <article className="glossary-card">
            <div className="glossary-visual mono-font">
              <span>ΔE ≈ 1.8</span>
            </div>
            <h3>Delta E 2000</h3>
            <p>İki rengin insan gözüne ne kadar benzer ya da farklı göründüğünü sayısal olarak karşılaştıran yöntemdir.</p>
          </article>

          <article className="glossary-card">
            <div className="glossary-visual">
              <span>0 – 100 Puan</span>
            </div>
            <h3>Kromatik Çeşitlilik</h3>
            <p>Bir görseldeki renklerin birbirinden ne kadar zengin ve çeşitli olduğunu ifade eden 0–100 arası ölçümdür.</p>
          </article>

          <article className="glossary-card">
            <div className="glossary-visual">
              <span className="mini-color-box" style={{ backgroundColor: '#B45309' }} aria-hidden="true" />
              <span>↔</span>
              <span className="mini-color-box" style={{ backgroundColor: '#1E4E79' }} aria-hidden="true" />
            </div>
            <h3>Renk Sıcaklığı</h3>
            <p>Bir rengin sarı-kırmızı (sıcak) ya da mavi-yeşil (soğuk) tarafa olan görsel yönelimini anlatan sınıflandırmadır.</p>
          </article>
        </div>
      </section>

      {/* ==================================================================
          11. SIK SORULAN SORULAR VE SORUN GİDERME
          ================================================================== */}
      <section id="help-faq" className="help-section" aria-labelledby="helpFaqTitle">
        <div className="help-section-header">
          <span className="section-kicker">Sorun Giderme ve Yanıtlar</span>
          <h2 id="helpFaqTitle" className="help-section-title">
            Sık Sorulan Sorular
          </h2>
          <p className="help-section-lead">
            En sık karşılaşılan sorular ve hızlı çözüm önerileri. Ayrıntıyı görmek için bir soruya tıklayın veya Enter tuşuna basın.
          </p>
        </div>

        <div className="help-faq-list">
          {FAQ_ITEMS.map((item) => {
            const isOpen = Boolean(openFaqIds[item.id]);
            const answerId = `${item.id}-answer`;
            return (
              <div key={item.id} className={`help-faq-item ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="help-faq-trigger"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggleFaq(item.id)}
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp size={18} aria-hidden="true" />
                  ) : (
                    <ChevronDown size={18} aria-hidden="true" />
                  )}
                </button>
                {isOpen && (
                  <div id={answerId} className="help-faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================
          SAYFA ALTI HIZLI YÖNLENDİRME VE BAŞA DÖN
          ================================================================== */}
      <section className="help-bottom-bar" aria-label="Rehber sonu navigasyon">
        <div className="help-bottom-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigate('analyzer')}
          >
            <Camera size={16} aria-hidden="true" />
            <span>Görsel Analizine Başla</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate('archive')}
          >
            <span>Dijital Arşivi Aç</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate('search')}
          >
            <span>Renk Arama</span>
          </button>
        </div>

        <button
          type="button"
          className="btn-secondary help-back-top-btn"
          onClick={scrollToTop}
        >
          <ArrowUp size={15} aria-hidden="true" />
          <span>Başa Dön</span>
        </button>
      </section>
    </div>
  );
};
