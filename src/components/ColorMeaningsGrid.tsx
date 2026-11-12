/**
 * @file src/components/ColorMeaningsGrid.tsx
 * @description Renk arşivinde ana renk ailelerini (10 renk) kartlar halinde listeleyen,
 * tarihsel pigmentleri, kültürel anlamları ve kaynakları gösteren galeri bileşeni.
 */

import React from 'react';
import {
  BookOpen,
  ArrowRight,
  Info,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ColorMeaningEntry } from '../types';
import {
  getColorMeanings,
  getSourcesForIds
} from '../services/colorMeaningsService';

interface ColorMeaningsGridProps {
  onInspectColor: (color: ColorMeaningEntry) => void;
  onFilterByColor?: (colorNameTr: string) => void;
}

export const ColorMeaningsGrid: React.FC<ColorMeaningsGridProps> = ({
  onInspectColor,
  onFilterByColor
}) => {
  const colors = getColorMeanings();

  const getFamilyBadge = (family: string) => {
    switch (family) {
      case 'warm':
        return { label: 'Sıcak (Warm)', bg: '#fdf2e9', color: '#b9770e' };
      case 'cool':
        return { label: 'Soğuk (Cool)', bg: '#ebf5fb', color: '#2471a3' };
      case 'neutral':
        return { label: 'Nötr (Neutral)', bg: '#f2f3f4', color: '#566573' };
      case 'earth':
        return { label: 'Toprak (Earth)', bg: '#f6f2ec', color: '#795548' };
      case 'mixed':
        return { label: 'Karma (Mixed)', bg: '#f4ecf7', color: '#7d3c98' };
      default:
        return { label: 'Renk Ailesi', bg: '#f4efe6', color: '#555555' };
    }
  };

  return (
    <div className="color-meanings-grid-container" style={{ marginTop: '1rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {colors.map((color) => {
          const badge = getFamilyBadge(color.family);
          const hasDocumented =
            Array.isArray(color.documentedMeanings) &&
            color.documentedMeanings.length > 0 &&
            color.documentedMeanings.some((m) => m.meanings && m.meanings.length > 0);

          // İlk tarihsel pigment bilgisi özeti
          const firstHist = color.historicalContext?.[0];

          return (
            <article
              key={color.id}
              className="archive-card color-meaning-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'var(--radius-md, 8px)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-light, #e8e2d8)',
                boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              {/* Renk Üst Şeridi */}
              <div
                style={{
                  height: '80px',
                  backgroundColor: color.displayHex,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '0.625rem 0.875rem',
                  boxShadow: 'inset 0 -1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#1a1a1a',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px'
                  }}
                >
                  {color.displayHex}
                </span>

                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    backgroundColor: badge.bg,
                    color: badge.color
                  }}
                >
                  {badge.label}
                </span>
              </div>

              {/* Kart İçeriği */}
              <div
                style={{
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  gap: '0.75rem'
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: '0 0 0.25rem 0',
                      fontSize: '1.25rem',
                      fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
                      color: 'var(--text-primary, #232529)',
                      cursor: 'pointer'
                    }}
                    onClick={() => onInspectColor(color)}
                  >
                    {color.name.tr}{' '}
                    <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary, #666)' }}>
                      / {color.name.en}
                    </span>
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      color: 'var(--text-secondary, #555)',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {color.description}
                  </p>
                </div>

                {/* Tarihsel Pigment İpucu */}
                {firstHist && (
                  <div
                    style={{
                      padding: '0.5rem 0.65rem',
                      backgroundColor: 'var(--bg-warm, #faf7f2)',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${color.displayHex}`,
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary, #555)',
                      lineHeight: 1.45
                    }}
                  >
                    <strong style={{ color: 'var(--text-primary, #232529)' }}>
                      {firstHist.period}:
                    </strong>{' '}
                    {firstHist.detail}
                  </div>
                )}

                {/* Kültürel Anlamlar (Rule 6: Boşsa gizle, asla bilgi uydurma) */}
                {hasDocumented && (
                  <div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--text-muted, #777)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '0.35rem'
                      }}
                    >
                      Belgelenmiş Çağrışımlar:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {color.documentedMeanings[0]?.meanings.slice(0, 4).map((meaning, mIdx) => (
                        <span
                          key={mIdx}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '10px',
                            backgroundColor: 'var(--bg-warm, #f0ebe1)',
                            color: 'var(--color-primary, #1e3a5f)',
                            fontWeight: 500
                          }}
                        >
                          {meaning}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Butonlar */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-light, #ebe5db)',
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <button
                    type="button"
                    className="btn-view-detail"
                    style={{ flex: 1, minWidth: '120px' }}
                    onClick={() => onInspectColor(color)}
                    title="Tarihsel pigment, kültürel anlam ve kaynakları incele"
                  >
                    <Info size={13} />
                    <span>Detay & Tarihçe</span>
                  </button>

                  {onFilterByColor && (
                    <button
                      type="button"
                      className="btn-view-detail"
                      style={{
                        flex: 1,
                        minWidth: '110px',
                        backgroundColor: 'var(--color-primary, #1e3a5f)',
                        color: '#ffffff',
                        borderColor: 'var(--color-primary, #1e3a5f)'
                      }}
                      onClick={() => onFilterByColor(color.name.tr)}
                      title={`Koleksiyonda ${color.name.tr} tonlu eserleri listele`}
                    >
                      <span>Eserleri Gör</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
