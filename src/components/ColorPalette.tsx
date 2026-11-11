/**
 * @file src/components/ColorPalette.tsx
 * @description K-Means renk kümeleme sonuçları, yatay ve ızgara renk kartları, spektrum dağılım çubuğu ve JSON önizleme bileşeni.
 */

import React from 'react';
import {
  ArtworkMetadata,
  ClusterCountOption,
  DominantColor,
  PaletteViewMode,
} from '../types';

interface ColorPaletteProps {
  analysisData: ArtworkMetadata | null;
  clusterCount: ClusterCountOption;
  onClusterCountChange: (k: ClusterCountOption) => void;
  paletteViewMode: PaletteViewMode;
  onPaletteViewModeChange: (mode: PaletteViewMode) => void;
  onSaveToArchive: () => void;
  onDownloadJson: () => void;
  onCopyHex: (hex: string) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  analysisData,
  clusterCount,
  onClusterCountChange,
  paletteViewMode,
  onPaletteViewModeChange,
  onSaveToArchive,
  onDownloadJson,
  onCopyHex,
}) => {
  if (!analysisData || !analysisData.dominantColors) {
    return null;
  }

  const colors: DominantColor[] = analysisData.dominantColors;

  return (
    <div className="results-panel" id="analysisResultsContainer">
      {/* Sonuç Başlığı ve Aksiyonlar */}
      <div className="results-header">
        <div>
          <span className="section-kicker">
            K-Means Algoritmik Analiz Çıktısı
          </span>
          <h3 className="results-title">Baskın Renk Paleti</h3>
        </div>
        <div className="results-actions">
          <button
            type="button"
            className="btn-secondary"
            id="saveToArchiveBtn"
            onClick={onSaveToArchive}
            title="Bu analizi yerel dijital arşive ekle"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>Arşive Ekle</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            id="downloadJsonMetadataBtn"
            onClick={onDownloadJson}
            title="Metadata JSON formatında indir"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            <span>JSON İndir</span>
          </button>
        </div>
      </div>

      {/* K-Means Kümeleme & Görünüm Ayar Çubuğu */}
      <div className="analysis-toolbar">
        <div className="cluster-controls-group">
          <span className="cluster-controls-label">Kümeleme (K-Means):</span>
          <button
            type="button"
            className={`cluster-btn ${clusterCount === 'auto' ? 'active' : ''}`}
            onClick={() => onClusterCountChange('auto')}
            title="Görsel karmaşıklığına göre en uygun küme sayısını (5-8) seç"
          >
            Otomatik (5-8)
          </button>
          {([5, 6, 7, 8] as const).map((count) => (
            <button
              key={count}
              type="button"
              className={`cluster-btn ${clusterCount === count ? 'active' : ''}`}
              onClick={() => onClusterCountChange(count)}
            >
              {count} Renk
            </button>
          ))}
        </div>

        <div className="palette-view-toggle">
          <button
            type="button"
            className={`view-toggle-btn ${
              paletteViewMode === 'horizontal' ? 'active' : ''
            }`}
            onClick={() => onPaletteViewModeChange('horizontal')}
            title="Yatay Gerçek Renk Kartları Görünümü"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span>Yatay Kartlar</span>
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${
              paletteViewMode === 'grid' ? 'active' : ''
            }`}
            onClick={() => onPaletteViewModeChange('grid')}
            title="Kompakt Izgara Görünümü"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Izgara</span>
          </button>
        </div>
      </div>

      {/* Genel Renk Dağılım Skalası (Spektrum) */}
      <div className="distribution-bar-wrapper">
        <div className="distribution-label-row">
          <span>Genel Renk Dağılım Skalası (Spektrum)</span>
          <span>(Kopyalamak için renge tıklayın)</span>
        </div>
        <div className="distribution-bar" id="analysisDistributionBar">
          {colors.map((c, i) => (
            <div
              key={i}
              className="palette-segment"
              style={{
                width: `${c.percentage}%`,
                backgroundColor: c.hex,
              }}
              title={`${c.name} (${c.hex}) - %${c.percentage} - ${c.rgbString}`}
              onClick={() => onCopyHex(c.hex)}
            />
          ))}
        </div>
      </div>

      {/* 1. Yatay Renk Kartları Görünümü (Horizontal Palette Cards) */}
      {paletteViewMode === 'horizontal' && (
        <div
          className="horizontal-palette-list"
          id="analysisPaletteHorizontal"
        >
          {colors.map((c, i) => (
            <div
              key={i}
              className="horizontal-color-card"
              onClick={() => onCopyHex(c.hex)}
              title="HEX kodunu kopyalamak için tıklayın"
            >
              <div
                className="h-color-swatch"
                style={{ backgroundColor: c.hex }}
              >
                <span className="copy-badge">Kopyala</span>
              </div>

              <div className="h-color-info-group">
                <div className="h-color-hex-row">
                  <span className="h-color-hex">{c.hex}</span>
                  <span className="h-color-rgb">{c.rgbString}</span>
                </div>
                <div className="h-color-name-group">
                  <span className="h-color-name">{c.name}</span>
                  <span className="h-color-tags">
                    · {c.temperature} · {c.family}
                  </span>
                </div>
              </div>

              <div className="h-color-percentage-box">
                <span className="h-color-percent-number tabular-nums">
                  %{c.percentage}
                </span>
                <div className="h-color-progress-track">
                  <div
                    className="h-color-progress-fill"
                    style={{
                      width: `${Math.min(100, c.percentage * 2.2)}%`,
                      backgroundColor: c.hex,
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                className="h-color-copy-action"
                aria-label="Kopyala"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyHex(c.hex);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 2. Alternatif Kompakt Izgara Görünümü (Grid Cards) */}
      {paletteViewMode === 'grid' && (
        <div
          className="palette-cards-grid"
          id="analysisPaletteCards"
          style={{ display: 'grid' }}
        >
          {colors.map((c, i) => (
            <div
              key={i}
              className="color-card"
              onClick={() => onCopyHex(c.hex)}
              title="Kopyalamak için tıkla"
            >
              <div
                className="color-swatch-box"
                style={{ backgroundColor: c.hex }}
              >
                <span className="copy-badge">Kopyala</span>
              </div>
              <div className="color-card-body">
                <div className="color-hex">{c.hex}</div>
                <div className="color-percentage">%{c.percentage} Oran</div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  {c.rgbString}
                </div>
                <div className="color-name">{c.name}</div>
                <div className="color-temperature-tag">
                  {c.temperature} · {c.family}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Özet Metrikler */}
      <div className="analysis-metrics-row">
        <div className="metric-item">
          <span className="metric-label">Genel Sıcaklık</span>
          <span className="metric-value" id="metricOverallTemp">
            {analysisData.overallTemperature}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Renk Çeşitlilik Endeksi</span>
          <span className="metric-value tabular-nums" id="metricDiversityScore">
            {analysisData.colorDiversityScore ?? 80} / 100
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Baskın Küme Sayısı</span>
          <span className="metric-value" id="metricDominantCount">
            {analysisData.dominantColors.length} Renk (K-Means)
          </span>
        </div>
      </div>
    </div>
  );
};
