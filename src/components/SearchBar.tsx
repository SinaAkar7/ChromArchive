/**
 * @file src/components/SearchBar.tsx
 * @description ChromArchive CIELAB + CIEDE2000 (Delta E 2000) tabanlı renk arama motoru.
 * HEX, RGB, renk adı (Türkçe/İngilizce), 13 renk ailesi filtresi ve en yakın 10 renk eşleştirmesini destekler.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Palette,
  Copy,
  Check,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  ArtworkColorMatchResult,
  ArtworkMetadata,
  ColorAnalysisResult,
  ColorDictionaryFamily,
  ColorSearchResult,
  RgbObject,
} from '../types';
import {
  COLOR_FAMILY_OPTIONS,
  findExactColorMatch,
  findMatchingArtworksByRgb,
  findNearestColorsByRgb,
  getColorsDatasetSummary,
  getFamilyLabelEn,
  getFamilyLabelTr,
  parseHexColorInput,
  parseRgbColorInput,
  rgbToHex,
  searchColorsByNameOrTags,
} from '../services/colorSearchService';

interface SearchBarProps {
  archiveItems?: ArtworkMetadata[];
  onSelectArtwork?: (artwork: ArtworkMetadata) => void;
  onCopyColor: (hex: string) => void;
  onAnalyzeColorPalette?: (analysis: ColorAnalysisResult) => void;
}

type SearchMode = 'nearest' | 'name';

const QUICK_COLOR_PRESETS = [
  { label: 'Sage', hex: '#B2AC88' },
  { label: 'Olive', hex: '#808000' },
  { label: 'Burgundy', hex: '#800020' },
  { label: 'Lavender', hex: '#E6E6FA' },
  { label: 'Kırmızı (#FF0000)', hex: '#FF0000' },
  { label: 'Mavi (#0000FF)', hex: '#0000FF' },
  { label: 'Beyaz (#FFFFFF)', hex: '#FFFFFF' },
  { label: 'Siyah (#000000)', hex: '#000000' },
];

function getContrastTextColor({ r, g, b }: RgbObject): string {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#1A1C20' : '#FFFFFF';
}

const INITIAL_ARTWORK_MATCH_LIMIT = 8;

const FALLBACK_ARTWORK_THUMB =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="#E8E4DC" width="400" height="300"/><text fill="#6B6860" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="14">Görsel Yüklenemedi</text></svg>'
  );

export const SearchBar: React.FC<SearchBarProps> = ({
  archiveItems = [],
  onSelectArtwork,
  onCopyColor,
}) => {
  const datasetSummary = useMemo(() => getColorsDatasetSummary(), []);

  // Aktif arama modu: 'nearest' (HEX/RGB/Seçici ile en yakın 10 renk) veya 'name' (Ad / Etiket araması)
  const [searchMode, setSearchMode] = useState<SearchMode>('nearest');

  // Hedef renk girdileri (birbiriyle senkronize)
  const [activeHex, setActiveHex] = useState<string>('#B2AC88');
  const [activeRgb, setActiveRgb] = useState<RgbObject>({ r: 178, g: 172, b: 136 });
  const [hexInput, setHexInput] = useState<string>('#B2AC88');
  const [rgbInput, setRgbInput] = useState<string>('178, 172, 136');
  const [nameQuery, setNameQuery] = useState<string>('');
  const [selectedFamily, setSelectedFamily] = useState<ColorDictionaryFamily | 'all'>('all');

  // Doğrulama hataları, kopyalama geri bildirimi ve eser listesi genişletme
  const [inputError, setInputError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAllArtworkMatches, setShowAllArtworkMatches] = useState<boolean>(false);

  // HEX değiştiğinde RGB ve Picker ile senkronize et
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setHexInput(raw);
    setSearchMode('nearest');

    const parsed = parseHexColorInput(raw);
    if (parsed.ok) {
      setInputError(null);
      setActiveHex(parsed.hex);
      setActiveRgb(parsed.rgb);
      setRgbInput(`${parsed.rgb.r}, ${parsed.rgb.g}, ${parsed.rgb.b}`);
    } else {
      setInputError(parsed.error);
    }
  };

  // RGB değiştiğinde HEX ve Picker ile senkronize et
  const handleRgbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setRgbInput(raw);
    setSearchMode('nearest');

    const parsed = parseRgbColorInput(raw);
    if (parsed.ok) {
      setInputError(null);
      setActiveHex(parsed.hex);
      setActiveRgb(parsed.rgb);
      setHexInput(parsed.hex);
    } else {
      setInputError(parsed.error);
    }
  };

  // Native color picker değiştiğinde
  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.toUpperCase();
    const parsed = parseHexColorInput(hex);
    if (parsed.ok) {
      setInputError(null);
      setActiveHex(parsed.hex);
      setActiveRgb(parsed.rgb);
      setHexInput(parsed.hex);
      setRgbInput(`${parsed.rgb.r}, ${parsed.rgb.g}, ${parsed.rgb.b}`);
      setSearchMode('nearest');
    }
  };

  // Renk adı ile arama değiştiğinde
  const handleNameQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNameQuery(val);
    setInputError(null);

    if (val.trim()) {
      setSearchMode('name');
      // Birebir renk adı eşleşmesi varsa picker & HEX/RGB göstergesini de güncelle
      const exact = findExactColorMatch(val);
      if (exact) {
        setActiveHex(exact.hex);
        setActiveRgb(exact.rgb);
        setHexInput(exact.hex);
        setRgbInput(`${exact.rgb.r}, ${exact.rgb.g}, ${exact.rgb.b}`);
      }
    } else {
      setSearchMode('nearest');
    }
  };

  // Hızlı önayar seçimi
  const handleSelectPreset = (hex: string) => {
    const parsed = parseHexColorInput(hex);
    if (!parsed.ok) return;
    setInputError(null);
    setNameQuery('');
    setSearchMode('nearest');
    setActiveHex(parsed.hex);
    setActiveRgb(parsed.rgb);
    setHexInput(parsed.hex);
    setRgbInput(`${parsed.rgb.r}, ${parsed.rgb.g}, ${parsed.rgb.b}`);
  };

  // Tüm filtreleri sıfırla
  const handleResetFilters = () => {
    setInputError(null);
    setNameQuery('');
    setSelectedFamily('all');
    setSearchMode('nearest');
    setActiveHex('#B2AC88');
    setActiveRgb({ r: 178, g: 172, b: 136 });
    setHexInput('#B2AC88');
    setRgbInput('178, 172, 136');
  };

  // Arama sonuçlarını hesapla (bellekte önceden hesaplanmış CIELAB + Delta E 2000)
  const searchResults = useMemo<ColorSearchResult[]>(() => {
    if (inputError) return [];

    if (searchMode === 'name' && nameQuery.trim().length > 0) {
      return searchColorsByNameOrTags(nameQuery, {
        family: selectedFamily,
        limit: 24,
      });
    }

    return findNearestColorsByRgb(activeRgb, {
      family: selectedFamily,
      limit: 10,
    });
  }, [inputError, searchMode, nameQuery, selectedFamily, activeRgb]);

  // Eser renk eşleştirmesi için kullanılacak referans hedef renk
  const artworkTarget = useMemo<{
    hex: string;
    rgb: RgbObject;
    label: string;
  } | null>(() => {
    if (inputError) return null;

    if (searchMode === 'name' && nameQuery.trim().length > 0) {
      const exact = findExactColorMatch(nameQuery);
      if (exact) {
        return { hex: exact.hex, rgb: exact.rgb, label: `${exact.name} (${exact.hex})` };
      }
      if (searchResults.length > 0) {
        const top = searchResults[0].color;
        return { hex: top.hex, rgb: top.rgb, label: `${top.name} (${top.hex})` };
      }
      return null;
    }

    return {
      hex: activeHex,
      rgb: activeRgb,
      label: activeHex,
    };
  }, [inputError, searchMode, nameQuery, searchResults, activeHex, activeRgb]);

  const analyzedArchiveCount = useMemo(
    () =>
      archiveItems.filter(
        (item) => Array.isArray(item.dominantColors) && item.dominantColors.length > 0
      ).length,
    [archiveItems]
  );

  // Arşivdeki analiz edilmiş eserleri Delta E 2000 mesafesine göre sırala
  const artworkMatches = useMemo<ArtworkColorMatchResult[]>(() => {
    if (!artworkTarget) return [];
    return findMatchingArtworksByRgb(artworkTarget.rgb, archiveItems);
  }, [artworkTarget, archiveItems]);

  useEffect(() => {
    setShowAllArtworkMatches(false);
  }, [activeHex, nameQuery, searchMode]);

  const displayedArtworkMatches = useMemo(
    () =>
      showAllArtworkMatches
        ? artworkMatches
        : artworkMatches.slice(0, INITIAL_ARTWORK_MATCH_LIMIT),
    [artworkMatches, showAllArtworkMatches]
  );

  const handleCopyHex = (id: string, hex: string) => {
    onCopyColor(hex);
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 1600);
  };

  const activeContrastText = getContrastTextColor(activeRgb);

  return (
    <div className="search-section-wrapper">
      <div className="section-header-compact">
        <div className="badge-tag">
          <Palette size={13} />
          <span>CIELAB & DELTA E 2000 RENK ARAMA MOTORU</span>
        </div>
        <h2 className="section-title">Renk Arama ve Benzerlik Keşfi</h2>
        <p className="section-lead">
          {datasetSummary.totalColors} doğrulanmış açık erişimli renk kaydı içinde HEX kodu, RGB değeri, renk adı
          (Türkçe / İngilizce) veya 13 renk ailesine göre arama yapın; CIELAB ve Delta E 2000 ile hem en yakın
          sözlük renklerini hem de arşivdeki analiz edilmiş sanat eserlerini keşfedin.
        </p>
      </div>

      {/* Arama Kontrol Paneli */}
      <div className="search-controls-card">
        <div className="color-search-grid">
          {/* Renk Seçici & Canlı Örnek */}
          <div className="search-swatch-control">
            <label htmlFor="color-picker-input" className="field-label">
              Renk Seçici
            </label>
            <div className="picker-swatch-wrap">
              <input
                type="color"
                id="color-picker-input"
                value={activeHex}
                onChange={handlePickerChange}
                className="native-color-input"
                aria-label="Renk Seçici"
              />
              <div
                className="active-color-preview-pill"
                style={{ backgroundColor: activeHex, color: activeContrastText }}
              >
                <span className="mono-font">{activeHex}</span>
                <span className="preview-rgb-sub mono-font">
                  rgb({activeRgb.r}, {activeRgb.g}, {activeRgb.b})
                </span>
              </div>
            </div>
          </div>

          {/* A) HEX Arama */}
          <div className="search-input-col">
            <label htmlFor="hex-text-input" className="field-label">
              HEX Kodu ile Ara
            </label>
            <div className="input-with-icon">
              <Palette size={15} className="input-icon" />
              <input
                id="hex-text-input"
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                placeholder="#B2AC88"
                maxLength={7}
                className={`text-input-field mono-font ${inputError && searchMode === 'nearest' ? 'input-has-error' : ''}`}
                aria-label="HEX kodu ile renk ara"
              />
            </div>
          </div>

          {/* B) RGB Arama */}
          <div className="search-input-col">
            <label htmlFor="rgb-text-input" className="field-label">
              RGB Değeri ile Ara
            </label>
            <input
              id="rgb-text-input"
              type="text"
              value={rgbInput}
              onChange={handleRgbChange}
              placeholder="178, 172, 136"
              className="text-input-field mono-font"
              aria-label="RGB değeri ile renk ara"
            />
          </div>

          {/* C) Renk Adı Arama */}
          <div className="search-input-col">
            <label htmlFor="color-name-input" className="field-label">
              Renk Adı / Etiket Ara
            </label>
            <div className="input-with-icon">
              <Search size={15} className="input-icon" />
              <input
                id="color-name-input"
                type="text"
                value={nameQuery}
                onChange={handleNameQueryChange}
                placeholder="Sage, Olive, Burgundy, Lavanta..."
                className="text-input-field"
                aria-label="Renk adı ile ara"
              />
            </div>
          </div>
        </div>

        {/* Doğrulama Hata Mesajı */}
        {inputError && (
          <div className="search-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{inputError}</span>
          </div>
        )}

        {/* E) 13 Renk Ailesi Filtresi */}
        <div className="family-filter-section">
          <div className="family-filter-header">
            <span className="presets-label">Renk Ailesi Filtresi (13 Kategori):</span>
            {(selectedFamily !== 'all' || nameQuery.trim() !== '' || inputError) && (
              <button type="button" className="reset-filter-link" onClick={handleResetFilters}>
                <RotateCcw size={13} />
                <span>Filtreleri Sıfırla</span>
              </button>
            )}
          </div>
          <div className="family-chips-wrap" role="group" aria-label="Renk ailesi filtreleri">
            <button
              type="button"
              className={`family-filter-chip ${selectedFamily === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedFamily('all')}
            >
              <span>Tümü ({datasetSummary.totalColors})</span>
            </button>
            {COLOR_FAMILY_OPTIONS.map((fam) => {
              const count = datasetSummary.familyCounts[fam.id] ?? 0;
              const isSelected = selectedFamily === fam.id;
              return (
                <button
                  key={fam.id}
                  type="button"
                  className={`family-filter-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedFamily(isSelected ? 'all' : fam.id)}
                  title={`${fam.labelTr} / ${fam.labelEn} (${count} renk)`}
                >
                  <span
                    className="family-chip-dot"
                    style={{ backgroundColor: fam.swatchHex }}
                  />
                  <span>
                    {fam.labelTr} <small>({fam.labelEn})</small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hızlı Örnek Tonlar */}
        <div className="preset-colors-row">
          <span className="presets-label">Hızlı Test Tonları:</span>
          <div className="preset-chips-list">
            {QUICK_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                className={`preset-chip ${activeHex === preset.hex && !nameQuery ? 'active' : ''}`}
                onClick={() => handleSelectPreset(preset.hex)}
              >
                <span className="preset-swatch" style={{ backgroundColor: preset.hex }} />
                <span className="preset-name">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* A. RENK SÖZLÜĞÜ SONUÇLARI */}
      <div className="search-subsection-header">
        <span className="search-subsection-kicker mono-font">A. RENK SÖZLÜĞÜ SONUÇLARI</span>
      </div>

      {/* Sonuç Özeti */}
      <div className="search-results-summary">
        <div className="summary-left">
          <Sparkles size={16} className="text-secondary" />
          {inputError ? (
            <span>Geçerli bir HEX veya RGB değeri girildiğinde sonuçlar listelenir.</span>
          ) : searchMode === 'name' && nameQuery.trim() ? (
            <span>
              <strong>"{nameQuery}"</strong> araması için <strong>{searchResults.length}</strong> renk eşleşti
              {selectedFamily !== 'all' ? ` · Aile: ${getFamilyLabelTr(selectedFamily)}` : ''}
            </span>
          ) : (
            <span>
              <strong>{activeHex}</strong> (rgb: {activeRgb.r}, {activeRgb.g}, {activeRgb.b}) için en yakın{' '}
              <strong>{searchResults.length}</strong> renk (Delta E 2000 sıralı)
              {selectedFamily !== 'all' ? ` · Aile: ${getFamilyLabelTr(selectedFamily)}` : ''}
            </span>
          )}
        </div>
        <div className="summary-right">
          <span className="target-badge" style={{ borderColor: activeHex }}>
            <span className="swatch-micro" style={{ backgroundColor: activeHex }} />
            <span className="mono-font">{rgbToHex(activeRgb)}</span>
          </span>
        </div>
      </div>

      {/* Sonuç Kartları veya Boş / Hata Durumu */}
      {inputError ? (
        <div className="empty-results-state">
          <AlertCircle size={38} className="empty-icon" />
          <h3>Geçersiz Renk Girdisi</h3>
          <p>{inputError}</p>
          <button type="button" className="action-btn secondary-btn" onClick={handleResetFilters}>
            Varsayılan Renge Dön (#B2AC88)
          </button>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="empty-results-state">
          <Palette size={38} className="empty-icon" />
          <h3>Arama Kriterlerine Uygun Renk Bulunamadı</h3>
          <p>
            "{nameQuery || selectedFamily}" sorgusu için eşleşen kayıt bulunamadı. Farklı bir renk adı deneyebilir
            veya aile filtresini kaldırabilirsiniz.
          </p>
          <button type="button" className="action-btn secondary-btn" onClick={handleResetFilters}>
            Filtreleri Sıfırla
          </button>
        </div>
      ) : (
        <div className="color-results-grid" id="colorSearchResultsGrid">
          {searchResults.map((res, index) => {
            const { color, deltaE, similarityLabel } = res;
            const contrastText = getContrastTextColor(color.rgb);
            const isCopied = copiedId === color.id;

            return (
              <article key={color.id} className="color-dict-card">
                <div
                  className="color-dict-swatch"
                  style={{ backgroundColor: color.hex, color: contrastText }}
                >
                  <span className="color-rank-tag mono-font">#{index + 1}</span>
                  <span className="color-delta-pill mono-font" title="CIEDE2000 algısal renk farkı">
                    ΔE {deltaE.toFixed(2)}
                  </span>
                </div>

                <div className="color-dict-body">
                  <div className="color-dict-header">
                    <h3 className="color-dict-name">{color.name}</h3>
                    <span className="color-family-badge">
                      {getFamilyLabelTr(color.family)} ({getFamilyLabelEn(color.family)})
                    </span>
                  </div>

                  <div className="color-dict-codes">
                    <div className="code-row">
                      <span className="code-label">HEX</span>
                      <span className="code-val mono-font">{color.hex}</span>
                    </div>
                    <div className="code-row">
                      <span className="code-label">RGB</span>
                      <span className="code-val mono-font">
                        {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                      </span>
                    </div>
                    <div className="code-row">
                      <span className="code-label">Yakınlık</span>
                      <span className="code-val">{similarityLabel}</span>
                    </div>
                  </div>

                  {color.tags && color.tags.length > 0 && (
                    <div className="hcd-mini-tags" style={{ marginBottom: '0.5rem' }}>
                      {color.tags.slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx} className="hcd-mini-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="color-dict-footer">
                    <span className="color-source-label" title={`Veri kaynağı: ${color.source}`}>
                      {color.source}
                    </span>
                    <button
                      type="button"
                      className={`copy-hex-btn ${isCopied ? 'copied' : ''}`}
                      onClick={() => handleCopyHex(color.id, color.hex)}
                      aria-label={`${color.name} HEX kodunu kopyala: ${color.hex}`}
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{isCopied ? 'Kopyalandı' : 'HEX Kopyala'}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* B. ARŞİVDE BU RENGE YAKIN SANAT ESERLERİ */}
      <section
        className="artwork-matches-section"
        id="artworkColorMatchesSection"
        aria-labelledby="artworkMatchesHeading"
      >
        <div className="artwork-matches-header">
          <div className="artwork-matches-title-group">
            <span className="search-subsection-kicker mono-font">
              B. ARŞİVDEKİ ESER EŞLEŞMELERİ
            </span>
            <h3 id="artworkMatchesHeading" className="artwork-matches-heading">
              ARŞİVDE BU RENGE YAKIN SANAT ESERLERİ
            </h3>
            <p className="artwork-matches-lead">
              {artworkTarget ? (
                <>
                  Hedef renk <strong>{artworkTarget.label}</strong> ile gerçek piksel paleti çıkarılmış{' '}
                  <strong>{analyzedArchiveCount}</strong> arşiv eseri arasındaki en düşük{' '}
                  <span className="mono-inline">CIEDE2000 (ΔE)</span> renk mesafesine göre sıralanır.
                </>
              ) : (
                'Geçerli bir hedef renk belirlendiğinde arşivdeki analiz edilmiş eserler Delta E 2000 yakınlığına göre listelenir.'
              )}
            </p>
          </div>

          {artworkTarget && (
            <div className="artwork-target-pill">
              <span
                className="swatch-micro"
                style={{ backgroundColor: artworkTarget.hex }}
              />
              <span className="mono-font">{artworkTarget.hex}</span>
              <span className="artwork-match-count-badge">
                {artworkMatches.length} eser eşleşti
              </span>
            </div>
          )}
        </div>

        {inputError ? (
          <div className="empty-results-state">
            <AlertCircle size={32} className="empty-icon" />
            <h3>Eser Eşleştirmesi İçin Geçerli Renk Bekleniyor</h3>
            <p>Geçerli bir HEX veya RGB kodu girdiğinizde arşiv eşleşmeleri otomatik güncellenir.</p>
          </div>
        ) : analyzedArchiveCount === 0 ? (
          <div className="empty-results-state">
            <ImageIcon size={34} className="empty-icon" />
            <h3>Arşivde Analiz Edilmiş Eser Bulunmuyor</h3>
            <p>
              Henüz baskın renk paleti hesaplanmış eser kaydı yok. Görsel Analizöründen bir eseri
              analiz edip arşive ekleyebilirsiniz.
            </p>
          </div>
        ) : artworkMatches.length === 0 ? (
          <div className="empty-results-state">
            <ImageIcon size={34} className="empty-icon" />
            <h3>Bu Sorgu İçin Eşleşen Eser Bulunamadı</h3>
            <p>
              Aradığınız renk adı sözlükte eşleşmediği için eser karşılaştırması yapılamadı. HEX
              kodu veya başka bir renk adı deneyebilirsiniz.
            </p>
            <button
              type="button"
              className="action-btn secondary-btn"
              onClick={handleResetFilters}
            >
              Aramayı Sıfırla (#B2AC88)
            </button>
          </div>
        ) : (
          <>
            <div className="artwork-matches-grid" id="artworkColorMatchesGrid">
              {displayedArtworkMatches.map((match, idx) => {
                const { artwork, closestColor, deltaE, similarityLabel } = match;
                const copyKey = `art_${artwork.id}_${closestColor.hex}`;
                const isCopied = copiedId === copyKey;
                const thumbSrc = artwork.thumbnailUrl || artwork.imageUrl;

                return (
                  <article
                    key={artwork.id}
                    className="artwork-match-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectArtwork?.(artwork)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectArtwork?.(artwork);
                      }
                    }}
                    aria-label={`${artwork.title} — ${artwork.artist} eser detayını aç`}
                  >
                    <div className="artwork-match-thumb-wrap">
                      <img
                        src={thumbSrc}
                        alt={artwork.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="artwork-match-thumb"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_ARTWORK_THUMB;
                        }}
                      />
                      <span className="artwork-match-rank mono-font">#{idx + 1}</span>
                      {artwork.isCustom && (
                        <span className="artwork-match-custom-tag">Kullanıcı Analizi</span>
                      )}
                    </div>

                    <div className="artwork-match-body">
                      <div className="artwork-match-meta-top">
                        <h4 className="artwork-match-title" title={artwork.title}>
                          {artwork.title}
                        </h4>
                        <div className="artwork-match-artist">
                          {artwork.artist} · <span className="mono-font">{artwork.year || artwork.date}</span>
                        </div>
                      </div>

                      {/* Eşleşen Baskın Renk Önizlemesi */}
                      <div className="artwork-matched-swatch-row">
                        <span
                          className="artwork-matched-swatch"
                          style={{ backgroundColor: closestColor.hex }}
                          title={closestColor.name}
                        />
                        <div className="artwork-matched-color-info">
                          <span className="artwork-matched-color-name">{closestColor.name}</span>
                          <span className="artwork-matched-color-hex mono-font">
                            {closestColor.hex}
                          </span>
                        </div>
                        <button
                          type="button"
                          className={`copy-hex-btn compact ${isCopied ? 'copied' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyHex(copyKey, closestColor.hex);
                          }}
                          title={`Eşleşen rengi kopyala: ${closestColor.hex}`}
                          aria-label={`${closestColor.hex} kodunu kopyala`}
                        >
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          <span>{isCopied ? 'Kopyalandı' : closestColor.hex}</span>
                        </button>
                      </div>

                      {/* Algısal Yakınlık (Delta E) ve Palet Payı (%) Görsel Olarak Ayrı Gösterilir */}
                      <div className="artwork-match-metrics">
                        <div className="artwork-metric-box delta-box" title="Hedef renge algısal mesafe (CIEDE2000)">
                          <span className="metric-box-label">Algısal Yakınlık</span>
                          <span className="metric-box-value mono-font">
                            ΔE {deltaE.toFixed(2)}
                          </span>
                          <span className="metric-box-sub">{similarityLabel}</span>
                        </div>
                        <div className="artwork-metric-box share-box" title="Bu rengin tablo paletindeki kaplama oranı">
                          <span className="metric-box-label">Tablo Palet Payı</span>
                          <span className="metric-box-value mono-font">
                            %{closestColor.percentage}
                          </span>
                          <span className="metric-box-sub">Baskın renk oranı</span>
                        </div>
                      </div>

                      <div className="artwork-match-footer">
                        <span className="artwork-match-inspect-cue">
                          <span>Eser Detayı & Müze Kaydı</span>
                          <ArrowUpRight size={14} />
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {artworkMatches.length > INITIAL_ARTWORK_MATCH_LIMIT && (
              <div className="artwork-matches-toggle-row">
                <button
                  type="button"
                  className="artwork-matches-toggle-btn"
                  onClick={() => setShowAllArtworkMatches((prev) => !prev)}
                >
                  {showAllArtworkMatches ? (
                    <>
                      <ChevronUp size={16} />
                      <span>İlk {INITIAL_ARTWORK_MATCH_LIMIT} Eşleşmeyi Göster</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      <span>Tüm eşleşmeleri göster ({artworkMatches.length} eser)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>


      {/* Sözlük Veri Kaynakları ve Lisans Atıfları */}
      {datasetSummary.sources && datasetSummary.sources.length > 0 && (
        <div className="search-sources-banner">
          <div className="search-sources-title">
            Renk Sözlüğü Veri Kaynakları ({datasetSummary.totalColors} Açık Kaynak Renk)
          </div>
          <ul className="search-sources-list">
            {datasetSummary.sources.map((src) => (
              <li key={src.name}>
                <a href={src.url} target="_blank" rel="noopener noreferrer">
                  {src.name}
                </a>{' '}
                <span className="src-license-meta">
                  ({src.license}){src.attribution ? ` — ${src.attribution}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

