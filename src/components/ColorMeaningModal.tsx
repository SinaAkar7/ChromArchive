/**
 * @file src/components/ColorMeaningModal.tsx
 * @description Ana renk ailelerinin tarihsel pigment bağlamı, belgelenmiş kültürel anlamları,
 * modern kullanım alanları ve bilimsel kaynak referanslarını gösteren detay modalı.
 */

import React, { useEffect, useCallback } from 'react';
import {
  X,
  ExternalLink,
  BookOpen,
  History,
  Globe,
  Sparkles,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { ColorMeaningEntry } from '../types';
import {
  getColorMeanings,
  getSourcesForIds
} from '../services/colorMeaningsService';

interface ColorMeaningModalProps {
  color: ColorMeaningEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectColor?: (color: ColorMeaningEntry) => void;
  onFilterArchiveByColor?: (colorNameTr: string) => void;
}

export const ColorMeaningModal: React.FC<ColorMeaningModalProps> = ({
  color,
  isOpen,
  onClose,
  onSelectColor,
  onFilterArchiveByColor
}) => {
  const allColors = getColorMeanings();

  // ESC tuşu ile kapatma
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

  if (!isOpen || !color) {
    return null;
  }

  // Bu renk için kullanılan tüm benzersiz kaynak ID'lerini topla
  const allSourceIds = Array.from(
    new Set([
      ...color.historicalContext.flatMap((h) => h.sourceIds || []),
      ...(color.documentedMeanings || []).flatMap((m) => m.sourceIds || [])
    ])
  );
  const relevantSources = getSourcesForIds(allSourceIds);

  const getFamilyBadgeText = (family: string) => {
    switch (family) {
      case 'warm':
        return 'Sıcak Renk Ailesi (Warm)';
      case 'cool':
        return 'Soğuk Renk Ailesi (Cool)';
      case 'neutral':
        return 'Nötr Ton Ailesi (Neutral)';
      case 'earth':
        return 'Toprak & Mineral Tonu (Earth)';
      case 'mixed':
        return 'Karma Renk Ailesi (Mixed)';
      default:
        return 'Renk Ailesi';
    }
  };

  const hasDocumentedMeanings =
    Array.isArray(color.documentedMeanings) &&
    color.documentedMeanings.length > 0 &&
    color.documentedMeanings.some((m) => m.meanings && m.meanings.length > 0);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="color-modal-title"
    >
      <div
        className="modal-content-container color-meaning-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px' }}
      >
        {/* Modal Üst Başlık */}
        <div className="modal-header">
          <div className="modal-header-titles">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: color.displayHex,
                  border: '1px solid rgba(0,0,0,0.15)'
                }}
              />
              <span className="modal-category-tag">{getFamilyBadgeText(color.family)}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-warm, #f4efe6)',
                  color: 'var(--text-secondary, #555)',
                  fontFamily: 'monospace'
                }}
              >
                {color.displayHex}
              </span>
            </div>

            <h2 id="color-modal-title" className="modal-artwork-title" style={{ fontSize: '1.65rem' }}>
              {color.name.tr}{' '}
              <span style={{ fontSize: '1.15rem', fontWeight: 400, color: 'var(--text-secondary, #666)' }}>
                / {color.name.en}
              </span>
            </h2>
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

        {/* Hızlı Renk Seçici Şeridi */}
        <div
          style={{
            display: 'flex',
            gap: '0.375rem',
            padding: '0.625rem 1.5rem',
            backgroundColor: 'var(--bg-warm, #faf7f2)',
            borderBottom: '1px solid var(--border-light, #e8e2d8)',
            overflowX: 'auto',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #777)', marginRight: '0.5rem', whiteSpace: 'nowrap' }}>
            Renk Aileleri:
          </span>
          {allColors.map((c) => {
            const isSelected = c.id === color.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectColor && onSelectColor(c)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '16px',
                  border: isSelected ? '2px solid var(--color-primary, #1e3a5f)' : '1px solid var(--border-light, #ddd)',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'var(--color-primary, #1e3a5f)' : 'var(--text-secondary, #555)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                title={`${c.name.tr} / ${c.name.en}`}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: c.displayHex,
                    display: 'inline-block'
                  }}
                />
                <span>{c.name.tr}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Gövdesi */}
        <div className="modal-body-scrollable">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Renk Tanımı ve Örnek Panel */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(200px, 240px) 1fr',
                gap: '1.25rem',
                padding: '1.25rem',
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-light, #e8e2d8)',
                borderRadius: 'var(--radius-md, 8px)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div
                  style={{
                    height: '130px',
                    borderRadius: '6px',
                    backgroundColor: color.displayHex,
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '0.75rem',
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(255, 255, 255, 0.92)',
                      color: '#1a1a1a',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}
                  >
                    {color.displayHex}
                  </span>
                </div>
                {color.displayHexNote && (
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-muted, #777)', fontStyle: 'italic', margin: 0 }}>
                    {color.displayHexNote}
                  </p>
                )}
                {/* Etiketler */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {color.tags?.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '3px',
                        backgroundColor: 'var(--bg-warm, #f0ebe1)',
                        color: 'var(--text-secondary, #555)'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="block-title" style={{ marginTop: 0, marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={16} />
                  <span>Renk Tanımı ve Genel Özellikler</span>
                </h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary, #232529)', margin: 0 }}>
                  {color.description}
                </p>

                {color.editorialNote && (
                  <div
                    style={{
                      marginTop: '0.875rem',
                      padding: '0.625rem 0.875rem',
                      backgroundColor: 'var(--bg-warm, #faf7f0)',
                      borderLeft: '3px solid var(--color-accent, #c9702c)',
                      borderRadius: '0 4px 4px 0',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary, #666)'
                    }}
                  >
                    <strong>Editoryal Not:</strong> {color.editorialNote}
                  </div>
                )}
              </div>
            </div>

            {/* Tarihsel Bağlam ve Pigmentler */}
            <div className="meta-card-block">
              <h3 className="block-title">
                <History size={16} />
                <span>Tarihsel Bağlam ve Pigment Gelişimi</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {color.historicalContext.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.875rem',
                      backgroundColor: 'var(--bg-warm, #faf8f5)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light, #ebe5db)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: 'var(--color-primary, #1e3a5f)',
                          color: '#ffffff'
                        }}
                      >
                        {item.period}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #666)' }}>
                        {item.region}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.55, color: 'var(--text-primary, #333)', margin: '0 0 0.5rem 0' }}>
                      {item.detail}
                    </p>

                    {/* Kaynak bağlantıları */}
                    {item.sourceIds && item.sourceIds.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted, #888)' }}>Kaynak:</span>
                        {item.sourceIds.map((sid) => {
                          const src = relevantSources.find((s) => s.id === sid);
                          if (!src) return null;
                          return (
                            <a
                              key={sid}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: 'var(--color-primary, #1e3a5f)',
                                textDecoration: 'underline',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                marginRight: '0.5rem'
                              }}
                              title={`${src.title} (${src.type})`}
                            >
                              <span>[{src.id}: {src.title.substring(0, 32)}...]</span>
                              <ExternalLink size={10} />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Kültürel ve Sembolik Anlamlar (Rule 6: Boşsa gizle, bilgi uydurma) */}
            {hasDocumentedMeanings && (
              <div className="meta-card-block">
                <h3 className="block-title">
                  <Globe size={16} />
                  <span>Kültürel ve Belgelenmiş Anlamlar</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {color.documentedMeanings.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.875rem',
                        backgroundColor: 'var(--bg-surface, #ffffff)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-light, #ebe5db)'
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #555)', marginBottom: '0.5rem' }}>
                        Bağlam: {doc.context}
                      </div>

                      {/* Anlam Etiketleri */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        {doc.meanings.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            style={{
                              fontSize: '0.8rem',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              backgroundColor: 'var(--bg-warm, #f0ebe1)',
                              color: 'var(--color-primary, #1e3a5f)',
                              fontWeight: 500
                            }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>

                      {doc.note && (
                        <p style={{ fontSize: '0.785rem', color: 'var(--text-muted, #777)', fontStyle: 'italic', margin: '0 0 0.5rem 0' }}>
                          Not: {doc.note}
                        </p>
                      )}

                      {/* Kaynak bağlantıları */}
                      {doc.sourceIds && doc.sourceIds.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--text-muted, #888)' }}>Kaynak:</span>
                          {doc.sourceIds.map((sid) => {
                            const src = relevantSources.find((s) => s.id === sid);
                            if (!src) return null;
                            return (
                              <a
                                key={sid}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: 'var(--color-primary, #1e3a5f)',
                                  textDecoration: 'underline',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  marginRight: '0.5rem'
                                }}
                                title={`${src.title} (${src.type})`}
                              >
                                <span>[{src.id}: {src.title.substring(0, 32)}...]</span>
                                <ExternalLink size={10} />
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modern Kullanım Alanları */}
            {color.modernUses && color.modernUses.length > 0 && (
              <div className="meta-card-block">
                <h3 className="block-title">
                  <Sparkles size={16} />
                  <span>Modern Tasarım ve Güncel Kullanım Alanları</span>
                </h3>
                <ul
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.625rem',
                    padding: 0,
                    margin: 0,
                    listStyle: 'none'
                  }}
                >
                  {color.modernUses.map((use, idx) => (
                    <li
                      key={idx}
                      style={{
                        padding: '0.625rem 0.875rem',
                        backgroundColor: 'var(--bg-surface, #ffffff)',
                        border: '1px solid var(--border-light, #e8e2d8)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary, #333)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: color.displayHex,
                          flexShrink: 0
                        }}
                      />
                      <span>{use}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Referanslar ve Kaynaklar (Tıklanabilir Linkler) */}
            {relevantSources.length > 0 && (
              <div className="meta-card-block">
                <h3 className="block-title">
                  <BookOpen size={16} />
                  <span>Bilimsel Kaynaklar ve Referanslar</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {relevantSources.map((source) => (
                    <div
                      key={source.id}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-surface, #ffffff)',
                        border: '1px solid var(--border-light, #e8e2d8)',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.1rem 0.4rem',
                              borderRadius: '3px',
                              backgroundColor: 'var(--bg-warm, #f0ebe1)',
                              color: 'var(--text-secondary, #555)'
                            }}
                          >
                            {source.id}
                          </span>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: 'var(--color-primary, #1e3a5f)',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            className="clickable-source-title"
                          >
                            <span>{source.title}</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                        {source.notes && (
                          <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary, #666)', margin: 0 }}>
                            {source.notes}
                          </p>
                        )}
                      </div>

                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="modal-action-btn tertiary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        <span>Kaynağa Git</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Alt Aksiyon Çubuğu */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-light, #e8e2d8)',
            backgroundColor: 'var(--bg-warm, #faf7f2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #666)' }}>
            Küratöryel Kaynak: <strong>ChromArchive Color Meanings Dataset v1.0</strong> (CC BY 4.0)
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onFilterArchiveByColor && (
              <button
                type="button"
                className="modal-action-btn primary"
                onClick={() => {
                  onFilterArchiveByColor(color.name.tr);
                  onClose();
                }}
              >
                <span>Arşivde '{color.name.tr}' Tonlu Eserleri Gör</span>
                <ArrowRight size={14} />
              </button>
            )}
            <button
              type="button"
              className="modal-action-btn secondary"
              onClick={onClose}
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
