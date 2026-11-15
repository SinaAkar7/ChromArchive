/**
 * @file src/components/ColorHistoricalContextPanel.tsx
 * @description Baskın renkler için CIELAB + CIEDE2000 sözlük eşleşmeleri,
 * yaklaşık sRGB tarihsel pigment yakınlıkları, güvenlik/toksisite uyarıları,
 * pigment aile genel bakışı ve ayrı tutulmuş kültürel/sembolik renk anlamları paneli.
 */

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Copy,
  ExternalLink,
  FlaskConical,
  History,
  Info,
  Layers,
  Maximize2,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  ColorMeaningEntry,
  ColorSearchResult,
  DominantColor,
  HistoricalPigmentMatch,
  RgbObject,
} from '../types';
import {
  findNearestColorsByRgb,
  getFamilyLabelEn,
  getFamilyLabelTr,
  parseHexColorInput,
  rgbToHex,
} from '../services/colorSearchService';
import {
  getAllSourcesForPigment,
  getHistoricalColorFamilyById,
  getHistoricalDatasetMetadata,
  getHistoricalSourcesByIds,
  isHistoricalPigmentsAvailable,
  findNearestHistoricalPigments,
  isToxicOrHazardousPigment,
} from '../services/historicalPigmentsService';
import {
  getAllSourcesForEntry,
  getColorMeaningById,
  getColorMeaningByQuery,
} from '../services/colorMeaningsService';
import { ColorMeaningModal } from './ColorMeaningModal';

interface ColorHistoricalContextPanelProps {
  color: DominantColor;
  onCopyHex: (hex: string) => void;
  onClose?: () => void;
}

function getSafeRgbFromDominant(color: DominantColor): RgbObject {
  const parsed = parseHexColorInput(color.hex || '');
  if (parsed.ok) return parsed.rgb;
  return {
    r: Math.max(0, Math.min(255, Math.round(color.rgb?.[0] ?? 0))),
    g: Math.max(0, Math.min(255, Math.round(color.rgb?.[1] ?? 0))),
    b: Math.max(0, Math.min(255, Math.round(color.rgb?.[2] ?? 0))),
  };
}

function resolveMeaningForDominant(
  nearestDict: ColorSearchResult | null,
  color: DominantColor
): ColorMeaningEntry | null {
  if (nearestDict) {
    const fam = nearestDict.color.family;
    if (fam === 'cyan') {
      return (
        getColorMeaningById(nearestDict.color.hsl.h < 176 ? 'green' : 'blue') ??
        null
      );
    }
    if (fam === 'beige') {
      if (nearestDict.color.hsl.l >= 89 && nearestDict.color.hsl.s <= 26) {
        return getColorMeaningById('white') ?? null;
      }
      return getColorMeaningById('brown') ?? null;
    }
    const byDictFam = getColorMeaningById(fam);
    if (byDictFam) return byDictFam;
  }

  return (
    getColorMeaningByQuery(color.family || '') ??
    getColorMeaningByQuery(color.name || '') ??
    null
  );
}

export const ColorHistoricalContextPanel: React.FC<
  ColorHistoricalContextPanelProps
> = ({ color, onCopyHex, onClose }) => {
  const [modalEntry, setModalEntry] = useState<ColorMeaningEntry | null>(null);

  const safeRgb = useMemo(() => getSafeRgbFromDominant(color), [color]);
  const safeHex = useMemo(() => rgbToHex(safeRgb), [safeRgb]);

  const nearestDictionaryColors = useMemo(
    () => findNearestColorsByRgb(safeRgb, { limit: 3 }),
    [safeRgb]
  );

  const historicalAvailable = isHistoricalPigmentsAvailable();
  const datasetMeta = useMemo(() => getHistoricalDatasetMetadata(), []);

  const nearestPigmentMatches = useMemo<HistoricalPigmentMatch[]>(() => {
    if (!historicalAvailable) return [];
    return findNearestHistoricalPigments(safeRgb, { limit: 3 });
  }, [historicalAvailable, safeRgb]);

  const primaryDictMatch = nearestDictionaryColors[0] ?? null;

  const familyOverview = useMemo(() => {
    if (!historicalAvailable) return null;
    if (primaryDictMatch) {
      const fromDict = getHistoricalColorFamilyById(primaryDictMatch.color.family);
      if (fromDict) return fromDict;
    }
    return nearestPigmentMatches[0]?.colorFamilyOverview ?? null;
  }, [historicalAvailable, primaryDictMatch, nearestPigmentMatches]);

  const culturalMeaning = useMemo(
    () => resolveMeaningForDominant(primaryDictMatch, color),
    [primaryDictMatch, color]
  );

  const culturalSources = useMemo(
    () => (culturalMeaning ? getAllSourcesForEntry(culturalMeaning) : []),
    [culturalMeaning]
  );

  const hasDocumentedCulturalMeanings = Boolean(
    culturalMeaning?.documentedMeanings?.some((m) => m.meanings.length > 0)
  );

  return (
    <div
      className="historical-context-drawer"
      onClick={(e) => e.stopPropagation()}
      role="region"
      aria-label={`${color.name} (${safeHex}) tarihsel renk ve pigment bağlamı`}
    >
      {/* 1. Üst Başlık & Dominant Renk HEX / RGB Tekrarı */}
      <div className="hcd-header">
        <div className="hcd-color-identity">
          <span
            className="hcd-swatch"
            style={{ backgroundColor: safeHex }}
            aria-hidden="true"
          />
          <div className="hcd-identity-meta">
            <div className="hcd-identity-title">
              <strong>{color.name}</strong>
              <span className="hcd-pct-pill tabular-nums">
                %{color.percentage}
              </span>
              <span className="hcd-temp-pill">
                {color.temperature} · {color.family}
              </span>
            </div>
            <div className="hcd-codes-line">
              <button
                type="button"
                className="insight-hex-btn mono-font"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyHex(safeHex);
                }}
                title="HEX kodunu kopyala"
              >
                <span>HEX: {safeHex}</span>
                <Copy size={12} />
              </button>
              <span className="hcd-rgb-readout mono-font">
                RGB: rgb({safeRgb.r}, {safeRgb.g}, {safeRgb.b})
              </span>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            className="hcd-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Tarihsel bağlam panelini kapat"
          >
            <X size={15} />
            <span>Kapat</span>
          </button>
        )}
      </div>

      {/* Metodolojik Ayrım Uyarısı */}
      <div className="hcd-caution-strip" role="note">
        <ShieldAlert size={16} className="hcd-caution-icon" />
        <p>
          <strong>Bilimsel Ayrım:</strong> Delta E (CIEDE2000), dijital sRGB
          renklerinin algısal yakınlığını ölçer;{' '}
          <strong>tarihsel pigment teşhisi değildir</strong>. Aşağıdaki pigment
          örnekleri yalnızca yaklaşık ekran renk yakınlığına göre sıralanır;
          eserdeki gerçek pigmenti doğrulamak için XRF, Raman veya FTIR gibi
          teknik inceleme gerekir.
        </p>
      </div>

      {/* 2. Adlandırılmış Renk Sözlüğü Eşleşmeleri (368 Renk - CIELAB + CIEDE2000) */}
      <div className="drawer-block">
        <div className="drawer-block-heading">
          <Sparkles size={15} />
          <h6>
            CIELAB & CIEDE2000 (ΔE) En Yakın Sözlük Eşleşmeleri (368 Açık Kaynak
            Renk)
          </h6>
        </div>
        <p className="drawer-approx-note">
          Delta E (ΔE) değeri, örneklenen piksel renginin yerel sRGB sözlüğündeki
          adlandırılmış renklere olan algısal mesafesini gösterir (düşük ΔE =
          görsel olarak daha yakın). Tarihsel kimyasal bileşimi ifade etmez.
        </p>

        {nearestDictionaryColors.length > 0 ? (
          <div className="drawer-dict-matches-row">
            {nearestDictionaryColors.map((match, idx) => (
              <div key={match.color.id} className="drawer-dict-chip hcd-dict-card">
                <span
                  className="dict-chip-swatch"
                  style={{ backgroundColor: match.color.hex }}
                />
                <div className="dict-chip-text">
                  <div className="hcd-dict-top-line">
                    <strong>
                      #{idx + 1} {match.color.name}
                    </strong>
                    <span className="hcd-de-badge mono-font">
                      ΔE {match.deltaE.toFixed(2)}
                    </span>
                  </div>
                  <span className="mono-font">
                    {match.color.hex} · {getFamilyLabelTr(match.color.family)} (
                    {getFamilyLabelEn(match.color.family)}) ·{' '}
                    {match.similarityLabel}
                  </span>
                  <span className="hcd-dict-source">
                    Kaynak: {match.color.source}
                  </span>
                  {match.color.tags && match.color.tags.length > 0 && (
                    <div className="hcd-mini-tags">
                      {match.color.tags.slice(0, 4).map((tag, tIdx) => (
                        <span key={tIdx} className="hcd-mini-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="drawer-prose">
            Renk sözlüğü eşleşmesi hesaplanamadı.
          </p>
        )}
      </div>

      {/* 3. Tarihsel Pigment Yakınlıkları ve Renk Ailesi Genel Bakışı */}
      {!historicalAvailable ? (
        <div className="drawer-block hcd-unavailable-box" role="alert">
          <AlertTriangle size={16} />
          <span>Tarihsel pigment verisi yüklenemedi.</span>
        </div>
      ) : (
        <>
          {/* 3a. İlgili Renk Ailesinin Tarihsel Genel Bakışı */}
          {familyOverview && (
            <div className="drawer-block">
              <div className="drawer-block-heading">
                <Layers size={15} />
                <h6>
                  Renk Ailesi Tarihsel Genel Bakışı:{' '}
                  {familyOverview.name.tr} ({familyOverview.name.en})
                </h6>
              </div>
              <p className="drawer-prose">{familyOverview.historicalOverview}</p>
            </div>
          )}

          {/* 3b. Olası Görsel Renk Yakınlığı — En Yakın 1–3 Tarihsel Pigment Örneği */}
          <div className="drawer-block">
            <div className="drawer-block-heading">
              <FlaskConical size={15} />
              <h6>
                Olası Görsel Renk Yakınlığı: Benzer Tarihsel Pigment Örnekleri
                (En Yakın 3 Kayıt)
              </h6>
            </div>
            {datasetMeta?.displayHexPolicy && (
              <p className="drawer-approx-note">{datasetMeta.displayHexPolicy}</p>
            )}

            <div className="hcd-pigments-stack">
              {nearestPigmentMatches.map((match, pIdx) => {
                const { pigment, deltaE, similarityLabel } = match;
                const isHazardous = isToxicOrHazardousPigment(pigment);
                const pigmentSources = getAllSourcesForPigment(pigment);

                return (
                  <article
                    key={pigment.id}
                    className={`hcd-pigment-card ${
                      isHazardous ? 'is-hazardous' : ''
                    }`}
                  >
                    <div className="hcd-pigment-header">
                      <div className="hcd-pigment-swatch-group">
                        <div
                          className="hcd-pigment-swatch"
                          style={{ backgroundColor: pigment.displayHex }}
                          title={`Yaklaşık arayüz örneği: ${pigment.displayHex}`}
                        />
                        <div className="hcd-pigment-title-col">
                          <div className="hcd-pigment-name-row">
                            <span className="hcd-rank-chip mono-font">
                              #{pIdx + 1}
                            </span>
                            <strong>
                              {pigment.name.tr} ({pigment.name.en})
                            </strong>
                          </div>
                          <div className="hcd-pigment-sub-row">
                            <span className="mono-font">
                              Yaklaşık arayüz örneği: {pigment.displayHex} · ΔE{' '}
                              {deltaE.toFixed(2)} ({similarityLabel})
                            </span>
                            <span className="hcd-evidence-chip">
                              Kanıt düzeyi: {pigment.evidenceLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="hcd-displayhex-note">
                      <Info size={13} />
                      <span>{pigment.displayHexNote}</span>
                    </p>

                    <div className="hcd-pigment-details-grid">
                      <div className="hcd-detail-cell">
                        <span className="hcd-detail-label">
                          Kimyasal Bileşim
                        </span>
                        <p>{pigment.composition}</p>
                      </div>

                      <div className="hcd-detail-cell">
                        <span className="hcd-detail-label">
                          Belgelenmiş Sanatsal Kullanım
                        </span>
                        {pigment.documentedArtisticUses?.length > 0 ? (
                          <ul className="drawer-bullet-list">
                            {pigment.documentedArtisticUses.map((use, uIdx) => (
                              <li key={uIdx}>{use}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>Belirtilmemiş</p>
                        )}
                      </div>
                    </div>

                    {/* Desteklenen Tarihsel Dönem & Coğrafya Kayıtları */}
                    {pigment.historicalBackground &&
                      pigment.historicalBackground.length > 0 && (
                        <div className="hcd-background-list">
                          <span className="hcd-detail-label">
                            Tarihsel Dönem ve Coğrafi Bağlam
                          </span>
                          {pigment.historicalBackground.map((bg, bIdx) => {
                            const bgSources = getHistoricalSourcesByIds(
                              bg.sourceIds
                            );
                            return (
                              <div key={bIdx} className="drawer-timeline-item">
                                <div className="timeline-meta">
                                  <span className="timeline-period">
                                    {bg.period}
                                  </span>
                                  <span className="timeline-region">
                                    {bg.region}
                                  </span>
                                  {bgSources.map((src) => (
                                    <a
                                      key={src.id}
                                      href={src.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-src-link"
                                      title={`${src.title} (${src.publisher})`}
                                    >
                                      <span>[{src.id}]</span>
                                      <ExternalLink size={10} />
                                    </a>
                                  ))}
                                </div>
                                <p>{bg.detail}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    {/* Koruma ve Güvenlik Notları (Toksik Pigmentlerde Vurgulu) */}
                    <div
                      className={`hcd-safety-box ${
                        isHazardous ? 'hazard-alert' : ''
                      }`}
                      role={isHazardous ? 'alert' : undefined}
                    >
                      <div className="hcd-safety-heading">
                        {isHazardous ? (
                          <AlertTriangle size={15} />
                        ) : (
                          <Info size={15} />
                        )}
                        <strong>
                          Koruma ve Güvenlik Notları
                          {isHazardous ? ' (Toksik / Ağır Metal Uyarısı)' : ''}
                        </strong>
                      </div>
                      <p>{pigment.conservationAndSafetyNotes}</p>
                    </div>

                    {/* Analiz Uyarısı */}
                    <div className="hcd-analysis-caution">
                      <strong>Analiz Uyarısı:</strong> {pigment.analysisCaution}
                    </div>

                    {/* Kaynak Bağlantıları */}
                    {pigmentSources.length > 0 && (
                      <div className="hcd-sources-footer">
                        <span className="hcd-sources-label">
                          <BookOpen size={13} />
                          <span>Kaynaklar:</span>
                        </span>
                        <div className="hcd-sources-links">
                          {pigmentSources.map((src) => (
                            <a
                              key={src.id}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hcd-source-pill-link"
                              title={`${src.title} — ${src.publisher} (${src.access})`}
                            >
                              <span className="src-id-pill">{src.id}</span>
                              <span>
                                {src.title} ({src.publisher})
                              </span>
                              <ExternalLink size={11} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 4. Kültürel ve Sembolik Anlamlar (Fiziksel Pigmentlerden Ayrı) */}
      {culturalMeaning && (
        <div className="drawer-block hcd-cultural-block">
          <div className="hcd-cultural-header">
            <div className="drawer-block-heading" style={{ marginBottom: 0 }}>
              <History size={15} />
              <h6>
                Kültürel ve Sembolik Anlamlar ({culturalMeaning.name.tr} /{' '}
                {culturalMeaning.name.en})
              </h6>
            </div>
            <button
              type="button"
              className="insight-modal-btn"
              onClick={(e) => {
                e.stopPropagation();
                setModalEntry(culturalMeaning);
              }}
            >
              <Maximize2 size={13} />
              <span>Tam Anlam Kartını Aç</span>
            </button>
          </div>

          <p className="hcd-separation-note">
            <strong>Pigment ve Anlam Ayrımı:</strong> Yukarıda listelenen
            pigmentler fiziksel boya malzemeleridir; bu bölümdeki bilgiler ise
            renk algısına atfedilen kültürel ve tarihsel yorumlardır. Anlamlar
            farklı kültür ve tarihsel dönemlerde değişkenlik gösterir; hiçbir
            rengin tek, evrensel veya değişmez bir anlamı yoktur.
          </p>

          <p className="drawer-prose">{culturalMeaning.description}</p>

          {hasDocumentedCulturalMeanings ? (
            <div className="drawer-meanings-box">
              {culturalMeaning.documentedMeanings.map((dm, dmIdx) => (
                <div key={dmIdx} className="drawer-meaning-group">
                  <div className="meaning-ctx">
                    Belgelenmiş Bağlam ({dm.context}):
                  </div>
                  <div className="meaning-tags-row">
                    {dm.meanings.map((m, mIdx) => (
                      <span key={mIdx} className="meaning-chip">
                        {m}
                      </span>
                    ))}
                  </div>
                  {dm.note && <p className="meaning-caveat">{dm.note}</p>}
                </div>
              ))}
            </div>
          ) : (
            culturalMeaning.editorialNote && (
              <p className="drawer-editorial-note">
                {culturalMeaning.editorialNote}
              </p>
            )
          )}

          {culturalMeaning.modernUses && culturalMeaning.modernUses.length > 0 && (
            <div className="drawer-modern-uses">
              <span className="modern-uses-label">Modern Kullanım Örnekleri:</span>
              <span className="modern-uses-inline">
                {culturalMeaning.modernUses.join(' · ')}
              </span>
            </div>
          )}

          {culturalSources.length > 0 && (
            <div className="hcd-sources-footer" style={{ marginTop: '0.65rem' }}>
              <span className="hcd-sources-label">
                <BookOpen size={13} />
                <span>Kültürel Bağlam Kaynakları:</span>
              </span>
              <div className="hcd-sources-links">
                {culturalSources.map((src) => (
                  <a
                    key={src.id}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hcd-source-pill-link"
                    title={src.title}
                  >
                    <span className="src-id-pill">{src.id}</span>
                    <span>{src.title}</span>
                    <ExternalLink size={11} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ColorMeaningModal
        color={modalEntry}
        isOpen={Boolean(modalEntry)}
        onClose={() => setModalEntry(null)}
        onSelectColor={(entry) => setModalEntry(entry)}
      />
    </div>
  );
};
