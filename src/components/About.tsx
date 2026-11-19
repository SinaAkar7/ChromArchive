/**
 * @file src/components/About.tsx
 * @description Projenin amacı, çalışma mantığı, renk analizi ve CIELAB/Delta E 2000 metodolojisi,
 * açık erişimli veri kaynakları, lisanslar ve kullanılan teknolojilerin toplandığı kapsamlı Hakkında sayfası.
 */

import React from 'react';
import {
  Info,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Globe2,
  Compass,
  Upload,
  Palette,
  Sparkles,
  Search,
  Hash,
  Percent,
  Landmark,
  FileJson,
  Scale,
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="about-section-wrapper">
      <div className="section-header-compact">
        <div className="badge-tag">
          <Info size={13} />
          <span>PROJE VİZYONU, METODOLOJİ & VERİ KAYNAKLARI</span>
        </div>
        <h2 className="section-title">ChromArchive Hakkında</h2>
        <p className="section-lead">
          Açık erişimli sanat koleksiyonlarının ve yüklenen görsellerin kromatik mirasını bilgisayarlı görü
          algoritmalarıyla çözümleyen, kataloglayan ve CIELAB renk uzayında aranabilir hâle getiren tarayıcı
          tabanlı dijital arşiv sistemi.
        </p>
      </div>

      {/* 1. Proje Amacı ve Kullanım Alanları */}
      <section className="about-consolidated-block">
        <div className="about-subheading-row">
          <Compass size={18} className="text-accent" />
          <h3>Projenin Amacı ve Kullanım Alanları</h3>
        </div>
        <p className="about-intro-prose">
          Geleneksel dijital kütüphaneler ve müze katalogları sanat eserlerini çoğunlukla sanatçı adı, yapım
          yılı ve teknik gibi sözel etiketlerle sınıflandırır. ChromArchive, görselleri doğrudan piksel
          verilerinden okuyarak renk kompozisyonlarını ölçülebilir birer bilgi katmanı ve arama kriteri hâline
          getirir.
        </p>
        <div className="use-cases-grid">
          <div className="use-case-box">
            <div className="uc-header">
              <span className="uc-index">01</span>
              <h4 className="uc-title">Görsel Arşivleme & Bilgi Yönetimi</h4>
            </div>
            <p className="uc-body">
              Görsel materyallerin yalnızca anahtar kelimelerle değil, içerdikleri baskın renk ve termal
              profille indekslenmesini sağlayarak bilgiye erişim yollarını zenginleştirir.
            </p>
          </div>
          <div className="use-case-box">
            <div className="uc-header">
              <span className="uc-index">02</span>
              <h4 className="uc-title">Dijital Kültürel Mirasın Korunması</h4>
            </div>
            <p className="uc-body">
              Dünya müzelerindeki kamu malı başyapıtların renk paletlerini matematiksel olarak kayıt altına alır;
              restorasyon ve dönem karşılaştırma çalışmalarına dijital referans sunar.
            </p>
          </div>
          <div className="use-case-box">
            <div className="uc-header">
              <span className="uc-index">03</span>
              <h4 className="uc-title">Sanat Eserlerinin Sınıflandırılması</h4>
            </div>
            <p className="uc-body">
              Rönesans, Barok, İzlenimcilik ve Ukiyo-e gibi akımların renk tercih eğilimlerini nicel piksel
              verileriyle analiz ederek sanat tarihi araştırmalarına destek olur.
            </p>
          </div>
          <div className="use-case-box">
            <div className="uc-header">
              <span className="uc-index">04</span>
              <h4 className="uc-title">Tasarım & Yaratıcı İlham</h4>
            </div>
            <p className="uc-body">
              Tasarımcılar ve araştırmacılar için doğrulanmış HEX, RGB ve Delta E 2000 yakınlık ölçütleriyle
              palet keşfi ve tek tıkla kod kopyalama imkânı sunar.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Nasıl Çalışır? (4 Aşamalı İş Akışı) */}
      <section className="about-consolidated-block">
        <div className="about-subheading-row">
          <Layers size={18} className="text-accent" />
          <h3>Nasıl Çalışır? (4 Aşamalı Analiz İş Akışı)</h3>
        </div>
        <div className="workflow-steps-grid">
          <div className="workflow-step-card">
            <div className="step-badge-row">
              <span className="step-num-pill">01</span>
              <Upload size={18} className="step-icon" />
            </div>
            <h4 className="step-title">Görsel Seçimi</h4>
            <p className="step-description">
              JPG, PNG veya WEBP formatında bir görsel yükleyin ya da arşivdeki 205 doğrulanmış
              açık erişimli müze eserinden birini doğrudan analizöre aktarın.
            </p>
          </div>
          <div className="workflow-step-card">
            <div className="step-badge-row">
              <span className="step-num-pill">02</span>
              <Cpu size={18} className="step-icon" />
            </div>
            <h4 className="step-title">Canvas Piksel Örnekleme</h4>
            <p className="step-description">
              Görseller uzak sunucuya gönderilmeden HTML5 2D Canvas üzerinde 300×300 çözünürlüğe ölçeklenir;
              şeffaf pikseller elenerek sRGB matrisi örneklenir.
            </p>
          </div>
          <div className="workflow-step-card">
            <div className="step-badge-row">
              <span className="step-num-pill">03</span>
              <Palette size={18} className="step-icon" />
            </div>
            <h4 className="step-title">K-Means++ Kümeleme</h4>
            <p className="step-description">
              İnsan görme hassasiyetine göre ağırlıklandırılmış Öklid metriği (<code className="mono-inline">2ΔR² + 4ΔG² + 3ΔB²</code>)
              ile görseldeki en baskın 5 ila 8 renk merkezi ve kullanım yüzdesi hesaplanır.
            </p>
          </div>
          <div className="workflow-step-card">
            <div className="step-badge-row">
              <span className="step-num-pill">04</span>
              <Sparkles size={18} className="step-icon" />
            </div>
            <h4 className="step-title">Metadata & CIELAB Arama</h4>
            <p className="step-description">
              Çıkarılan palet JSON olarak dışa aktarılabilir; renk arama modülünde ise CIELAB + Delta E 2000
              mesafesiyle en yakın adlandırılmış renkler sıralanır.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Bilimsel Metodoloji Kartları */}
      <section className="about-consolidated-block">
        <div className="about-subheading-row">
          <Cpu size={18} className="text-accent" />
          <h3>Renk Analizi ve Arama Metodolojisi</h3>
        </div>
        <div className="about-features-grid">
          <div className="about-card">
            <div className="about-card-icon">
              <Cpu size={22} />
            </div>
            <h4>Canvas API & K-Means++ Piksel Motoru</h4>
            <p>
              Yüklenen görseller tamamen istemci taraflı olarak HTML5 Canvas API üzerinde işlenir. K-Means++
              başlatma stratejisi küme merkezlerinin yerel minimumlara takılmasını önleyerek Mona Lisa gibi
              karmaşık kompozisyonlarda dahi dengeli paletler üretir.
            </p>
            <ul className="about-list">
              <li>
                <CheckCircle2 size={14} className="check-icon" />
                <span>300×300 piksel matrisinde gerçek zamanlı örnekleme</span>
              </li>
              <li>
                <CheckCircle2 size={14} className="check-icon" />
                <span>2ΔR² + 4ΔG² + 3ΔB² ağırlıklı algısal uzaklık</span>
              </li>
              <li>
                <CheckCircle2 size={14} className="check-icon" />
                <span>HSL hue ekseni, CIELAB kroma (C*ab) nötr kapısı &amp; güven skoru</span>
              </li>
              <li>
                <CheckCircle2 size={14} className="check-icon" />
                <span>240px örneklem grid’inde 4-komşuluk mekânsal sıcaklık karşıtlığı</span>
              </li>
            </ul>
          </div>

          <div className="about-card">
            <div className="about-card-icon">
              <Search size={22} />
            </div>
            <h4>CIELAB Uzayı & Delta E 2000 (CIEDE2000)</h4>
            <p>
              Renk arama motorunda basit RGB farkı yerine insan gözünün algısal eşitliğine dayanan CIE L*a*b*
              uzayı ve CIEDE2000 (ΔE) formülü kullanılır. Tüm adlandırılmış renklerin Lab koordinatları uygulama
              başlangıcında bellekte tek seferde önceden hesaplanır.
            </p>
            <ul className="about-list">
              <li>
                <CheckCircle2 size={14} className="check-icon" />
                <span>sRGB → Lineer RGB → CIE XYZ (D65) → CIELAB dönüşümü</span>
              </li>
              <li>
                <CheckCircle2 size={14} className="check-icon" />
                <span>HEX, RGB, Türkçe/İngilizce ad ve 13 renk ailesi filtresi</span>
              </li>
              <li>
                <CheckCircle2 size={14} className="check-icon" />
                <span>Harici API çağrısı olmadan anlık en yakın 10 renk</span>
              </li>
            </ul>
          </div>

          <div className="about-card">
            <div className="about-card-icon">
              <Database size={22} />
            </div>
            <h4>Küratöryel Metadata & Kültürel Bağlam</h4>
            <p>
              Sanat eserleri The Metropolitan Museum of Art veri modeliyle uyumlu JSON yapısında saklanır.
              Kültürel renk anlamları modülü ise tarihsel pigment kaynaklarını akademik referanslarla belgeler.
            </p>
            <ul className="about-list">
              <li>
                <CheckCircle2 size={14} className="check-icon" />
                <span>Tek tıkla JSON metadata indirme ve oturum içi piksel analizi</span>
              </li>
              <li>
                <CheckCircle2 size={14} className="check-icon" />
                <span>Kaynaklandırılmış pigment tarihi & kültürel bağlam</span>
              </li>
              <li>
                <CheckCircle2 size={14} className="check-icon" />
                <span>%100 yerel tarayıcı işleme ve gizlilik</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Temel Özellikler (8 Yetenek) */}
      <section className="about-consolidated-block">
        <div className="about-subheading-row">
          <Sparkles size={18} className="text-accent" />
          <h3>Temel Modüller ve Yetenekler</h3>
        </div>
        <div className="features-eight-grid">
          <div className="feature-item-card">
            <div className="feature-icon-wrapper"><Cpu size={18} /></div>
            <h4 className="feature-heading">Otomatik Piksel Analizi</h4>
            <p className="feature-detail">Tarayıcı içi Canvas motoruyla sunucuya ihtiyaç duymadan anlık renk çıkarımı.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon-wrapper"><Palette size={18} /></div>
            <h4 className="feature-heading">5–8 Baskın Renk Kümesi</h4>
            <p className="feature-detail">K-Means++ ile görselin karakteristik renk merkezlerini otomatik veya seçili küme sayısıyla bulma.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon-wrapper"><Hash size={18} /></div>
            <h4 className="feature-heading">HEX ve RGB Kodları</h4>
            <p className="feature-detail">Web standartlarında HEX ve 24-bit sRGB koordinatlarını tek tıkla panoya kopyalama.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon-wrapper"><Percent size={18} /></div>
            <h4 className="feature-heading">Kullanım Yüzdeleri</h4>
            <p className="feature-detail">Kompozisyon içindeki piksel oranlarını normalize yüzdeler ve yatay renk skalasıyla sunma.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon-wrapper"><Landmark size={18} /></div>
            <h4 className="feature-heading">Doğrulanmış Müze Arşivi</h4>
            <p className="feature-detail">The Met Open Access koleksiyonundan sanatçı, dönem ve tekniklere göre filtrelenebilir katalog.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon-wrapper"><Search size={18} /></div>
            <h4 className="feature-heading">Delta E 2000 Renk Arama</h4>
            <p className="feature-detail">HEX, RGB, renk adı ve 13 renk ailesiyle en yakın adlandırılmış renkleri sıralama.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon-wrapper"><FileJson size={18} /></div>
            <h4 className="feature-heading">JSON Metadata Dışa Aktarma</h4>
            <p className="feature-detail">Her analiz sonucunu yapılandırılmış JSON metadata belgesi olarak kaydetme ve indirme.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon-wrapper"><Scale size={18} /></div>
            <h4 className="feature-heading">Termal & Spektral İstatistik</h4>
            <p className="feature-detail">Koleksiyon genelinde sıcak, soğuk ve nötr renk eğilimlerini grafiklerle izleme.</p>
          </div>
        </div>
      </section>

      {/* 5. Veri Kaynakları ve Lisanslar */}
      <section className="about-consolidated-block">
        <div className="about-subheading-row">
          <Globe2 size={18} className="text-accent" />
          <h3>Açık Erişim Veri Kaynakları ve Lisanslar</h3>
        </div>
        <div className="attribution-banner attribution-grid">
          <div className="attr-item">
            <Globe2 size={16} className="attr-icon" />
            <span>
              <strong>Sanat Eserleri Kataloğu:</strong> The Metropolitan Museum of Art Open Access API ve Cleveland Museum of Art Open Access koleksiyonları (<strong>CC0 1.0 Public Domain</strong>) ile yerel başyapıt seçkileri.
            </span>
          </div>
          <div className="attr-item">
            <Palette size={16} className="attr-icon" />
            <span>
              <strong>Adlandırılmış Renk Sözlüğü (368 Açık Erişimli Renk):</strong> Sanzo Wada <em>The Dictionary of Color Combinations</em> (<strong>CC BY 4.0</strong>), XKCD Color Survey (<strong>CC0 1.0 Public Domain</strong>) ve W3C CSS Color Module Level 4 standart adlandırılmış renkleri.
            </span>
          </div>
          <div className="attr-item">
            <Database size={16} className="attr-icon" />
            <span>
              <strong>Tarihsel Pigmentler ve Kültürel Anlamlar:</strong> National Gallery of Art <em>Artists’ Pigments</em>, MFA Boston CAMEO ve akademik literatüre dayalı ChromArchive Tarihsel Pigment (38 pigment · 13 aile) ve Renk Anlamları veri setleri.
            </span>
          </div>
          <div className="attr-item">
            <Scale size={16} className="attr-icon" />
            <span>
              <strong>Göreli Sıcak/Soğuk Renk Analizi Referansları:</strong> Manalansan, Whitehead &amp; Webster (2025), <em>Journal of Vision</em> 25(4):13 (CC BY 4.0); Koenderink, van Doorn &amp; Braun (2024), <em>Journal of Vision</em> 24(7):5 (CC BY 4.0); Art Institute of Chicago &amp; W3C CSS Color 4. Makaledeki cone-opponent (LvsM/SvsLM) açıları sRGB/HSL eşiklerine doğrudan taşınmaz ve skorlar fiziksel Kelvin sıcaklığı değildir.
            </span>
          </div>
          <div className="attr-item">
            <ShieldCheck size={16} className="attr-icon" />
            <span>
              <strong>Yazılım Lisansı:</strong> Açık kaynak & akademik araştırma amaçlıdır. Kullanıcı görselleri tarayıcı dışına aktarılmaz.
            </span>
          </div>
        </div>
      </section>

      {/* 6. Kullanılan Teknolojiler ve Sistem Mimarisi */}
      <div className="tech-specs-banner">
        <div className="specs-header">
          <Code2 size={20} className="text-accent" />
          <h3>Kullanılan Teknolojiler ve Sistem Mimarisi</h3>
        </div>
        <div className="specs-grid">
          <div className="spec-col">
            <strong>Arayüz & Dil:</strong>
            <span>React 19 + TypeScript (Strict Mode)</span>
          </div>
          <div className="spec-col">
            <strong>Derleyici & Dağıtım:</strong>
            <span>Vite 8 & Vercel SPA Uyumlu</span>
          </div>
          <div className="spec-col">
            <strong>Görsel Analiz:</strong>
            <span>HTML5 2D Canvas + K-Means++</span>
          </div>
          <div className="spec-col">
            <strong>Renk Arama Motoru:</strong>
            <span>CIELAB (D65) + CIEDE2000 (ΔE)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
