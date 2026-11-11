/**
 * @file Statistics.tsx
 * @description Curatorial chromatic statistics and analytic overview for ChromArchive.
 * Displays aggregate metrics across the digital archive including temperature distribution,
 * dominant color families, and collection diversity scores.
 */

import React, { useMemo } from 'react';
import { BarChart3, PieChart, Flame, Snowflake, Scale, Layers, Sparkles, Database } from 'lucide-react';
import type { ArtworkMetadata } from '../types';
import { calculateArchiveStatistics } from '../services/archiveService';

interface StatisticsProps {
  archiveItems: ArtworkMetadata[];
  onSelectArtwork?: (artwork: ArtworkMetadata) => void;
}

export const Statistics: React.FC<StatisticsProps> = ({ archiveItems }) => {
  const stats = useMemo(() => calculateArchiveStatistics(archiveItems), [archiveItems]);

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
            <span className="stat-label">İndekslenen Eser</span>
            <Database size={18} className="stat-icon text-accent" />
          </div>
          <div className="stat-value">{stats.totalArtworks}</div>
          <span className="stat-sub">Müze & Açık Erişim Kaydı</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Toplam Renk Kümesi</span>
            <Layers size={18} className="stat-icon text-accent" />
          </div>
          <div className="stat-value">{stats.totalColors}</div>
          <span className="stat-sub">K-Means++ ile Taranmış Vektör</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Kromatik Çeşitlilik</span>
            <Sparkles size={18} className="stat-icon text-accent" />
          </div>
          <div className="stat-value">%{stats.avgDiversity}</div>
          <span className="stat-sub">Spektral Dağılım İndeksi</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Ağırlıklı Sıcaklık</span>
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
              <h3>Sıcaklık Dağılımı (Kromatik Termal Denge)</h3>
            </div>
            <span className="box-badge">Algısal Termal Model</span>
          </div>

          <p className="box-description">
            Eserlerdeki renklerin HSV renk dairesi üzerindeki açılarına göre yapılan sınıflandırmada
            sıcak tonlar (kırmızı, turuncu, sarı), soğuk tonlar (mavi, camgöbeği, mor) ve nötr tonlar (gri, bej, siyah, beyaz).
          </p>

          {/* Visual Bar */}
          <div className="temperature-distribution-bar">
            {stats.warmPercent > 0 && (
              <div
                className="temp-bar-segment warm-segment"
                style={{ width: `${stats.warmPercent}%` }}
                title={`Sıcak: %${stats.warmPercent}`}
              >
                <span>%{stats.warmPercent}</span>
              </div>
            )}
            {stats.coolPercent > 0 && (
              <div
                className="temp-bar-segment cool-segment"
                style={{ width: `${stats.coolPercent}%` }}
                title={`Soğuk: %${stats.coolPercent}`}
              >
                <span>%{stats.coolPercent}</span>
              </div>
            )}
            {stats.neutralPercent > 0 && (
              <div
                className="temp-bar-segment neutral-segment"
                style={{ width: `${stats.neutralPercent}%` }}
                title={`Nötr: %${stats.neutralPercent}`}
              >
                <span>%{stats.neutralPercent}</span>
              </div>
            )}
          </div>

          {/* Temperature Legend Cards */}
          <div className="temp-cards-row">
            <div className="temp-indicator-card warm">
              <div className="indicator-top">
                <Flame size={16} />
                <span className="indicator-title">Sıcak Tonlar</span>
              </div>
              <div className="indicator-val">%{stats.warmPercent}</div>
              <span className="indicator-count">{stats.warmCount} eser</span>
            </div>

            <div className="temp-indicator-card cool">
              <div className="indicator-top">
                <Snowflake size={16} />
                <span className="indicator-title">Soğuk Tonlar</span>
              </div>
              <div className="indicator-val">%{stats.coolPercent}</div>
              <span className="indicator-count">{stats.coolCount} eser</span>
            </div>

            <div className="temp-indicator-card neutral">
              <div className="indicator-top">
                <Scale size={16} />
                <span className="indicator-title">Nötr Tonlar</span>
              </div>
              <div className="indicator-val">%{stats.neutralPercent}</div>
              <span className="indicator-count">{stats.neutralCount} eser</span>
            </div>
          </div>
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

      {/* Category Breakdown & Curatorial Note */}
      <div className="analytics-footer-grid">
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

        <div className="methodology-note-card">
          <h4 className="card-subtitle">Bilimsel Analiz Yöntemi</h4>
          <p className="note-text">
            ChromArchive renk analizinde görsel pikselleri tarayıcı belleğindeki HTML5 Canvas üzerinde 300×300 çözünürlüğe ölçeklenerek örneklenir.
            K-Means++ kümeleme algoritması insan görme sisteminin renk algısına göre optimize edilmiş ağırlıklı Öklid metriği
            (<code className="mono-inline">2ΔR² + 4ΔG² + 3ΔB²</code>) kullanarak 5 ila 8 baskın renk vektörünü belirler.
            Tüm hesaplamalar kullanıcının cihazında istemci taraflı gerçekleşir ve hiçbir harici API bağımlılığı gerektirmez.
          </p>
        </div>
      </div>
    </div>
  );
};
