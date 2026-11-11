/**
 * @file SearchBar.tsx
 * @description Smart color similarity search and exploration component for ChromArchive.
 * Allows users to pick or enter a target color and calculates weighted Euclidean
 * color distances to rank archive artworks by perceptual similarity.
 */

import React, { useState, useMemo } from 'react';
import { Search, Sparkles, SlidersHorizontal, ArrowRight, Palette } from 'lucide-react';
import type { ArtworkMetadata, ColorAnalysisResult } from '../types';
import { calculateSimilarityScore, hexToRgb } from '../services/colorAnalyzer';

interface SearchBarProps {
  archiveItems: ArtworkMetadata[];
  onSelectArtwork: (artwork: ArtworkMetadata) => void;
  onCopyColor: (hex: string) => void;
  onAnalyzeColorPalette?: (analysis: ColorAnalysisResult) => void;
}

interface RankedArtwork {
  artwork: ArtworkMetadata;
  similarityScore: number;
  matchedColorHex: string;
}

const PRESET_SEARCH_COLORS = [
  { name: 'Prusya Mavisi', hex: '#1E3A5F' },
  { name: 'Hardal Sarısı', hex: '#E5A93C' },
  { name: 'Koyu Toprak', hex: '#5A3E2D' },
  { name: 'Zeytin Yeşili', hex: '#4A5D3E' },
  { name: 'Kiremit Kırmızısı', hex: '#8B3A2B' },
  { name: 'Gül Kurusu', hex: '#A25B68' },
  { name: 'Kemik / Parşömen', hex: '#EAE5D9' },
  { name: 'Antrasit Kömür', hex: '#232529' }
];

export const SearchBar: React.FC<SearchBarProps> = ({
  archiveItems,
  onSelectArtwork,
  onCopyColor
}) => {
  const [selectedHex, setSelectedHex] = useState<string>('#1E3A5F');
  const [minThreshold, setMinThreshold] = useState<number>(45);

  const targetRgb = useMemo(() => hexToRgb(selectedHex), [selectedHex]);

  // Rank archive items by calculating best match among their dominant colors
  const searchResults = useMemo<RankedArtwork[]>(() => {
    return archiveItems
      .map((item) => {
        const { similarityScore, closestColor } = calculateSimilarityScore(
          targetRgb,
          item.dominantColors || []
        );

        return {
          artwork: item,
          similarityScore,
          matchedColorHex: closestColor?.hex || item.dominantColors[0]?.hex || '#000000',
        };
      })
      .filter((res) => res.similarityScore >= minThreshold)
      .sort((a, b) => b.similarityScore - a.similarityScore);
  }, [archiveItems, targetRgb, minThreshold]);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) {
      val = '#' + val;
    }
    setSelectedHex(val.slice(0, 7));
  };

  return (
    <div className="search-section-wrapper">
      <div className="section-header-compact">
        <div className="badge-tag">
          <Palette size={13} />
          <span>KROMATİK BENZERLİK ARAMASI</span>
        </div>
        <h2 className="section-title">Hedef Renkle Arşiv Keşfi</h2>
        <p className="section-lead">
          Seçtiğiniz veya yazdığınız rengin RGB spektrumu, arşivdeki tüm sanat eserlerinin baskın renk kümeleriyle
          insan algısına duyarlı ağırlıklı Öklid mesafesi üzerinden karşılaştırılır ve benzerlik skoruna göre sıralanır.
        </p>
      </div>

      {/* Control Card */}
      <div className="search-controls-card">
        <div className="search-picker-group">
          <div className="picker-input-container">
            <input
              type="color"
              id="color-picker-input"
              value={selectedHex.length === 7 ? selectedHex : '#1E3A5F'}
              onChange={(e) => setSelectedHex(e.target.value)}
              className="native-color-input"
              aria-label="Renk Seçici"
            />
            <div
              className="color-sample-box"
              style={{ backgroundColor: selectedHex }}
              title="Aktif Renk"
            />
          </div>

          <div className="hex-field-group">
            <label htmlFor="hex-text-input" className="field-label">
              HEX / Renk Kodu
            </label>
            <div className="input-with-icon">
              <Search size={16} className="input-icon" />
              <input
                id="hex-text-input"
                type="text"
                value={selectedHex}
                onChange={handleHexInputChange}
                placeholder="#1E3A5F"
                maxLength={7}
                className="text-input-field mono-font"
              />
            </div>
            <span className="rgb-hint mono-font">
              RGB: ({targetRgb[0]}, {targetRgb[1]}, {targetRgb[2]})
            </span>
          </div>

          <div className="threshold-group">
            <div className="slider-header">
              <label htmlFor="similarity-threshold" className="field-label">
                <SlidersHorizontal size={14} className="inline-icon" />
                Minimum Benzerlik Eşiği
              </label>
              <span className="threshold-val font-semibold">%{minThreshold}</span>
            </div>
            <input
              id="similarity-threshold"
              type="range"
              min="20"
              max="85"
              step="5"
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
              className="range-slider"
            />
            <div className="slider-ticks">
              <span>Geniş (%20)</span>
              <span>Dengeli (%50)</span>
              <span>Kesin (%85)</span>
            </div>
          </div>
        </div>

        {/* Preset Palettes */}
        <div className="preset-colors-row">
          <span className="presets-label">Popüler Arşiv Tonları:</span>
          <div className="preset-chips-list">
            {PRESET_SEARCH_COLORS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                className={`preset-chip ${selectedHex.toLowerCase() === preset.hex.toLowerCase() ? 'active' : ''}`}
                onClick={() => setSelectedHex(preset.hex)}
              >
                <span className="preset-swatch" style={{ backgroundColor: preset.hex }} />
                <span className="preset-name">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="search-results-summary">
        <div className="summary-left">
          <Sparkles size={16} className="text-secondary" />
          <span>
            <strong>{searchResults.length}</strong> eser bulundu (Eşik: %{minThreshold})
          </span>
        </div>
        <div className="summary-right">
          <span className="target-badge" style={{ borderColor: selectedHex }}>
            <span className="swatch-micro" style={{ backgroundColor: selectedHex }} />
            {selectedHex.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Results Grid */}
      {searchResults.length === 0 ? (
        <div className="empty-results-state">
          <Palette size={40} className="empty-icon" />
          <h3>Bu Eşikle Eşleşen Eser Bulunamadı</h3>
          <p>
            Benzerlik eşiğini %{minThreshold} yerine daha düşük bir değere kaydırabilir veya başka bir renk seçebilirsiniz.
          </p>
          <button
            type="button"
            className="action-btn secondary-btn"
            onClick={() => setMinThreshold(30)}
          >
            Eşiği %30'a Düşür
          </button>
        </div>
      ) : (
        <div className="search-results-grid">
          {searchResults.map(({ artwork, similarityScore, matchedColorHex }) => (
            <article key={artwork.id} className="search-result-card">
              <div className="result-img-container" onClick={() => onSelectArtwork(artwork)}>
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  loading="lazy"
                  className="result-thumb"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect fill="%23232529" width="300" height="200"/><text fill="%23999" x="50%" y="50%" text-anchor="middle">Arşiv Görseli</text></svg>';
                  }}
                />
                <div className="similarity-badge">
                  <span>%{similarityScore} Uyum</span>
                </div>
              </div>

              <div className="result-card-body">
                <div className="result-meta-top">
                  <span className="artwork-artist">{artwork.artist}</span>
                  <span className="artwork-year">{artwork.year}</span>
                </div>
                <h3 className="result-title" onClick={() => onSelectArtwork(artwork)}>
                  {artwork.title}
                </h3>

                {/* Match indicator */}
                <div className="match-explanation">
                  <span className="match-label">En Yakın Renk:</span>
                  <div
                    className="matched-swatch"
                    style={{ backgroundColor: matchedColorHex }}
                    title={`Kopyalamak için tıkla: ${matchedColorHex}`}
                    onClick={() => onCopyColor(matchedColorHex)}
                  >
                    <span className="matched-hex mono-font">{matchedColorHex}</span>
                  </div>
                </div>

                {/* Artwork palette mini strip */}
                <div className="mini-palette-strip">
                  {artwork.dominantColors.map((col, idx) => (
                    <div
                      key={idx}
                      className="mini-strip-color"
                      style={{
                        backgroundColor: col.hex,
                        width: `${Math.max(col.percentage, 8)}%`
                      }}
                      title={`${col.hex} (${col.percentage}%)`}
                      onClick={() => onCopyColor(col.hex)}
                    />
                  ))}
                </div>

                <div className="result-card-footer">
                  <button
                    type="button"
                    className="inspect-btn-inline"
                    onClick={() => onSelectArtwork(artwork)}
                  >
                    <span>Detayları İncele</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
