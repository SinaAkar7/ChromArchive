/**
 * @file Statistics.tsx
 * @description Curatorial chromatic statistics and analytic overview for ChromArchive.
 * Displays aggregate metrics across the digital archive including temperature distribution,
 * dominant color families, and collection diversity scores.
 */

import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  PieChart,
  Flame,
  Snowflake,
  Scale,
  Layers,
  Sparkles,
  Database,
  CircleHelp,
} from 'lucide-react';
import type { ArtworkMetadata } from '../types';
import { calculateArchiveStatistics } from '../services/archiveService';

interface StatisticsProps {
  archiveItems: ArtworkMetadata[];
  onSelectArtwork?: (artwork: ArtworkMetadata) => void;
}

type TooltipState = {
  id: string;
  mode: 'hover' | 'focus' | 'pinned';
} | null;

interface MetricTooltipProps {
  id: string;
  label: string;
  description: string;
  openTooltip: TooltipState;
  setOpenTooltip: React.Dispatch<React.SetStateAction<TooltipState>>;
  lastPointerTouchRef: React.MutableRefObject<boolean>;
}

const MetricTooltip: React.FC<MetricTooltipProps> = ({
  id,
  label,
  description,
  openTooltip,
  setOpenTooltip,
  lastPointerTouchRef,
}) => {
  const reactId = useId();
  const tooltipDomId = `stat-tooltip-${id}-${reactId.replace(/:/g, '')}`;
  const isOpen = openTooltip?.id === id;
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [shiftX, setShiftX] = useState<number>(0);

  useLayoutEffect(() => {
    if (!isOpen || !popoverRef.current) {
      setShiftX(0);
      return;
    }
    const el = popoverRef.current;
    // Reset shift first so measurement reflects natural centered position
    el.style.setProperty('--tooltip-shift-x', '0px');
    const rect = el.getBoundingClientRect();
    const margin = 12;
    let delta = 0;
    if (rect.right > window.innerWidth - margin) {
      delta = window.innerWidth - margin - rect.right;
    } else if (rect.left < margin) {
      delta = margin - rect.left;
    }
    setShiftX(Math.round(delta));
  }, [isOpen]);

  return (
    <div
      className="stat-tooltip-wrap"
      data-tooltip-wrap="true"
      onPointerEnter={(e) => {
        if (e.pointerType === 'touch') return;
        setOpenTooltip((prev) =>
          prev?.id === id && prev.mode === 'pinned' ? prev : { id, mode: 'hover' }
        );
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'touch') return;
        setOpenTooltip((prev) =>
          prev?.id === id && prev.mode === 'hover' ? null : prev
        );
      }}
      onFocus={() => {
        if (lastPointerTouchRef.current) return;
        setOpenTooltip((prev) =>
          prev?.id === id && prev.mode === 'pinned' ? prev : { id, mode: 'focus' }
        );
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpenTooltip((prev) =>
            prev?.id === id && prev.mode === 'focus' ? null : prev
          );
        }
      }}
    >
      <button
        type="button"
        className={`stat-help-btn ${isOpen ? 'active' : ''}`}
        aria-label={`${label} açıklaması`}
        aria-describedby={isOpen ? tooltipDomId : undefined}
        aria-expanded={isOpen}
        onPointerDown={(e) => {
          lastPointerTouchRef.current =
            e.pointerType === 'touch' || e.pointerType === 'pen';
        }}
        onClick={(e) => {
          e.stopPropagation();
          setOpenTooltip((prev) =>
            prev?.id === id && prev.mode === 'pinned' ? null : { id, mode: 'pinned' }
          );
        }}
      >
        <CircleHelp size={14} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          id={tooltipDomId}
          role="tooltip"
          className="stat-tooltip-popover"
          style={{ '--tooltip-shift-x': `${shiftX}px` } as React.CSSProperties}
        >
          <div className="stat-tooltip-title">{label}</div>
          <p className="stat-tooltip-text">{description}</p>
        </div>
      )}
    </div>
  );
};

const STAT_TOOLTIPS = {
  indexed:
    'Arşivde kayıtlı ve uygulamanın eser kataloğunda aranabilir durumda olan benzersiz eser sayısıdır. Bu sayı, renk analizi tamamlanan eser sayısıyla aynı olmak zorunda değildir.',
  clusters:
    'Renk analizi tamamlanan eserlerde K-Means++ algoritmasının belirlediği baskın renk gruplarının toplamıdır (benzersiz HEX sayısı değildir). Bir eserde birden fazla renk kümesi bulunabilir.',
  diversity:
    'Renk analizi tamamlanan eserlerin baskın renkleri arasındaki ortalama algısal mesafeyi (colorDiversityScore) özetleyen çeşitlilik puanıdır. Yüksek değer paletin daha çeşitli renkler içerdiğini gösterir; renk sayısı anlamına gelmez.',
  temperature:
    'Renk analizi tamamlanan eserlerin baskın sıcaklık yönelimine göre koleksiyondaki dağılımıdır. Paleti henüz oluşturulmamış eserler nötr sayılmaz ve sıcaklık hesaplamasına dahil edilmez; fiziksel Kelvin ölçümü değildir.',
};

export const Statistics: React.FC<StatisticsProps> = ({ archiveItems }) => {
  const stats = useMemo(() => calculateArchiveStatistics(archiveItems), [archiveItems]);
  const [openTooltip, setOpenTooltip] = useState<TooltipState>(null);
  const lastPointerTouchRef = useRef<boolean>(false);

  useEffect(() => {
    const handleOutsidePointer = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('[data-tooltip-wrap="true"]')) {
        setOpenTooltip(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenTooltip(null);
      }
    };
    document.addEventListener('pointerdown', handleOutsidePointer);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Group by artwork period/categories for taxonomy breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    archiveItems.forEach((item) => {
      const cat = item.category || item.period || 'Genel Koleksiyon';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [archiveItems]);

  return (
    <div className="statistics-section-wrapper">
      <div className="section-header-compact">
        <div className="badge-tag">
          <BarChart3 size={13} />
          <span>KROMATİK ARŞİV İSTATİSTİKLERİ</span>
        </div>
        <h2 className="section-title">Koleksiyon Renk Dağılımı ve Metrikleri</h2>
        <p className="section-lead">
          Dijital arşivdeki tüm açık erişimli sanat eserlerinin piksellerinden çıkarılan renk profilleri,
          sıcaklık dengeleri ve renk ailesi frekanslarının analitik dökümü.
        </p>
      </div>

      {/* 4 Primary Summary Cards */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-label-with-help">
              <span className="stat-label">İndekslenen Eser</span>
              <MetricTooltip
                id="indexed"
                label="İndekslenen Eser"
                description={STAT_TOOLTIPS.indexed}
                openTooltip={openTooltip}
                setOpenTooltip={setOpenTooltip}
                lastPointerTouchRef={lastPointerTouchRef}
              />
            </div>
            <Database size={18} className="stat-icon text-accent" />
          </div>
          <div className="stat-value">{stats.totalArtworks}</div>
          <span className="stat-sub">
            {stats.analyzedArtworkCount ?? 0} analiz edilmiş · {stats.pendingArtworkCount ?? 0} palet bekliyor
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-label-with-help">
              <span className="stat-label">Toplam Renk Kümesi</span>
              <MetricTooltip
                id="clusters"
                label="Toplam Renk Kümesi"
                description={STAT_TOOLTIPS.clusters}
                openTooltip={openTooltip}
                setOpenTooltip={setOpenTooltip}
                lastPointerTouchRef={lastPointerTouchRef}
              />
            </div>
            <Layers size={18} className="stat-icon text-accent" />
          </div>
          <div className="stat-value">{stats.totalColors}</div>
          <span className="stat-sub">K-Means++ ile Taranmış Vektör</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-label-with-help">
              <span className="stat-label">Kromatik Çeşitlilik</span>
              <MetricTooltip
                id="diversity"
                label="Kromatik Çeşitlilik"
                description={STAT_TOOLTIPS.diversity}
                openTooltip={openTooltip}
                setOpenTooltip={setOpenTooltip}
                lastPointerTouchRef={lastPointerTouchRef}
              />
            </div>
            <Sparkles size={18} className="stat-icon text-accent" />
          </div>
          <div className="stat-value">%{stats.avgDiversity}</div>
          <span className="stat-sub">Spektral Dağılım İndeksi</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-label-with-help">
              <span className="stat-label">Ağırlıklı Sıcaklık</span>
              <MetricTooltip
                id="temperature"
                label="Ağırlıklı Sıcaklık"
                description={STAT_TOOLTIPS.temperature}
                openTooltip={openTooltip}
                setOpenTooltip={setOpenTooltip}
                lastPointerTouchRef={lastPointerTouchRef}
              />
            </div>
            <Scale size={18} className="stat-icon text-accent" />
          </div>
          <div className="stat-value">{stats.dominantTemperature}</div>
          <span className="stat-sub">Koleksiyon Genel Eğilimi</span>
        </div>
      </div>

      {/* Detail Analytics Grid */}
      <div className="analytics-details-grid">
        {/* Left: Temperature Distribution */}
        <div className="analytic-box">
          <div className="box-header">
            <div className="box-title-group">
              <PieChart size={18} className="box-icon" />
              <h3>Göreli Sıcaklık Dağılımı (Görsel Yönelim)</h3>
            </div>
            <span className="box-badge">sRGB / HSL + CIELAB C*ab</span>
          </div>

          <p className="box-description">
            Eserlerdeki baskın renk kümelerinin HSL hue yönelimi ve CIELAB kroma (<code className="mono-inline">C*ab</code>)
            kapısı üzerinden hesaplanan ağırlıklı göreli sıcaklık dağılımı (fiziksel Kelvin değeri değildir).
          </p>

          {/* Visual Bar */}
          <div className="temperature-distribution-bar">
            {stats.warmPercent > 0 && (
              <div
                className="temp-bar-segment warm-segment"
                style={{ width: `${stats.warmPercent}%` }}
                title={`Sıcak yönelimli: %${stats.warmPercent}`}
              >
                <span>%{stats.warmPercent}</span>
              </div>
            )}
            {(stats.transitionalPercent ?? 0) > 0 && (
              <div
                className="temp-bar-segment transitional-segment"
                style={{ width: `${stats.transitionalPercent}%` }}
                title={`Dengeli / geçişli: %${stats.transitionalPercent}`}
              >
                <span>%{stats.transitionalPercent}</span>
              </div>
            )}
            {stats.coolPercent > 0 && (
              <div
                className="temp-bar-segment cool-segment"
                style={{ width: `${stats.coolPercent}%` }}
                title={`Soğuk yönelimli: %${stats.coolPercent}`}
              >
                <span>%{stats.coolPercent}</span>
              </div>
            )}
            {stats.neutralPercent > 0 && (
              <div
                className="temp-bar-segment neutral-segment"
                style={{ width: `${stats.neutralPercent}%` }}
                title={`Nötr ağırlıklı: %${stats.neutralPercent}`}
              >
                <span>%{stats.neutralPercent}</span>
              </div>
            )}
          </div>

          {/* Temperature Legend Cards */}
          <div className="temp-cards-row temp-cards-four">
            <div className="temp-indicator-card warm">
              <div className="indicator-top">
                <Flame size={16} />
                <span className="indicator-title">Sıcak Yönelimli</span>
              </div>
              <div className="indicator-val">%{stats.warmPercent}</div>
              <span className="indicator-count">{stats.warmCount} eser</span>
            </div>

            <div className="temp-indicator-card transitional">
              <div className="indicator-top">
                <Scale size={16} />
                <span className="indicator-title">Dengeli / Geçişli</span>
              </div>
              <div className="indicator-val">%{stats.transitionalPercent ?? 0}</div>
              <span className="indicator-count">{stats.transitionalCount ?? 0} eser</span>
            </div>

            <div className="temp-indicator-card cool">
              <div className="indicator-top">
                <Snowflake size={16} />
                <span className="indicator-title">Soğuk Yönelimli</span>
              </div>
              <div className="indicator-val">%{stats.coolPercent}</div>
              <span className="indicator-count">{stats.coolCount} eser</span>
            </div>

            <div className="temp-indicator-card neutral">
              <div className="indicator-top">
                <Scale size={16} />
                <span className="indicator-title">Nötr Ağırlıklı</span>
              </div>
              <div className="indicator-val">%{stats.neutralPercent}</div>
              <span className="indicator-count">{stats.neutralCount} eser</span>
            </div>
          </div>

          {(stats.analyzedArtworkCount ?? 0) > 0 && (
            <div className="stats-weighted-note">
              <strong>
                Piksel Analizi Tamamlanmış {stats.analyzedArtworkCount} Eserin Ortalama Payı:
              </strong>{' '}
              %{stats.weightedWarmSharePercent ?? 0} sıcak · %
              {stats.weightedTransitionalSharePercent ?? 0} geçişli · %
              {stats.weightedCoolSharePercent ?? 0} soğuk · %
              {stats.weightedNeutralSharePercent ?? 0} nötr
              {typeof stats.avgWarmthScore === 'number' &&
                ` · Ortalama Kromatik Skor: ${stats.avgWarmthScore}/100`}
              {(stats.pendingArtworkCount ?? 0) > 0 &&
                ` · Paleti bekleyen ${stats.pendingArtworkCount} eser sıcaklık hesabına katılmadı.`}
            </div>
          )}
        </div>

        {/* Right: Top Dominant Color Families */}
        <div className="analytic-box">
          <div className="box-header">
            <div className="box-title-group">
              <BarChart3 size={18} className="box-icon" />
              <h3>En Baskın Renk Aileleri</h3>
            </div>
            <span className="box-badge">Frekans Sıralaması</span>
          </div>

          <p className="box-description">
            Koleksiyonda yer alan eserlerin baskın renkleri arasındaki en yaygın spektral renk aileleri ve toplam mevcudiyetleri.
          </p>

          <div className="color-families-list">
            {stats.topFamilies.map((fam, idx) => {
              const maxCount = stats.topFamilies[0]?.count || 1;
              const fillPct = Math.round((fam.count / maxCount) * 100);

              return (
                <div key={idx} className="family-row">
                  <div className="family-row-left">
                    <span className="family-swatch" style={{ backgroundColor: fam.color }} />
                    <span className="family-name">{fam.family}</span>
                  </div>

                  <div className="family-bar-container">
                    <div
                      className="family-bar-fill"
                      style={{
                        width: `${fillPct}%`,
                        backgroundColor: fam.color
                      }}
                    />
                  </div>

                  <div className="family-row-right">
                    <span className="family-count">{fam.count} küme</span>
                    <span className="family-pct font-semibold">%{fam.percent}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="analytics-footer-grid analytics-footer-single">
        <div className="category-tax-card">
          <h4 className="card-subtitle">Koleksiyon Dönem ve Tür Dağılımı</h4>
          <div className="category-tags-wrap">
            {categoryBreakdown.map(([cat, count]) => (
              <div key={cat} className="category-pill-stat">
                <span className="cat-name">{cat}</span>
                <span className="cat-badge">{count} Eser</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
