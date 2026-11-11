/**
 * @file About.tsx
 * @description Curatorial manifesto, technical documentation, and institutional
 * framework of the ChromArchive open access chromatic analysis system.
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
  Globe2
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="about-section-wrapper">
      <div className="section-header-compact">
        <div className="badge-tag">
          <Info size={13} />
          <span>PROJE VİZYONU & TEKNİK MİMARİ</span>
        </div>
        <h2 className="section-title">ChromArchive Hakkında</h2>
        <p className="section-lead">
          Açık erişimli sanat koleksiyonlarının kromatik mirasını keşfetmek, piksellerden renk kümeleri
          çıkarmak ve kültürel mirası renk temelli sınıflandırılabilir hale getirmek üzere geliştirilmiş
          tarayıcı tabanlı dijital arşiv sistemi.
        </p>
      </div>

      {/* Main Grid */}
      <div className="about-features-grid">
        <div className="about-card">
          <div className="about-card-icon">
            <Cpu size={24} />
          </div>
          <h3>K-Means++ ve Canvas API</h3>
          <p>
            Yüklenen görseller üçüncü taraf bir sunucuya iletilmeden doğrudan kullanıcının tarayıcısında
            HTML5 Canvas API üzerinde piksellerine ayrıştırılır. K-Means++ algoritması insan algısına duyarlı
            ağırlıklı renk mesafesi formülüyle 5 ila 8 baskın renk kümesini matematiksel kesinlikle türetir.
          </p>
          <ul className="about-list">
            <li>
              <CheckCircle2 size={14} className="check-icon" />
              <span>İstemci taraflı anlık piksel analizi</span>
            </li>
            <li>
              <CheckCircle2 size={14} className="check-icon" />
              <span>2ΔR² + 4ΔG² + 3ΔB² ağırlıklı algısal renk metriği</span>
            </li>
            <li>
              <CheckCircle2 size={14} className="check-icon" />
              <span>CORS güvenli yerel görsel işleme</span>
            </li>
          </ul>
        </div>

        <div className="about-card">
          <div className="about-card-icon">
            <Database size={24} />
          </div>
          <h3>Açık Erişim ve Müze Standartları</h3>
          <p>
            The Metropolitan Museum of Art Open Access ve Wikimedia Commons CC0 veri şemalarıyla tam uyumlu
            JSON metadata yapısı kullanılır. Sanatçının adı, eser tarihi, tekniği, boyutları ve müze envanter
            numaraları renk paletleriyle entegre biçimde saklanır.
          </p>
          <ul className="about-list">
            <li>
              <CheckCircle2 size={14} className="check-icon" />
              <span>The Met Open Access veri modeli uyumu</span>
            </li>
            <li>
              <CheckCircle2 size={14} className="check-icon" />
              <span>JSON formatında tek tıkla metadata dışa aktarma</span>
            </li>
            <li>
              <CheckCircle2 size={14} className="check-icon" />
              <span>Kullanıcı analizlerinin yerel depolama entegrasyonu</span>
            </li>
          </ul>
        </div>

        <div className="about-card">
          <div className="about-card-icon">
            <Layers size={24} />
          </div>
          <h3>Kromatik Arama & Termal Analiz</h3>
          <p>
            Her renk kümesi HEX, RGB, HSV değerleri ve kullanım yüzdesinin yanı sıra 'Sıcak', 'Soğuk' veya
            'Nötr' termal sınıflandırmasıyla etiketlenir. Kullanıcılar hedef bir HEX kodu belirleyerek tüm
            arşivde renk benzerliğine göre akıllı arama yapabilir.
          </p>
          <ul className="about-list">
            <li>
              <CheckCircle2 size={14} className="check-icon" />
              <span>Etkileşimli renk seçici ve HEX benzerlik sıralaması</span>
            </li>
            <li>
              <CheckCircle2 size={14} className="check-icon" />
              <span>Sıcaklık ve kategori bazlı çok kriterli filtreleme</span>
            </li>
            <li>
              <CheckCircle2 size={14} className="check-icon" />
              <span>Tek tıkla panoya kopyalama ve görsel geri bildirim</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Architecture & Specs Banner */}
      <div className="tech-specs-banner">
        <div className="specs-header">
          <Code2 size={20} className="text-accent" />
          <h3>Sistem Mimarisi & Dağıtım Bilgileri</h3>
        </div>
        <div className="specs-grid">
          <div className="spec-col">
            <strong>Framework & Dil:</strong>
            <span>React 19 + TypeScript (Strict Mode)</span>
          </div>
          <div className="spec-col">
            <strong>Derleyici & Sunucu:</strong>
            <span>Vite 8 & Vercel SPA Ready</span>
          </div>
          <div className="spec-col">
            <strong>Görsel İşleme:</strong>
            <span>HTML5 2D Canvas + K-Means++ Clustering</span>
          </div>
          <div className="spec-col">
            <strong>Gizlilik Prensibi:</strong>
            <span>Sıfır Sunucu Yüklemesi, %100 Yerel Tarayıcı İşleme</span>
          </div>
        </div>
      </div>

      {/* Attribution & Rights */}
      <div className="attribution-banner">
        <div className="attr-item">
          <Globe2 size={16} className="attr-icon" />
          <span>
            Görsel Materyaller: <strong>The Metropolitan Museum of Art</strong> ve <strong>Wikimedia Commons</strong> kamu malı (Public Domain / CC0) koleksiyonları.
          </span>
        </div>
        <div className="attr-item">
          <ShieldCheck size={16} className="attr-icon" />
          <span>
            Lisans: <strong>Açık Kaynak & Akademik Araştırma Amaçlı</strong>. Ticari kısıtlama bulunmamaktadır.
          </span>
        </div>
      </div>
    </div>
  );
};
