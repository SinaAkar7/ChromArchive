/**
 * @file src/components/ArchiveGallery.tsx
 * @description Açık erişimli sanat ve fotoğraf arşivi, arama, filtreleme ve galeri listeleme bileşeni.
 */

import React, { useMemo, useState } from 'react';
import { ArtworkMetadata, ColorMeaningEntry } from '../types';
import { ColorMeaningModal } from './ColorMeaningModal';
import { ColorMeaningsGrid } from './ColorMeaningsGrid';
import { getColorMeanings } from '../services/colorMeaningsService';

interface ArchiveGalleryProps {
  items: ArtworkMetadata[];
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  temperatureFilter: string;
  onTemperatureFilterChange: (temp: string) => void;
  onInspectArtwork: (item: ArtworkMetadata) => void;
  onAnalyzeArtwork?: (item: ArtworkMetadata) => void;
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
  onAnalyzeArtwork,
}) => {
  const [artistFilter, setArtistFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [archiveSubView, setArchiveSubView] = useState<'artworks' | 'meanings'>('artworks');
  const [selectedColorMeaning, setSelectedColorMeaning] = useState<ColorMeaningEntry | null>(null);
  const [isColorModalOpen, setIsColorModalOpen] = useState<boolean>(false);

  const colorMeaningsList = useMemo(() => getColorMeanings(), []);

  const handleOpenColorMeaning = (entry: ColorMeaningEntry) => {
    setSelectedColorMeaning(entry);
    setIsColorModalOpen(true);
  };

  const handleFilterByColorMeaning = (colorNameTr: string) => {
    onCategoryFilterChange(colorNameTr);
    setArchiveSubView('artworks');
  };

  const uniqueArtists = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.artist && item.artist !== 'Unknown Artist') set.add(item.artist);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [items]);

  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.department) set.add(item.department);
      else if (item.period) set.add(item.period);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return items.filter((item) => {
      // Metin sorgusu
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.artist.toLowerCase().includes(q) ||
        (item.period && item.period.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q)) ||
        (item.institution && item.institution.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.dominantColors?.some(
          (c) =>
            c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q)
        );

      // Sanatçı filtresi
      if (artistFilter !== 'all' && item.artist !== artistFilter) {
        return false;
      }

      // Departman / Dönem filtresi
      if (departmentFilter !== 'all') {
        const matchesDept =
          item.department === departmentFilter || item.period === departmentFilter;
        if (!matchesDept) return false;
      }

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
  }, [items, searchQuery, categoryFilter, temperatureFilter, artistFilter, departmentFilter]);

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

        {/* Arşiv Görünüm Sekmeleri: Eserler Kataloğu & Renk Anlamları */}
        <div
          style={{
            display: 'flex',
            gap: '0.625rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-light, #e8e2d8)',
            paddingBottom: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={() => setArchiveSubView('artworks')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '6px',
              border: archiveSubView === 'artworks' ? '1px solid var(--color-primary, #1e3a5f)' : '1px solid var(--border-light, #ddd)',
              backgroundColor: archiveSubView === 'artworks' ? 'var(--color-primary, #1e3a5f)' : '#ffffff',
              color: archiveSubView === 'artworks' ? '#ffffff' : 'var(--text-secondary, #555)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Sanat Eserleri Kataloğu</span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '10px',
                backgroundColor: archiveSubView === 'artworks' ? 'rgba(255,255,255,0.2)' : 'var(--bg-warm, #f0ebe1)',
                color: archiveSubView === 'artworks' ? '#ffffff' : 'var(--text-secondary, #666)'
              }}
            >
              {filteredItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setArchiveSubView('meanings')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '6px',
              border: archiveSubView === 'meanings' ? '1px solid var(--color-primary, #1e3a5f)' : '1px solid var(--border-light, #ddd)',
              backgroundColor: archiveSubView === 'meanings' ? 'var(--color-primary, #1e3a5f)' : '#ffffff',
              color: archiveSubView === 'meanings' ? '#ffffff' : 'var(--text-secondary, #555)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Renk Aileleri & Kültürel Anlamlar</span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '10px',
                backgroundColor: archiveSubView === 'meanings' ? 'rgba(255,255,255,0.2)' : 'var(--bg-warm, #f0ebe1)',
                color: archiveSubView === 'meanings' ? '#ffffff' : 'var(--text-secondary, #666)'
              }}
            >
              10 Renk
            </span>
          </button>
        </div>

        {archiveSubView === 'meanings' ? (
          <div>
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-light, #e8e2d8)',
                borderRadius: 'var(--radius-md, 8px)',
                marginBottom: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-primary, #1e3a5f)'
                  }}
                >
                  Kromatik Miras & Kaynaklandırılmış Kültür Veritabanı
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #555)', margin: 0, lineHeight: 1.55 }}>
                Bu arşiv bölümü; ana renk aileleri için tarihsel pigment bilgilerini, National Gallery of Art ve akademik kaynaklarla
                belgelenmiş kültürel anlamları ve modern tasarım kullanım alanlarını sunar. Renk anlamları evrensel veya değişmez
                kabul edilmez; her anlam kaynaklandırılmış bağlamıyla ele alınır.
              </p>
            </div>

            <ColorMeaningsGrid
              onInspectColor={handleOpenColorMeaning}
              onFilterByColor={handleFilterByColorMeaning}
            />
          </div>
        ) : (
          <>
            {/* Hızlı Renk Filtre Şeridi */}
            <div
              style={{
                display: 'flex',
                gap: '0.4rem',
                alignItems: 'center',
                overflowX: 'auto',
                padding: '0.35rem 0 0.85rem 0',
                marginBottom: '0.5rem'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #777)', whiteSpace: 'nowrap', marginRight: '0.25rem' }}>
                Renk Ailesi Filtresi & Kültürel Bilgi:
              </span>
              {colorMeaningsList.map((cm) => {
                const isSelected = categoryFilter.toLowerCase() === cm.name.tr.toLowerCase();
                return (
                  <div
                    key={cm.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: isSelected ? 'var(--color-primary, #1e3a5f)' : '#ffffff',
                      color: isSelected ? '#ffffff' : 'var(--text-primary, #232529)',
                      borderRadius: '16px',
                      padding: '0.2rem 0.35rem 0.2rem 0.55rem',
                      fontSize: '0.75rem',
                      gap: '0.35rem',
                      border: isSelected ? '1px solid var(--color-primary, #1e3a5f)' : '1px solid var(--border-light, #e0d8cc)',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}
                  >
                    <span
                      style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        backgroundColor: cm.displayHex,
                        cursor: 'pointer'
                      }}
                      onClick={() => onCategoryFilterChange(isSelected ? 'all' : cm.name.tr)}
                    />
                    <span
                      style={{ cursor: 'pointer', fontWeight: 500 }}
                      onClick={() => onCategoryFilterChange(isSelected ? 'all' : cm.name.tr)}
                      title={`${cm.name.tr} tonundaki eserleri filtrele`}
                    >
                      {cm.name.tr}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenColorMeaning(cm);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.1rem',
                        color: isSelected ? '#ffffff' : 'var(--text-muted, #888)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={`${cm.name.tr} (${cm.name.en}) tarihsel pigment ve kültürel anlam detayını aç`}
                      aria-label={`${cm.name.tr} renk detayını aç`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </button>
                  </div>
                );
              })}
              {categoryFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => onCategoryFilterChange('all')}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-accent, #c9702c)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    whiteSpace: 'nowrap',
                    fontWeight: 600
                  }}
                >
                  Filtreyi Temizle
                </button>
              )}
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
              id="archiveArtistSelect"
              className="filter-select"
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value)}
              title="Sanatçıya Göre Filtrele"
            >
              <option value="all">Tüm Sanatçılar ({uniqueArtists.length})</option>
              {uniqueArtists.map((artist) => (
                <option key={artist} value={artist}>
                  {artist}
                </option>
              ))}
            </select>

            <select
              id="archiveDeptSelect"
              className="filter-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              title="Dönem ve Departmana Göre Filtrele"
            >
              <option value="all">Tüm Dönem / Departmanlar</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

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
                <div
                  className="archive-card-image-box"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onInspectArtwork(item)}
                  title="Detayları incelemek için tıklayın"
                >
                  <img
                    src={item.thumbnailUrl || item.imageUrl}
                    alt={item.title}
                    className="archive-card-img"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      // Fallback to primary imageUrl if thumbnailUrl failed
                      if (item.imageUrl && target.src !== item.imageUrl) {
                        target.src = item.imageUrl;
                        return;
                      }
                      target.onerror = null;
                      target.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f0ebe1'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-family='serif' font-size='16'>${encodeURIComponent(
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
                    <span>{item.department || item.period || 'Müze Koleksiyonu'}</span>
                    <span>·</span>
                    <span>{item.date}</span>
                  </div>
                  <h3
                    className="archive-card-title"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onInspectArtwork(item)}
                  >
                    {item.title}
                  </h3>
                  <p className="archive-card-artist">{item.artist}</p>

                  <div className="archive-card-palette-details">
                    {item.dominantColors && item.dominantColors.length > 0 ? (
                      <>
                        {item.dominantColors.map((c, i) => (
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
                      </>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        Açık Erişim · The Met
                      </span>
                    )}
                  </div>

                  <div className="archive-card-footer" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-view-detail"
                      style={{ flex: 1, minWidth: '95px' }}
                      onClick={() => onInspectArtwork(item)}
                    >
                      <span>Detaylar</span>
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
                    {onAnalyzeArtwork && (
                      <button
                        type="button"
                        className="btn-view-detail"
                        style={{
                          flex: 1,
                          minWidth: '105px',
                          backgroundColor: 'var(--color-primary, #1e3a5f)',
                          color: '#ffffff',
                          borderColor: 'var(--color-primary, #1e3a5f)'
                        }}
                        onClick={() => onAnalyzeArtwork(item)}
                        title="Bu eseri Canvas piksel renk analizine aktar"
                      >
                        <span>Renk Analizi</span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="m4.93 4.93 4.24 4.24" />
                          <path d="m14.83 9.17 4.24-4.24" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
          </>
        )}

        {/* Renk Ailesi Kültürel Anlam & Pigment Tarihçesi Detay Modalı */}
        <ColorMeaningModal
          color={selectedColorMeaning}
          isOpen={isColorModalOpen}
          onClose={() => setIsColorModalOpen(false)}
          onSelectColor={(c) => setSelectedColorMeaning(c)}
          onFilterArchiveByColor={handleFilterByColorMeaning}
        />
      </div>
    </section>
  );
};
