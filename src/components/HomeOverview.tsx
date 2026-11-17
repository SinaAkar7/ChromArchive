/**
 * @file src/components/HomeOverview.tsx
 * @description ChromArchive Ana Sayfa (Müze ve Dijital Kürasyon Editoryal Giriş Ekranı).
 * Görsel yükleme ve analiz çalışma alanından tamamen bağımsızdır; projeyi,
 * dijital arşivi, renk analiz metodolojisini, kromatik aramayı ve tarihsel pigment sistemini tanıtır.
 */

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Compass,
  Cpu,
  Database,
  History,
  Image as ImageIcon,
  Landmark,
  Palette,
  Search,
} from 'lucide-react';
import type { ArtworkMetadata, NavigationSection } from '../types';

interface FeaturedPlateSpec {
  id: string;
  title: string;
  artist: string;
  date: string;
  institution: string;
  src: string;
  fallbackSrc: string;
  matchObjectId?: number;
  caption: string;
}

const FEATURED_PLATES: FeaturedPlateSpec[] = [
  {
    id: 'plate-vermeer',
    title: 'Süt Döken Kadın (The Milkmaid)',
    artist: 'Johannes Vermeer',
    date: 'y. 1658',
    institution: 'Rijksmuseum / Açık Erişim Seçkisi',
    src: 'images/met_vermeer_milkmaid_1794382514298.jpg',
    fallbackSrc: 'images/vermeer.jpg',
    caption: 'Doğal ultramarin ve kurşun-kalay sarısı kontrastı',
  },
  {
    id: 'plate-hokusai',
    title: 'Kanagawa Açıklarında Büyük Dalga',
    artist: 'Katsushika Hokusai',
    date: 'y. 1831',
    institution: 'Edo Ukiyo-e / The Met Seçkisi',
    src: 'images/hokusai_great_wave_1794382514699.jpg',
    fallbackSrc: 'images/hokusai.jpg',
    matchObjectId: 45434,
    caption: 'Prusya mavisi ve fildişi tonları arasında yüksek kontrast',
  },
  {
    id: 'plate-monet',
    title: 'Nilüferler ve Japon Köprüsü',
    artist: 'Claude Monet',
    date: '1899',
    institution: 'İzlenimcilik / The Met Seçkisi',
    src: 'images/monet_water_lilies_1794382515387.jpg',
    fallbackSrc: 'images/monet.jpg',
    matchObjectId: 436965,
    caption: 'Soğuk su yansımaları ve yumuşak botanik yeşiller',
  },
  {
    id: 'plate-cezanne',
    title: 'Elmalı Natürmort (Still Life with Apples)',
    artist: 'Paul Cézanne',
    date: '1893–1894',
    institution: 'Post-İzlenimcilik / The Met Seçkisi',
    src: 'images/cezanne_still_life_1794382516386.jpg',
    fallbackSrc: 'images/cezanne.jpg',
    matchObjectId: 435882,
    caption: 'Sıcak toprak sarısı, vermilyon ve seramik beyazı dengesi',
  },
];

interface HomeOverviewProps {
  archiveItems: ArtworkMetadata[];
  onNavigate: (section: NavigationSection) => void;
  onInspectArtwork?: (artwork: ArtworkMetadata) => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  archiveItems,
  onNavigate,
  onInspectArtwork,
}) => {
  const [activePlateIdx, setActivePlateIdx] = useState<number>(0);
  const [imgStage, setImgStage] = useState<'primary' | 'fallback' | 'broken'>('primary');

  const activePlate = FEATURED_PLATES[activePlateIdx] || FEATURED_PLATES[0];

  const statsSummary = useMemo(() => {
    const total = archiveItems.length;
    const analyzed = archiveItems.filter(
      (item) => Array.isArray(item.dominantColors) && item.dominantColors.length > 0
    ).length;
    return { total, analyzed };
  }, [archiveItems]);

  const matchedArchiveArtwork = useMemo(() => {
    if (activePlate.matchObjectId) {
      const byOid = archiveItems.find((a) => a.objectId === activePlate.matchObjectId);
      if (byOid) return byOid;
    }
    const lowerArtist = activePlate.artist.toLowerCase();
    return archiveItems.find((a) => a.artist.toLowerCase().includes(lowerArtist)) || null;
  }, [archiveItems, activePlate]);

  const handleSelectPlate = (idx: number) => {
    setActivePlateIdx(idx);
    setImgStage('primary');
  };

  const currentImageSrc =
    imgStage === 'primary' ? activePlate.src : activePlate.fallbackSrc;

  return (
    <div className="home-curatorial-page">
      {/* ==================================================================
          HERO: EDİTORYAL MÜZE AÇILIŞ ALANI
          ================================================================== */}
      <section className="home-hero-grid" aria-labelledby="homeHeroHeadline">
        <div className="home-hero-copy">
          <div className="home-eyebrow-line">
            <span>Dijital Sanat Arşivi ve Renk Araştırma Platformu</span>
            <span aria-hidden="true">·</span>
            <span>Açık Erişim Koleksiyonu</span>
          </div>

          <h1 id="homeHeroHeadline" className="home-hero-title">
            Sanatı, renklerin izinden keşfedin.
          </h1>

          <p className="home-hero-lead">
            Sanat eserlerinin görsel dünyasını yalnızca sanatçı ve dönem bilgileriyle
            değil, onları oluşturan renklerle de inceleyin. Görselleri analiz edin,
            açık erişimli koleksiyonda gezinin ve benzer tonları keşfedin.
          </p>

          <div className="home-hero-cta-row">
            <button
              type="button"
              className="hero-cta-primary"
              onClick={() => onNavigate('analyzer')}
            >
              <span>Görsel analizine başla</span>
              <ArrowRight size={17} />
            </button>
            <button
              type="button"
              className="hero-cta-secondary"
              onClick={() => onNavigate('archive')}
            >
              <span>Dijital arşivi keşfet</span>
            </button>
          </div>

          {/* Doğrulanmış Koleksiyon Özeti (Gerçek Verilere Dayalı Metrik Şeridi) */}
          <dl className="home-proof-strip" aria-label="Arşiv ve sistem özeti">
            <div className="home-proof-item">
              <dt>Arşiv Eseri</dt>
              <dd className="tabular-nums">{statsSummary.total}</dd>
            </div>
            <div className="home-proof-item">
              <dt>Hazır Palet</dt>
              <dd className="tabular-nums">{statsSummary.analyzed}</dd>
            </div>
            <div className="home-proof-item">
              <dt>Renk Sözlüğü</dt>
              <dd className="tabular-nums">368</dd>
            </div>
            <div className="home-proof-item">
              <dt>Tarihsel Pigment</dt>
              <dd className="tabular-nums">38</dd>
            </div>
          </dl>
        </div>

        {/* Sağ Vitrin: Yerel Sanat Eseri Plakası & Canlı Palet Şeridi */}
        <aside className="home-showcase-card" aria-label="Öne çıkan sanat eseri seçkisi">
          <div className="home-showcase-media">
            {imgStage === 'broken' ? (
              <div className="home-showcase-fallback" role="img" aria-label={activePlate.title}>
                <ImageIcon size={36} className="fallback-icon" />
                <div className="fallback-title">{activePlate.title}</div>
                <div className="fallback-sub">{activePlate.artist} · {activePlate.date}</div>
              </div>
            ) : (
              <img
                src={currentImageSrc}
                alt={`${activePlate.title} — ${activePlate.artist}`}
                className="home-showcase-img"
                referrerPolicy="no-referrer"
                onError={() => {
                  if (imgStage === 'primary' && activePlate.fallbackSrc !== activePlate.src) {
                    setImgStage('fallback');
                  } else {
                    setImgStage('broken');
                  }
                }}
              />
            )}
          </div>

          {/* Seçili eserin gerçek renk spektrumu (arşivde analiz edilmişse) */}
          {matchedArchiveArtwork &&
            matchedArchiveArtwork.dominantColors &&
            matchedArchiveArtwork.dominantColors.length > 0 && (
              <div className="home-showcase-spectrum" aria-label="Eserin baskın renk dağılımı">
                {matchedArchiveArtwork.dominantColors.map((col, idx) => (
                  <div
                    key={idx}
                    className="home-spectrum-seg"
                    style={{ flex: col.percentage, backgroundColor: col.hex }}
                    title={`${col.name} (${col.hex}) · %${col.percentage}`}
                  />
                ))}
              </div>
            )}

          <div className="home-showcase-caption">
            <div className="showcase-meta-row">
              <span>{activePlate.artist}</span>
              <span aria-hidden="true">·</span>
              <span>{activePlate.date}</span>
              <span aria-hidden="true">·</span>
              <span>{activePlate.institution}</span>
            </div>
            <div className="showcase-title-row">
              <h2 className="showcase-artwork-title">{activePlate.title}</h2>
              {matchedArchiveArtwork && onInspectArtwork && (
                <button
                  type="button"
                  className="showcase-inspect-link"
                  onClick={() => onInspectArtwork(matchedArchiveArtwork)}
                >
                  Arşiv Kaydını Aç
                </button>
              )}
            </div>
            <p className="showcase-note">{activePlate.caption}</p>
          </div>

          {/* Yerel Başyapıt Seçici */}
          <div className="home-plate-selector" role="tablist" aria-label="Örnek sanat eserleri">
            {FEATURED_PLATES.map((plate, idx) => {
              const isActive = idx === activePlateIdx;
              return (
                <button
                  key={plate.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`home-plate-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectPlate(idx)}
                >
                  <img
                    src={plate.fallbackSrc}
                    alt={plate.artist}
                    className="home-plate-thumb"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="home-plate-label">{plate.artist.split(' ').pop()}</span>
                </button>
              );
            })}
          </div>
        </aside>
      </section>

      {/* ==================================================================
          BÖLÜM 1: PROJENİN KISA TANITIMI & DİJİTAL ARŞİV YAKLAŞIMI
          ================================================================== */}
      <section className="home-editorial-band" aria-labelledby="homeIntroTitle">
        <div className="home-band-header">
          <span className="home-band-kicker">01 · Küratöryel Yaklaşım</span>
          <h2 id="homeIntroTitle" className="home-band-title">
            Geleneksel Katalogların Ötesinde Renk Odaklı Keşif
          </h2>
          <p className="home-band-lead">
            Müze katalogları eserleri çoğunlukla sanatçı adı, dönem ve envanter numarasıyla
            dizinler. ChromArchive bu yapıya doğrudan piksel verisinden çıkarılan ölçülebilir
            renk profillerini ekler.
          </p>
        </div>

        <div className="home-two-col-editorial">
          <article className="home-editorial-card">
            <div className="card-icon-row">
              <Landmark size={18} className="text-navy" />
              <h3>Açık Erişimli Müze Koleksiyonu</h3>
            </div>
            <p>
              The Metropolitan Museum of Art ve Cleveland Museum of Art açık erişim (CC0)
              koleksiyonlarından derlenen <strong>{statsSummary.total}</strong> eser kaydı;
              dönem, sanatçı, teknik, envanter numarası ve telif bilgileriyle birlikte
              yapılandırılmış JSON şemasında sunulur.
            </p>
            <div className="home-card-footer-meta">
              <span>The Met &amp; CMA CC0</span>
              <span aria-hidden="true">·</span>
              <span>JSON Metadata Dışa Aktarma</span>
            </div>
          </article>

          <article className="home-editorial-card">
            <div className="card-icon-row">
              <Database size={18} className="text-terracotta" />
              <h3>Kalıcı Tarayıcı Palet Belleği</h3>
            </div>
            <p>
              Kullanıcıların yüklediği analizler ve dijital arşivde eksikleri tamamlanan
              paletler uzak bir sunucuya gönderilmeden tarayıcı belleğinde kalıcı olarak
              saklanır; sayfa yenilendiğinde tüm renk şeritleri korunur.
            </p>
            <div className="home-card-footer-meta">
              <span>%100 İstemci Taraflı Analiz</span>
              <span aria-hidden="true">·</span>
              <span>LocalStorage Önbelleği</span>
            </div>
          </article>
        </div>
      </section>

      {/* ==================================================================
          BÖLÜM 2: SİSTEM MODÜLLERİ (GERÇEK ÇALIŞAN ÖZELLİKLER)
          ================================================================== */}
      <section className="home-editorial-band" aria-labelledby="homeModulesTitle">
        <div className="home-band-header">
          <span className="home-band-kicker">02 · Modüler Yapı</span>
          <h2 id="homeModulesTitle" className="home-band-title">
            Analiz, Arşivleme ve Kromatik Araştırma Araçları
          </h2>
        </div>

        <div className="home-four-col-grid">
          <article className="home-module-card">
            <div className="module-top-row">
              <Cpu size={19} />
              <span className="module-index mono-font">01</span>
            </div>
            <h3>Canvas &amp; K-Means++ Analizi</h3>
            <p>
              JPG, PNG ve WEBP görseller HTML5 Canvas üzerinde taranır; insan gözü ağırlıklı
              Öklid mesafesiyle 5–8 baskın renk, HEX, RGB ve piksel oranı hesaplanır.
            </p>
            <button
              type="button"
              className="module-action-link"
              onClick={() => onNavigate('analyzer')}
            >
              <span>Görsel Analizini Aç</span>
              <ArrowRight size={14} />
            </button>
          </article>

          <article className="home-module-card">
            <div className="module-top-row">
              <Palette size={19} />
              <span className="module-index mono-font">02</span>
            </div>
            <h3>Eksik Palet Tamamlama</h3>
            <p>
              Dijital arşivde renk verisi henüz bulunmayan eserler tekil olarak veya en fazla iki
              eşzamanlı işlemle gerçek piksellerden analiz edilip önbelleğe kaydedilir.
            </p>
            <button
              type="button"
              className="module-action-link"
              onClick={() => onNavigate('archive')}
            >
              <span>Arşiv Kataloğuna Git</span>
              <ArrowRight size={14} />
            </button>
          </article>

          <article className="home-module-card">
            <div className="module-top-row">
              <Search size={19} />
              <span className="module-index mono-font">03</span>
            </div>
            <h3>CIELAB &amp; Delta E 2000 Arama</h3>
            <p>
              HEX, RGB veya renk adıyla 368 kayıtlı sözlük rengi taranır; aynı zamanda paleti
              analiz edilmiş sanat eserleri algısal ΔE yakınlığına göre sıralanır.
            </p>
            <button
              type="button"
              className="module-action-link"
              onClick={() => onNavigate('search')}
            >
              <span>Renk Aramayı Başlat</span>
              <ArrowRight size={14} />
            </button>
          </article>

          <article className="home-module-card">
            <div className="module-top-row">
              <History size={19} />
              <span className="module-index mono-font">04</span>
            </div>
            <h3>Tarihsel Pigment &amp; Anlamlar</h3>
            <p>
              11 ana renk ailesinin tarihsel bağlamları ile 38 pigmentin kimyasal bileşimi,
              koruma notları ve kaynaklandırılmış kültürel anlamları incelenir.
            </p>
            <button
              type="button"
              className="module-action-link"
              onClick={() => onNavigate('about')}
            >
              <span>Metodolojiyi İncele</span>
              <ArrowRight size={14} />
            </button>
          </article>
        </div>
      </section>

      {/* ==================================================================
          BÖLÜM 3: KAPANIŞ YÖNLENDİRME ŞERİDİ
          ================================================================== */}
      <section className="home-closing-banner" aria-label="Hızlı başlangıç">
        <div className="closing-copy">
          <div className="closing-kicker">
            <BookOpen size={15} />
            <span>Tarayıcı İçi Bilimsel Renk İncelemesi</span>
          </div>
          <h2>Kendi görselinizi analiz edin veya müze koleksiyonunu araştırın</h2>
          <p>
            Çalışma ekranları arasında geçiş yaptığınızda yüklediğiniz görsel ve son analiz
            sonuçlarınız oturum boyunca korunur.
          </p>
        </div>
        <div className="closing-actions">
          <button
            type="button"
            className="closing-btn-primary"
            onClick={() => onNavigate('analyzer')}
          >
            <span>Görsel analizine başla</span>
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            className="closing-btn-secondary"
            onClick={() => onNavigate('stats')}
          >
            <Compass size={16} />
            <span>Arşiv İstatistikleri</span>
          </button>
        </div>
      </section>
    </div>
  );
};
