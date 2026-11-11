/**
 * @file src/components/HomeOverview.tsx
 * @description Ana sayfa alt bölümü için zengin editoryal içerik düzeni:
 * A) Proje Hakkında, B) Nasıl Çalışır? (4 aşamalı iş akışı),
 * C) Temel Özellikler (8 modüler kart), D) Projenin Amacı ve Kullanım Alanları.
 */

import React from 'react';
import {
  Palette,
  Upload,
  Cpu,
  Layers,
  FileJson,
  Hash,
  Percent,
  Search,
  Scale,
  Sparkles,
  BookOpen,
  Landmark,
  Compass,
  ArrowRight
} from 'lucide-react';
import type { NavigationSection } from '../types';

interface HomeOverviewProps {
  onNavigate: (section: NavigationSection) => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({ onNavigate }) => {
  return (
    <div className="home-editorial-sections">
      {/* ==================================================================
          A) PROJE HAKKINDA (ABOUT THE PROJECT)
          ================================================================== */}
      <section className="editorial-block about-chromarchive">
        <div className="editorial-header">
          <div className="badge-tag">
            <BookOpen size={13} />
            <span>KÜRATÖRYEL VİZYON & DİJİTAL MİRAS</span>
          </div>
          <h2 className="editorial-title">ChromArchive Hakkında</h2>
          <p className="editorial-lead">
            Sanat eserlerinin ve açık erişimli dijital koleksiyonların renk DNA’sını
            bilgisayarlı görü algoritmalarıyla çözen, kataloglayan ve aranabilir kılan yeni nesil dijital arşiv platformu.
          </p>
        </div>

        <div className="about-overview-grid">
          <div className="about-main-card">
            <div className="about-card-badge">DİJİTAL BİLGİ YÖNETİMİ</div>
            <h3 className="about-card-headline">
              Renk Odaklı Bilgi Keşfi ve Görsel Bellek
            </h3>
            <p className="about-card-body">
              Geleneksel dijital kütüphaneler ve müze katalogları, sanat eserlerini çoğunlukla sanatçı adı, yapım yılı ve teknik gibi sözel etiketlerle sınıflandırır. <strong>ChromArchive</strong>, açık erişimli dijital görsel koleksiyonlarını doğrudan piksellerinden okuyarak kromatik kompozisyonları bağımsız birer bilgi katmanı ve arama kriteri hâline getirir.
            </p>
            <p className="about-card-subbody">
              The Metropolitan Museum of Art Open Access ve Wikimedia Commons CC0 veri şemalarıyla tam uyumlu mimarisi sayesinde, kültürel mirasın renk paletleri şeffaf, ölçülebilir ve doğrudan araştırmacıların erişimine açık olarak modellenir.
            </p>
            <div className="about-highlights-row">
              <div className="highlight-item">
                <span className="hl-number">%100</span>
                <span className="hl-desc">İstemci Taraflı (Canvas API)</span>
              </div>
              <div className="highlight-item">
                <span className="hl-number">K-Means++</span>
                <span className="hl-desc">Algısal Ağırlıklı Kümeleme</span>
              </div>
              <div className="highlight-item">
                <span className="hl-number">CC0 / PD</span>
                <span className="hl-desc">Açık Erişim Standartları</span>
              </div>
            </div>
          </div>

          <div className="about-side-features">
            <div className="side-feature-box">
              <div className="side-feature-icon">
                <Cpu size={20} />
              </div>
              <div className="side-feature-content">
                <h4>Sıfır Sunucu & Yüksek Gizlilik</h4>
                <p>
                  Yüklediğiniz görseller hiçbir uzak sunucuya aktarılmaz; tüm piksel matrisi doğrudan cihazınızın tarayıcı belleğinde güvenle taranır.
                </p>
              </div>
            </div>

            <div className="side-feature-box">
              <div className="side-feature-icon">
                <FileJson size={20} />
              </div>
              <div className="side-feature-content">
                <h4>Yapılandırılmış Metadata</h4>
                <p>
                  Her analiz; HEX, RGB, renk ailesi, yaklaşık sıcaklık ve kullanım oranlarını içeren uluslararası müze standartlarında JSON nesnesi üretir.
                </p>
              </div>
            </div>

            <div className="side-feature-box">
              <div className="side-feature-icon">
                <Search size={20} />
              </div>
              <div className="side-feature-content">
                <h4>Kromatik Benzerlik Arama Motoru</h4>
                <p>
                  İnsan retinasının spektral hassasiyetine göre kalibre edilmiş formül ile hedef bir renge en yakın başyapıtlar anında eşleştirilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          B) NASIL ÇALIŞIR? (HOW IT WORKS - 4-STEP WORKFLOW)
          ================================================================== */}
      <section className="editorial-block workflow-section">
        <div className="editorial-header">
          <div className="badge-tag">
            <Layers size={13} />
            <span>DÖRT ADIMDA İŞ AKIŞI</span>
          </div>
          <h2 className="editorial-title">Nasıl Çalışır?</h2>
          <p className="editorial-lead">
            Kullanıcı arayüzünden piksel matrisine, kümeleme algoritmasından dijital arşive uzanan bilimsel analiz adımları.
          </p>
        </div>

        <div className="workflow-steps-grid">
          {/* Adım 1 */}
          <div className="workflow-step-card">
            <div className="step-badge-row">
              <span className="step-num-pill">01</span>
              <Upload size={18} className="step-icon" />
            </div>
            <h3 className="step-title">Görsel Yükleme</h3>
            <p className="step-description">
              JPG, JPEG, PNG veya WEBP formatındaki görselinizi sürükleyip bırakın ya da Vermeer, Hokusai veya Mona Lisa gibi hazır başyapıt örneklerinden birini seçin.
            </p>
            <div className="step-footer-tag">Yerel Dosya veya Örnek</div>
          </div>

          {/* Adım 2 */}
          <div className="workflow-step-card">
            <div className="step-badge-row">
              <span className="step-num-pill">02</span>
              <Cpu size={18} className="step-icon" />
            </div>
            <h3 className="step-title">Piksel Verisi Analizi</h3>
            <p className="step-description">
              HTML5 2D Canvas API kullanılarak görsel optimize edilmiş matrise çizilir. Saydam pikseller elenir ve on binlerce renk vektörü milisaniyeler içinde örneklenir.
            </p>
            <div className="step-footer-tag">Canvas 2D Örnekleme</div>
          </div>

          {/* Adım 3 */}
          <div className="workflow-step-card">
            <div className="step-badge-row">
              <span className="step-num-pill">03</span>
              <Palette size={18} className="step-icon" />
            </div>
            <h3 className="step-title">Baskın Renk Kümeleme</h3>
            <p className="step-description">
              K-Means++ algoritması, ağırlıklı algısal renk mesafesi formülüyle kompozisyondaki en belirgin 5 ila 8 renk merkezini ve piksel kullanım oranlarını tespit eder.
            </p>
            <div className="step-footer-tag">K-Means++ & Ağırlıklı Öklid</div>
          </div>

          {/* Adım 4 */}
          <div className="workflow-step-card">
            <div className="step-badge-row">
              <span className="step-num-pill">04</span>
              <Sparkles size={18} className="step-icon" />
            </div>
            <h3 className="step-title">Metadata & Akıllı Arama</h3>
            <p className="step-description">
              Çıkarılan palet; sıcaklık, renk ailesi ve HEX kodlarıyla doğrulanır. Eser yerel arşive eklenir ve hedef renk benzerlik aramalarında taranabilir hâle gelir.
            </p>
            <div className="step-footer-tag">Kalıcı Arşivleme & JSON</div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          C) TEMEL ÖZELLİKLER (CORE FEATURES - 8 DISTINCT CARDS)
          ================================================================== */}
      <section className="editorial-block features-catalog-section">
        <div className="editorial-header">
          <div className="badge-tag">
            <Sparkles size={13} />
            <span>KAPSAMLI YETENEKLER</span>
          </div>
          <h2 className="editorial-title">Temel Özellikler</h2>
          <p className="editorial-lead">
            ChromArchive'ın araştırmacılar, sanat tarihçileri, küratörler ve tasarımcılar için sunduğu modüler araçlar.
          </p>
        </div>

        <div className="features-eight-grid">
          {/* Kart 1 */}
          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <Cpu size={20} />
            </div>
            <h3 className="feature-heading">Otomatik Renk Analizi</h3>
            <p className="feature-detail">
              Tarayıcı içi JavaScript Canvas motoru sayesinde hiçbir dış API veya sunucuya ihtiyaç duymadan gerçek zamanlı analiz.
            </p>
          </div>

          {/* Kart 2 */}
          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <Palette size={20} />
            </div>
            <h3 className="feature-heading">Baskın Renklerin Tespiti</h3>
            <p className="feature-detail">
              K-Means++ merkez başlatma ile görselin en karakteristik 5–8 renk kümesini yerel minimumlara takılmadan matematiksel kesinlikle yakalama.
            </p>
          </div>

          {/* Kart 3 */}
          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <Hash size={20} />
            </div>
            <h3 className="feature-heading">HEX ve RGB Kodları</h3>
            <p className="feature-detail">
              Her küme için web standartlarında HEX kodu ve 24-bit sRGB renk uzayı koordinatları. Tek tıkla panoya kopyalama desteği.
            </p>
          </div>

          {/* Kart 4 */}
          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <Percent size={20} />
            </div>
            <h3 className="feature-heading">Renk Yüzdeleri</h3>
            <p className="feature-detail">
              Kompozisyon içindeki piksel dağılımını normalize edilmiş yüzdelerle hesaplama ve oransal spektrum renk çubuğunda görselleştirme.
            </p>
          </div>

          {/* Kart 5 */}
          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <Landmark size={20} />
            </div>
            <h3 className="feature-heading">Dijital Görsel Arşivi</h3>
            <p className="feature-detail">
              Açık erişimli başyapıtların yer aldığı, sanat akımı, tarih, teknik ve renk ailesi bazında filtrelenebilir zengin koleksiyon.
            </p>
          </div>

          {/* Kart 6 */}
          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <Search size={20} />
            </div>
            <h3 className="feature-heading">Renk Temelli Arama</h3>
            <p className="feature-detail">
              Renk seçici ile belirlenen hedef tonun tüm koleksiyon içindeki en yakın benzerlerini algısal Öklid metriğiyle sıralama.
            </p>
          </div>

          {/* Kart 7 */}
          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <FileJson size={20} />
            </div>
            <h3 className="feature-heading">Metadata Oluşturma</h3>
            <p className="feature-detail">
              The Met Open Access ve Wikimedia veri modeliyle uyumlu arka plan JSON metadata nesnesi oluşturma ve tek tıkla indirme.
            </p>
          </div>

          {/* Kart 8 */}
          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <Scale size={20} />
            </div>
            <h3 className="feature-heading">Görsel Karşılaştırma</h3>
            <p className="feature-detail">
              Farklı eserlerin renk sıcaklığı (Sıcak, Soğuk, Nötr) ve spektral çeşitlilik endeksleri üzerinden karşılaştırmalı analizi.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================================
          D) PROJENİN AMACI VE KULLANIM ALANLARI (MISSION & USE CASES)
          ================================================================== */}
      <section className="editorial-block use-cases-section">
        <div className="editorial-header">
          <div className="badge-tag">
            <Compass size={13} />
            <span>MİSYON & UYGULAMA ALANLARI</span>
          </div>
          <h2 className="editorial-title">Projenin Amacı ve Kullanım Alanları</h2>
          <p className="editorial-lead">
            Görsel arşivleme, dijital kültürel miras ve bilgiye erişim ekseninde ChromArchive'ın kullanım senaryoları.
          </p>
        </div>

        <div className="use-cases-grid">
          {/* Alan 1 */}
          <div className="use-case-box">
            <div className="uc-header">
              <span className="uc-index">A.1</span>
              <h3 className="uc-title">Görsel Arşivleme & Bilgi Yönetimi</h3>
            </div>
            <p className="uc-body">
              Görsel materyallerin yalnızca anahtar kelimelerle değil, içerdikleri kromatik özelliklerle indekslenmesini sağlar. Büyük dijital koleksiyonlarda renk temelli sorgulama imkânı sunarak bilgiye erişim yollarını zenginleştirir.
            </p>
          </div>

          {/* Alan 2 */}
          <div className="use-case-box">
            <div className="uc-header">
              <span className="uc-index">A.2</span>
              <h3 className="uc-title">Dijital Kültürel Mirasın Korunması</h3>
            </div>
            <p className="uc-body">
              Dünya müzelerindeki kamu malı başyapıtların renk paletlerini matematiksel olarak kayıt altına alır. Sanat eserlerinin zamana bağlı solma veya restorasyon süreçlerinin dijital referanslarla takip edilmesine katkıda bulunur.
            </p>
          </div>

          {/* Alan 3 */}
          <div className="use-case-box">
            <div className="uc-header">
              <span className="uc-index">A.3</span>
              <h3 className="uc-title">Sanat Eserlerinin Sınıflandırılması</h3>
            </div>
            <p className="uc-body">
              Farklı dönemlerin (Barok, İzlenimcilik, Ukiyo-e, Rönesans) ve sanatçıların (Vermeer, Monet, Cézanne) renk tercih eğilimlerini nesnel verilerle analiz ederek sanat tarihi araştırmalarına nicel destek sağlar.
            </p>
          </div>

          {/* Alan 4 */}
          <div className="use-case-box">
            <div className="uc-header">
              <span className="uc-index">A.4</span>
              <h3 className="uc-title">Tasarım & Yaratıcı İlham Kaynağı</h3>
            </div>
            <p className="uc-body">
              Grafik tasarımcılar, illüstratörler ve mimarlar için tarihsel başyapıtlardan türetilmiş doğrulanmış renk paletleri sunar. Projelerde kullanılmak üzere HEX kodlarını anında panoya kopyalama kolaylığı sağlar.
            </p>
          </div>
        </div>

        {/* Alt Aksiyon Çağrısı (Call to Action) */}
        <div className="home-footer-cta-card">
          <div className="cta-content">
            <h3 className="cta-title">Kendi Görsellerinizin Renk Spektrumunu Keşfedin</h3>
            <p className="cta-subtext">
              Bir fotoğraf yükleyerek piksel analizi yapın veya açık arşivdeki onlarca başyapıtın renk profillerini inceleyin.
            </p>
          </div>
          <div className="cta-buttons">
            <button
              type="button"
              className="btn-primary"
              onClick={() => onNavigate('analyzer')}
            >
              <span>Analizöre Git</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onNavigate('search')}
            >
              <span>Renk Araması Yap</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
