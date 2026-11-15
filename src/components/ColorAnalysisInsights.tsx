/**
 * @file src/components/ColorAnalysisInsights.tsx
 * @description Analiz sonuçları altında 368 renkli açık erişimli sözlük kaynaklarını,
 * 38 tarihsel pigment veri seti politikasını ve kart bazlı inceleme yönlendirmesini sunan özet bileşen.
 */

import React, { useMemo } from 'react';
import { BookOpen, ExternalLink, Flame, ShieldAlert } from 'lucide-react';
import type { DominantColor } from '../types';
import { getColorsDatasetSummary } from '../services/colorSearchService';
import {
  getHistoricalDatasetMetadata,
  isHistoricalPigmentsAvailable,
} from '../services/historicalPigmentsService';
import {
  getTemperatureRules,
  getWarmCoolResearchReference,
} from '../services/colorTemperatureService';

interface ColorAnalysisInsightsProps {
  colors: DominantColor[];
  artworkTitle?: string;
  onCopyHex?: (hex: string) => void;
}

export const ColorAnalysisInsights: React.FC<ColorAnalysisInsightsProps> = ({
  colors,
  artworkTitle,
}) => {
  const dictSummary = useMemo(() => getColorsDatasetSummary(), []);
  const historicalMeta = useMemo(() => getHistoricalDatasetMetadata(), []);
  const historicalReady = isHistoricalPigmentsAvailable();
  const tempRules = useMemo(() => getTemperatureRules(), []);
  const researchRef = useMemo(() => getWarmCoolResearchReference(), []);

  if (!Array.isArray(colors) || colors.length === 0) {
    return null;
  }

  const pub = researchRef.dataset.primaryPublication;

  return (
    <section
      className="historical-insights-section"
      aria-label="Metodoloji ve Veri Kaynağı Atıfları"
    >
      <div className="insights-section-header">
        <div className="insights-header-top">
          <div>
            <span className="section-kicker">
              CIELAB CIEDE2000 · Göreli Sıcak/Soğuk Yönelim &amp; Açık Kaynak Atıfları
            </span>
            <h4 className="insights-title">
              Yöntem, Göreli Sıcaklık Araştırma Dayanağı ve Kaynaklar
            </h4>
          </div>
          {artworkTitle && (
            <span className="insights-artwork-chip">{artworkTitle}</span>
          )}
        </div>

        <div className="insights-disclaimer-banner" role="note">
          <ShieldAlert size={17} className="disclaimer-icon" />
          <p>
            <strong>Kullanım İpucu &amp; Bilimsel Sınır:</strong> Her baskın
            renk kartının altındaki{' '}
            <strong>“Tarihsel renk ve pigment bağlamı”</strong> düğmesine
            tıklayarak {dictSummary.totalColors} renkli sözlükteki en yakın 3
            renk eşleşmesini,{' '}
            {historicalReady
              ? `${historicalMeta?.totalPigments ?? 38} tarihsel pigment arasından yaklaşık görsel yakınlıkları`
              : 'tarihsel pigment bağlamını'}
            , koruma/toksisite uyarılarını ve ayrı kültürel anlamları
            inceleyebilirsiniz. Piksel HEX değeri tek başına kimyasal pigment
            teşhisi sağlamaz ve sıcaklık skoru fiziksel Kelvin ölçümü değildir.
          </p>
        </div>
      </div>

      {/* Göreli Sıcak-Soğuk Modeli & Araştırma Referansı */}
      <div className="drawer-block temp-research-box">
        <div className="drawer-block-heading">
          <Flame size={15} />
          <h6>
            Göreli Sıcak/Soğuk Analizi — Araştırma Dayanağı &amp; Yöntem Ayrımı
          </h6>
        </div>
        <p className="drawer-prose">
          <strong>Uygulama Sezgisi vs. Psikofiziksel Araştırma:</strong>{' '}
          ChromArchive’daki 0–100 sıcaklık yönelim skoru, sRGB tabanlı HSL hue
          eksenini (<code className="mono-inline">warmPole={tempRules.classificationModel.anchors.warmPoleHueDeg}°</code> /{' '}
          <code className="mono-inline">coolPole={tempRules.classificationModel.anchors.coolPoleHueDeg}°</code>){' '}
          HSL/HSV doygunluk, Lightness, CIELAB kroma (<code className="mono-inline">C*ab</code>) ve
          renk ailesi/toprak alt-tonu bağlamıyla birlikte değerlendiren açıklanabilir bir görsel-sanat sezgisidir.{' '}
          {researchRef.keyFindings.interpretation}{' '}
          <em>({researchRef.dataset.coordinateSystem.warning})</em>
        </p>

        <div className="research-citation-card">
          <div className="research-citation-head">
            <strong>
              {pub.authors} ({pub.year}). “{pub.title}”
            </strong>
            <span className="research-license-pill">{pub.license}</span>
          </div>
          <div className="research-citation-meta">
            <span>
              <em>{pub.journal}</em>, {pub.volume}({pub.issue}), {pub.article} · DOI:{' '}
              <span className="mono-inline">{pub.doi}</span>
            </span>
          </div>
          <div className="research-citation-links">
            <a
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
              className="drawer-source-link"
            >
              <span>Makaleyi Aç (PMC / Journal of Vision)</span>
              <ExternalLink size={12} />
            </a>
            <a
              href={researchRef.dataset.curatedExport.datasetPage}
              target="_blank"
              rel="noopener noreferrer"
              className="drawer-source-link"
            >
              <span>Derlenmiş Özet Veri Sayfası ({researchRef.dataset.curatedExport.maintainer})</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <ul className="drawer-sources-list" style={{ marginTop: '0.65rem' }}>
          {tempRules.sources.map((src) => (
            <li key={src.id}>
              <span className="src-id-pill">{src.id}</span>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="drawer-source-link"
              >
                <span className="src-title">{src.title}</span>
                <ExternalLink size={12} />
              </a>
              <span className="src-type-meta">
                {src.authors ? `— ${src.authors}` : src.publisher ? `— ${src.publisher}` : ''}
                {src.publication ? ` (${src.publication})` : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Veri Kaynağı Atıfları */}
      <div className="drawer-block">
        <div className="drawer-block-heading">
          <BookOpen size={15} />
          <h6>
            Kullanılan Açık Erişimli Sözlük ve Tarihsel Pigment Veri Kaynakları
          </h6>
        </div>
        <ul className="drawer-sources-list">
          {dictSummary.sources.map((src) => (
            <li key={src.name}>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="drawer-source-link"
              >
                <span className="src-title">{src.name}</span>
                <ExternalLink size={12} />
              </a>
              <span className="src-type-meta">
                ({src.license}){src.attribution ? ` — ${src.attribution}` : ''}
              </span>
            </li>
          ))}
          {historicalReady && historicalMeta && (
            <li>
              <span className="src-title">
                <strong>{historicalMeta.name}:</strong>{' '}
                {historicalMeta.description}
              </span>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
};
