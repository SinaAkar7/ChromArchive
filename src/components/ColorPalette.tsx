/**
 * @file src/components/ColorPalette.tsx
 * @description K-Means renk kümeleme sonuçları, yatay ve ızgara renk kartları, spektrum dağılım çubuğu ve JSON önizleme bileşeni.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, History, Info, Layers } from 'lucide-react';
import {
  ArtworkMetadata,
  ClusterCountOption,
  DominantColor,
  PaletteViewMode,
} from '../types';
import { hydrateLegacyArtworkTemperature } from '../services/colorTemperatureService';
import { ColorAnalysisInsights } from './ColorAnalysisInsights';
import { ColorHistoricalContextPanel } from './ColorHistoricalContextPanel';

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
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>(
    {}
  );

  const hydratedData = useMemo(
    () => (analysisData ? hydrateLegacyArtworkTemperature(analysisData) : null),
    [analysisData]
  );

  useEffect(() => {
    setExpandedIndices({});
  }, [hydratedData?.id, hydratedData?.dominantColors]);

  if (!hydratedData || !hydratedData.dominantColors) {
    return null;
  }

  const colors: DominantColor[] = hydratedData.dominantColors;
  const warmPct = hydratedData.warmSharePercent ?? 0;
  const transPct = hydratedData.transitionalSharePercent ?? 0;
  const coolPct = hydratedData.coolSharePercent ?? 0;
  const neutralPct = hydratedData.neutralSharePercent ?? 0;
  const chromaticMean = hydratedData.warmthScoreWeightedMean;
  const spatialRelations = hydratedData.spatialTemperatureRelations ?? [];

  const toggleContext = (index: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getCategoryBadgeClass = (cat?: string) => {
    switch (cat) {
      case 'warm':
        return 'temp-badge-warm';
      case 'cool':
        return 'temp-badge-cool';
      case 'transitional':
        return 'temp-badge-transitional';
      default:
        return 'temp-badge-neutral';
    }
  };

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

      {/* Palet Düzeyi Göreli Sıcak–Geçişli–Soğuk–Nötr Dağılım Özeti */}
      <div
        className="palette-temp-summary-card"
        role="region"
        aria-label="Palet sıcaklık dağılımı özeti"
      >
        <div className="palette-temp-header">
          <div>
            <span className="temp-summary-kicker">
              Ağırlıklı Göreli Renk Sıcaklığı Profili
            </span>
            <h4 className="temp-summary-headline">
              {hydratedData.overallTemperature}
              <span className="temp-mean-pill tabular-nums">
                {typeof chromaticMean === 'number'
                  ? `Kromatik Ortalama: ${chromaticMean} / 100`
                  : 'Kromatik Ortalama: Tümü Nötr'}
              </span>
            </h4>
          </div>
          <span className="temp-nonkelvin-note">
            Görsel yönelim skoru (0–100) · Fiziksel Kelvin değildir
          </span>
        </div>

        <div
          className="palette-temp-bar"
          role="img"
          aria-label={`Sıcak %${warmPct}, Geçişli %${transPct}, Soğuk %${coolPct}, Nötr %${neutralPct}`}
        >
          {warmPct > 0 && (
            <div
              className="ptemp-seg ptemp-warm"
              style={{ width: `${warmPct}%` }}
              title={`Sıcak yönelimli: %${warmPct}`}
            >
              {warmPct >= 10 && <span>%{warmPct}</span>}
            </div>
          )}
          {transPct > 0 && (
            <div
              className="ptemp-seg ptemp-transitional"
              style={{ width: `${transPct}%` }}
              title={`Geçişli / dengeli: %${transPct}`}
            >
              {transPct >= 10 && <span>%{transPct}</span>}
            </div>
          )}
          {coolPct > 0 && (
            <div
              className="ptemp-seg ptemp-cool"
              style={{ width: `${coolPct}%` }}
              title={`Soğuk yönelimli: %${coolPct}`}
            >
              {coolPct >= 10 && <span>%{coolPct}</span>}
            </div>
          )}
          {neutralPct > 0 && (
            <div
              className="ptemp-seg ptemp-neutral"
              style={{ width: `${neutralPct}%` }}
              title={`Nötr / belirsiz: %${neutralPct}`}
            >
              {neutralPct >= 10 && <span>%{neutralPct}</span>}
            </div>
          )}
        </div>

        <div className="palette-temp-legend">
          <span className="ptemp-legend-item">
            <span className="ptemp-dot ptemp-warm" aria-hidden="true" />
            <span>Sıcak yönelimli: <strong>%{warmPct}</strong></span>
          </span>
          <span className="ptemp-legend-item">
            <span className="ptemp-dot ptemp-transitional" aria-hidden="true" />
            <span>Geçişli / dengeli: <strong>%{transPct}</strong></span>
          </span>
          <span className="ptemp-legend-item">
            <span className="ptemp-dot ptemp-cool" aria-hidden="true" />
            <span>Soğuk yönelimli: <strong>%{coolPct}</strong></span>
          </span>
          <span className="ptemp-legend-item">
            <span className="ptemp-dot ptemp-neutral" aria-hidden="true" />
            <span>Nötr (ort. dışı): <strong>%{neutralPct}</strong></span>
          </span>
        </div>

        {hydratedData.temperatureSummary && (
          <p className="palette-temp-prose">{hydratedData.temperatureSummary}</p>
        )}

        <div className="palette-temp-method-note">
          <Info size={13} />
          <span>
            <strong>Ortalama Puan Nasıl Hesaplanır?</strong> Kromatik ortalama
            skor, nötr kümeler (%{neutralPct}) hariç tutularak kalan renk
            kümelerinin <strong>piksel alanı yüzdeleriyle (%)</strong> ağırlıklı
            ortalaması alınarak hesaplanır. Her renk skoru; Hue açısı, HSL/HSV
            doygunluk, Lightness, CIELAB kroma (<code className="mono-inline">C*ab</code>)
            ve renk ailesi/toprak alt-tonu birlikte değerlendirilerek 0 (soğuk) –
            50 (dengeli/nötr) – 100 (sıcak) ölçeğinde üretilir.
          </span>
        </div>
      </div>

      {/* 1. Yatay Renk Kartları Görünümü (Horizontal Palette Cards) */}
      {paletteViewMode === 'horizontal' && (
        <div
          className="horizontal-palette-list"
          id="analysisPaletteHorizontal"
        >
          {colors.map((c, i) => {
            const isExpanded = Boolean(expandedIndices[i]);
            return (
              <div key={i} className="palette-card-unit">
                <div
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
                        · {c.family} · {c.temperature}
                      </span>
                    </div>

                    {/* Göreli Sıcaklık Skoru, Güven ve Palet İçi Bağlam */}
                    <div className="card-temp-meta-strip">
                      <span
                        className={`card-temp-badge ${getCategoryBadgeClass(
                          c.temperatureCategory
                        )}`}
                      >
                        {c.temperatureLabel || c.temperature}
                      </span>
                      {typeof c.warmthScore === 'number' && (
                        <span className="card-score-chip tabular-nums">
                          Skor: {c.warmthScore}/100
                        </span>
                      )}
                      {c.temperatureConfidenceLabel && (
                        <span className="card-conf-chip">
                          Güven: {c.temperatureConfidenceLabel}
                        </span>
                      )}
                      {c.relativeToPalette && (
                        <span className="card-rel-chip">
                          {c.relativeToPalette}
                        </span>
                      )}
                    </div>
                    {c.undertoneNote && (
                      <p className="card-undertone-note">{c.undertoneNote}</p>
                    )}
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

                <div className="card-context-toggle-bar">
                  <button
                    type="button"
                    className={`context-toggle-btn ${isExpanded ? 'is-open' : ''}`}
                    aria-expanded={isExpanded}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleContext(i);
                    }}
                  >
                    <History size={14} />
                    <span>Tarihsel renk ve pigment bağlamı</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {isExpanded && (
                  <ColorHistoricalContextPanel
                    color={c}
                    onCopyHex={onCopyHex}
                    onClose={() => toggleContext(i)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Alternatif Kompakt Izgara Görünümü (Grid Cards) */}
      {paletteViewMode === 'grid' && (
        <>
          <div
            className="palette-cards-grid"
            id="analysisPaletteCards"
            style={{ display: 'grid' }}
          >
            {colors.map((c, i) => {
              const isExpanded = Boolean(expandedIndices[i]);
              return (
                <div
                  key={i}
                  className={`color-card ${isExpanded ? 'context-active' : ''}`}
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
                    <div className="grid-card-temp-box">
                      <span
                        className={`card-temp-badge ${getCategoryBadgeClass(
                          c.temperatureCategory
                        )}`}
                      >
                        {c.temperatureLabel || c.temperature}
                      </span>
                      <div className="grid-card-temp-sub">
                        {typeof c.warmthScore === 'number' && (
                          <span className="tabular-nums">Skor: {c.warmthScore}/100</span>
                        )}
                        {c.temperatureConfidenceLabel && (
                          <span> · Güven: {c.temperatureConfidenceLabel}</span>
                        )}
                      </div>
                      {c.relativeToPalette && (
                        <div className="grid-card-rel-note">
                          {c.relativeToPalette}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`context-toggle-btn grid-context-toggle ${
                        isExpanded ? 'is-open' : ''
                      }`}
                      aria-expanded={isExpanded}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleContext(i);
                      }}
                    >
                      <History size={13} />
                      <span>Tarihsel renk ve pigment bağlamı</span>
                      {isExpanded ? (
                        <ChevronUp size={13} />
                      ) : (
                        <ChevronDown size={13} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {colors.some((_, idx) => Boolean(expandedIndices[idx])) && (
            <div className="grid-expanded-contexts">
              {colors.map((c, i) =>
                expandedIndices[i] ? (
                  <ColorHistoricalContextPanel
                    key={i}
                    color={c}
                    onCopyHex={onCopyHex}
                    onClose={() => toggleContext(i)}
                  />
                ) : null
              )}
            </div>
          )}
        </>
      )}

      {/* Örneklem Tabanlı Mekânsal Komşuluk Analizi (Yeterli sınır örneği varsa) */}
      {spatialRelations.length > 0 && (
        <div
          className="spatial-relations-panel"
          role="region"
          aria-label="Örneklem tabanlı mekânsal komşuluk ilişkileri"
        >
          <div className="spatial-panel-header">
            <div className="spatial-title-group">
              <Layers size={16} />
              <h5>Örneklem Tabanlı Mekânsal Komşuluk İlişkileri</h5>
            </div>
            <span className="spatial-sample-badge">
              Yaklaşık Grid Örneklemesi (240px · 4-komşuluk)
            </span>
          </div>
          <p className="spatial-caveat-note">
            <Info size={13} />
            <span>
              Bu bölüm tam piksel segmentasyonu değildir; örneklenen grid üzerinde
              en az 8 komşuluk sınırına ve ≥8 puan sıcaklık farkına sahip komşu
              kümeler arasındaki göreli sıcaklık karşıtlıklarını özetler.
            </span>
          </p>
          <div className="spatial-relations-grid">
            {spatialRelations.map((rel, rIdx) => (
              <div key={rIdx} className="spatial-relation-item">
                <div className="spatial-swatches-pair">
                  <span
                    className="spatial-mini-swatch"
                    style={{ backgroundColor: rel.clusterA }}
                    title={rel.clusterA}
                  />
                  <span className="spatial-arrow">→</span>
                  <span
                    className="spatial-mini-swatch"
                    style={{ backgroundColor: rel.clusterB }}
                    title={rel.clusterB}
                  />
                  <span className="spatial-diff-badge tabular-nums">
                    +{rel.warmthScoreDifference} puan fark
                  </span>
                </div>
                <p className="spatial-relation-text">{rel.relation}</p>
                <span className="spatial-evidence-meta tabular-nums">
                  {rel.sharedBoundarySamples} ortak örnek sınırı
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Özet Metrikler */}
      <div className="analysis-metrics-row">
        <div className="metric-item">
          <span className="metric-label">Genel Sıcaklık Yönelimi</span>
          <span className="metric-value" id="metricOverallTemp">
            {hydratedData.overallTemperature}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Kromatik Ort. Skor (0–100)</span>
          <span className="metric-value tabular-nums">
            {typeof chromaticMean === 'number' ? `${chromaticMean} / 100` : 'Tümü Nötr'}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Renk Çeşitlilik Endeksi</span>
          <span className="metric-value tabular-nums" id="metricDiversityScore">
            {hydratedData.colorDiversityScore ?? 80} / 100
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Baskın Küme Sayısı</span>
          <span className="metric-value" id="metricDominantCount">
            {hydratedData.dominantColors.length} Renk (K-Means)
          </span>
        </div>
      </div>

      {/* Metodolojik Bilgi & Açık Kaynak Atıfları */}
      <ColorAnalysisInsights
        colors={colors}
        artworkTitle={hydratedData.title}
        onCopyHex={onCopyHex}
      />
    </div>
  );
};

