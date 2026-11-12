/**
 * @file ArtworkModal.tsx
 * @description Curatorial detail modal for inspecting museum artwork records,
 * rich metadata conforming to The Met Open Access standard, and color distributions.
 */

import React, { useEffect, useCallback } from 'react';
import {
  X,
  ExternalLink,
  Download,
  Copy,
  Calendar,
  Layers,
  Palette,
  Maximize2,
  FileJson,
  ShieldCheck,
  Building2
} from 'lucide-react';
import type { ArtworkMetadata, ColorMeaningEntry } from '../types';
import { exportMetadataAsJson } from '../services/archiveService';
import { ColorMeaningModal } from './ColorMeaningModal';
import { getColorMeaningByQuery } from '../services/colorMeaningsService';

interface ArtworkModalProps {
  artwork: ArtworkMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  onCopyColor: (hex: string) => void;
  onLoadIntoAnalyzer?: (artwork: ArtworkMetadata) => void;
}

export const ArtworkModal: React.FC<ArtworkModalProps> = ({
  artwork,
  isOpen,
  onClose,
  onCopyColor,
  onLoadIntoAnalyzer
}) => {
  const [meaningColor, setMeaningColor] = React.useState<ColorMeaningEntry | null>(null);

  // ESC key to close modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !artwork) {
    return null;
  }

  const handleDownloadJson = () => {
    exportMetadataAsJson(artwork);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-titles">
            <span className="modal-category-tag">{artwork.category || 'Müze Arşivi'}</span>
            <h2 className="modal-artwork-title">{artwork.title}</h2>
            <div className="modal-artist-subtitle">
              <span className="artist-bold">{artwork.artist}</span>
              <span className="artist-dates">{artwork.year}</span>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Pencereyi Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-scrollable">
          <div className="modal-grid-layout">
            {/* Left Column: Image & Color Bars */}
            <div className="modal-image-col">
              <div className="modal-image-wrapper">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="modal-image-preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect fill="%23232529" width="600" height="400"/><text fill="%23EAE5D9" x="50%" y="50%" text-anchor="middle" font-family="serif">Görsel Yüklenemedi</text></svg>';
                  }}
                />
              </div>

              {/* Proportional Chromatic Bar */}
              {/* Proportional Chromatic Bar & Swatches */}
              {artwork.dominantColors && artwork.dominantColors.length > 0 ? (
                <>
                  <div className="modal-color-strip-container">
                    <div className="strip-title">
                      <Palette size={14} />
                      <span>Kromatik Spektrum Dağılımı</span>
                    </div>
                    <div className="modal-proportional-bar">
                      {artwork.dominantColors.map((color, idx) => (
                        <div
                          key={idx}
                          className="modal-bar-segment"
                          style={{
                            backgroundColor: color.hex,
                            width: `${color.percentage}%`
                          }}
                          title={`${color.name || color.hex}: %${color.percentage}`}
                          onClick={() => onCopyColor(color.hex)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="modal-swatches-grid">
                    {artwork.dominantColors.map((col, idx) => {
                      const meaning = getColorMeaningByQuery(col.family || col.name);
                      return (
                        <div
                          key={idx}
                          className="modal-swatch-card"
                          onClick={() => onCopyColor(col.hex)}
                          title="HEX Kodunu Kopyala"
                        >
                          <div className="modal-swatch-box" style={{ backgroundColor: col.hex }} />
                          <div className="modal-swatch-details">
                            <div className="modal-swatch-hex mono-font">{col.hex}</div>
                            <div className="modal-swatch-sub">
                              <span>%{col.percentage}</span>
                              <span className="swatch-temperature">{col.temperature}</span>
                            </div>
                            {col.name && (
                              <div className="modal-swatch-name">{col.name}</div>
                            )}
                            {meaning && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMeaningColor(meaning);
                                }}
                                style={{
                                  marginTop: '0.2rem',
                                  fontSize: '0.65rem',
                                  color: 'var(--color-primary, #1e3a5f)',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  padding: 0,
                                  textAlign: 'left'
                                }}
                                title={`${meaning.name.tr} (${meaning.name.en}) kültürel anlam ve tarihçesini incele`}
                              >
                                {meaning.name.tr} Anlamı →
                              </button>
                            )}
                          </div>
                          <Copy size={12} className="copy-hint-icon" />
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-surface, #ffffff)',
                  border: '1px solid var(--border-light, #e5e0d8)',
                  borderRadius: 'var(--radius-md, 8px)',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #666)', marginBottom: '0.75rem' }}>
                    Bu açık erişimli başyapıtın kromatik paletini Canvas K-Means++ piksel kümeleme motoruyla anında çıkarabilirsiniz.
                  </p>
                  {onLoadIntoAnalyzer && (
                    <button
                      type="button"
                      className="modal-action-btn secondary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => {
                        onLoadIntoAnalyzer(artwork);
                        onClose();
                      }}
                    >
                      <Palette size={14} />
                      <span>Gerçek Piksel Renk Analizini Başlat</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Metadata & Curatorial Notes */}
            <div className="modal-meta-col">
              <div className="meta-card-block">
                <h3 className="block-title">
                  <Layers size={16} />
                  <span>Küratöryel Bilgiler</span>
                </h3>

                <dl className="metadata-definition-list">
                  <div className="meta-item">
                    <dt>Sanatçı / Yaratıcı</dt>
                    <dd>{artwork.artist}</dd>
                  </div>

                  <div className="meta-item">
                    <dt>Tarih / Dönem</dt>
                    <dd>
                      {artwork.year} {artwork.period ? `(${artwork.period})` : ''}
                    </dd>
                  </div>

                  <div className="meta-item">
                    <dt>Kültür / Coğrafya</dt>
                    <dd>{artwork.culture || 'Avrupa Sanatı'}</dd>
                  </div>

                  <div className="meta-item">
                    <dt>Teknik & Malzeme</dt>
                    <dd>{artwork.medium || 'Tuval üzerine yağlıboya'}</dd>
                  </div>

                  <div className="meta-item">
                    <dt>Boyutlar</dt>
                    <dd>{artwork.dimensions || 'Müze standart kayıtları'}</dd>
                  </div>

                  <div className="meta-item">
                    <dt>Kurum / Koleksiyon</dt>
                    <dd className="institution-entry">
                      <Building2 size={13} className="inline-meta-icon" />
                      <span>{artwork.institution || 'Açık Erişim Dijital Arşivi'}</span>
                    </dd>
                  </div>

                  <div className="meta-item">
                    <dt>Envanter No (Accession)</dt>
                    <dd className="mono-font">{artwork.accessionNumber || 'N/A'}</dd>
                  </div>

                  <div className="meta-item">
                    <dt>Telif & Lisans</dt>
                    <dd className="license-tag">
                      <ShieldCheck size={13} className="inline-meta-icon text-success" />
                      <span>{artwork.rights || 'Kamu Malı (Public Domain / CC0)'}</span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Description & Curatorial text */}
              {artwork.description && (
                <div className="meta-card-block">
                  <h3 className="block-title">Eser Hakkında</h3>
                  <p className="curatorial-description">{artwork.description}</p>
                </div>
              )}

              {/* Tags */}
              {artwork.tags && artwork.tags.length > 0 && (
                <div className="meta-card-block">
                  <h3 className="block-title">Küratöryel Etiketler</h3>
                  <div className="tags-container">
                    {artwork.tags.map((tag, i) => (
                      <span key={i} className="meta-tag-pill">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="modal-actions-container">
                <button
                  type="button"
                  className="modal-action-btn primary"
                  onClick={handleDownloadJson}
                >
                  <FileJson size={16} />
                  <span>Metadata JSON İndir</span>
                </button>

                {onLoadIntoAnalyzer && (
                  <button
                    type="button"
                    className="modal-action-btn secondary"
                    onClick={() => {
                      onLoadIntoAnalyzer(artwork);
                      onClose();
                    }}
                  >
                    <Maximize2 size={16} />
                    <span>Analizörde Aç</span>
                  </button>
                )}

                {artwork.museumUrl && (
                  <a
                    href={artwork.museumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-action-btn tertiary"
                  >
                    <ExternalLink size={16} />
                    <span>Müze Kaynağı</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Renk Ailesi Kültürel Anlam & Tarihçe Modalı */}
      <ColorMeaningModal
        color={meaningColor}
        isOpen={!!meaningColor}
        onClose={() => setMeaningColor(null)}
      />
    </div>
  );
};
