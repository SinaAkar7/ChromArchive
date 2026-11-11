/**
 * @file src/components/ArchiveGallery.tsx
 * @description Açık erişimli sanat ve fotoğraf arşivi, arama, filtreleme ve galeri listeleme bileşeni.
 */

import React, { useMemo } from 'react';
import { ArtworkMetadata } from '../types';

interface ArchiveGalleryProps {
  items: ArtworkMetadata[];
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  temperatureFilter: string;
  onTemperatureFilterChange: (temp: string) => void;
  onInspectArtwork: (item: ArtworkMetadata) => void;
}

export const ArchiveGallery: React.FC<ArchiveGalleryProps> = ({
  items,
  searchQuery,
  onSearchQueryChange,
  categoryFilter,
  onCategoryFilterChange,
  temperatureFilter,
  onTemperatureFilterChange,
  onInspectArtwork,
}) => {
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return items.filter((item) => {
      // Metin sorgusu
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.artist.toLowerCase().includes(q) ||
        (item.period && item.period.toLowerCase().includes(q)) ||
        (item.institution && item.institution.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.dominantColors?.some(
          (c) =>
            c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q)
        );

      // Kategori filtresi
      let matchesCategory = true;
      if (categoryFilter !== 'all') {
        matchesCategory =
          item.dominantColors?.some(
            (c) => c.family.toLowerCase() === categoryFilter.toLowerCase()
          ) ?? false;
      }

      // Sıcaklık filtresi
      let matchesTemp = true;
      if (temperatureFilter !== 'all') {
        const overall = (item.overallTemperature || '').toLowerCase();
        matchesTemp =
          overall.includes(temperatureFilter.toLowerCase()) ||
          (item.dominantColors?.some((c) =>
            c.temperature.toLowerCase().includes(temperatureFilter.toLowerCase())
          ) ??
            false);
      }

      return matchesQuery && matchesCategory && matchesTemp;
    });
  }, [items, searchQuery, categoryFilter, temperatureFilter]);

  return (
    <section id="archive" className="app-section active">
      <div className="container">
        <div className="section-header">
          <span className="section-kicker">Küratöryel Koleksiyon</span>
          <h2 className="section-title">Dijital Görsel Arşivi</h2>
          <p className="section-description">
            Açık erişimli müze koleksiyonlarından ve kullanıcı yüklemelerinden
            oluşan, K-Means renk özelliklerine göre indekslenmiş kalıcı dijital
            görsel arşivi.
          </p>
        </div>

        {/* Filtre ve Arama Çubuğu */}
        <div className="archive-controls-bar">
          <div className="archive-search-box">
            <svg
              className="search-icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              id="archiveSearchInput"
              className="archive-search-input"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Eser adı, sanatçı, akım veya renk ara..."
            />
          </div>

          <div className="archive-filters-group">
            <select
              id="archiveCategorySelect"
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
            >
              <option value="all">Tüm Renk Aileleri</option>
              <option value="Mavi">Mavi Tonları</option>
              <option value="Sarı">Sarı & Altın</option>
              <option value="Yeşil">Yeşil Tonları</option>
              <option value="Kırmızı">Kırmızı & Bordo</option>
              <option value="Turuncu">Turuncu & Toprak</option>
              <option value="Nötr">Nötr Tonlar</option>
            </select>

            <select
              id="archiveTempSelect"
              className="filter-select"
              value={temperatureFilter}
              onChange={(e) => onTemperatureFilterChange(e.target.value)}
            >
              <option value="all">Tüm Sıcaklıklar</option>
              <option value="Sıcak">Sıcak Tonlar</option>
              <option value="Soğuk">Soğuk Tonlar</option>
              <option value="Dengeli">Dengeli / Nötr</option>
            </select>

            <span className="archive-count-info" id="archiveResultsCount">
              {filteredItems.length} eser listeleniyor
            </span>
          </div>
        </div>

        {/* Galeri Izgarası */}
        <div className="archive-gallery-grid" id="archiveGalleryGrid">
          {filteredItems.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '3rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <p
                style={{
                  fontSize: '1.125rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                }}
              >
                Arama kriterlerine uygun eser bulunamadı.
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                }}
              >
                Lütfen filtreleri sıfırlayın veya farklı bir anahtar kelime
                deneyin.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="archive-card" data-id={item.id}>
                <div className="archive-card-image-box">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="archive-card-img"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f0ebe1'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-family='serif' font-size='18'>${encodeURIComponent(
                        item.title
                      )}</text></svg>`;
                    }}
                  />
                </div>

                <div className="archive-card-palette-strip">
                  {item.dominantColors?.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        flex: c.percentage,
                        backgroundColor: c.hex,
                      }}
                      title={`${c.name} (%${c.percentage})`}
                    />
                  ))}
                </div>

                <div className="archive-card-content">
                  <div className="archive-card-meta-line">
                    <span>{item.period || 'Müze Koleksiyonu'}</span>
                    <span>·</span>
                    <span>{item.date}</span>
                  </div>
                  <h3 className="archive-card-title">{item.title}</h3>
                  <p className="archive-card-artist">{item.artist}</p>

                  <div className="archive-card-palette-details">
                    {item.dominantColors?.map((c, i) => (
                      <div
                        key={i}
                        className="mini-swatch"
                        style={{ backgroundColor: c.hex }}
                        title={`${c.hex} - ${c.name}`}
                      />
                    ))}
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginLeft: 'auto',
                      }}
                    >
                      {item.overallTemperature}
                    </span>
                  </div>

                  <div className="archive-card-footer">
                    <button
                      type="button"
                      className="btn-view-detail"
                      onClick={() => onInspectArtwork(item)}
                    >
                      <span>Detayları İncele</span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
