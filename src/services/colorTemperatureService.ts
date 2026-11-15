/**
 * @file src/services/colorTemperatureService.ts
 * @description ChromArchive göreli sıcak/soğuk renk sınıflandırma motoru.
 * Kuralları yalnızca yerel `colorTemperatureRules.json` dosyasından okur;
 * araştırma künyesi ve koordinat sistemi uyarısı için `warmCoolResearchReference.json` kullanır.
 * Fiziksel Kelvin sıcaklığı ölçmez; açıklanabilir görsel-sanat sezgisi sunar.
 */

import temperatureRulesRaw from '../data/colorTemperatureRules.json';
import warmCoolResearchRaw from '../data/warmCoolResearchReference.json';
import type {
  ArtworkMetadata,
  ColorFamily,
  ColorTemperature,
  ColorTemperatureRulesDataset,
  DominantColor,
  SpatialTemperatureRelation,
  TemperatureCategoryId,
  TemperatureConfidenceLevel,
  WarmCoolResearchReferenceDataset,
} from '../types';
import { parseHexColorInput, rgbToCielab } from './colorSearchService';

const RULES = temperatureRulesRaw as ColorTemperatureRulesDataset;
const RESEARCH_REF = warmCoolResearchRaw as WarmCoolResearchReferenceDataset;

export interface ClassifiedColorTemperature {
  legacyTemperature: ColorTemperature;
  warmthScore: number;
  categoryId: TemperatureCategoryId;
  labelTr: string;
  confidence: TemperatureConfidenceLevel;
  confidenceLabelTr: string;
  confidenceNumeric: number;
  cielabChroma: number;
  hueDeg: number;
  saturation: number;
  lightness: number;
  isNeutral: boolean;
  basis: string;
  undertoneNote: string;
}

export interface PaletteTemperatureAggregation {
  dominantColors: DominantColor[];
  overallTemperature: string;
  warmthScoreWeightedMean: number | null;
  warmSharePercent: number;
  coolSharePercent: number;
  transitionalSharePercent: number;
  neutralSharePercent: number;
  temperatureSummary: string;
  temperatureModelVersion: string;
  spatialTemperatureRelations?: SpatialTemperatureRelation[];
}

export function getTemperatureRules(): ColorTemperatureRulesDataset {
  return RULES;
}

export function getWarmCoolResearchReference(): WarmCoolResearchReferenceDataset {
  return RESEARCH_REF;
}

function clamp(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, val));
}

/**
 * Açıyı 0–360 derece aralığına normalize eder.
 */
export function normalizeHueDeg(deg: number): number {
  if (!Number.isFinite(deg)) return 0;
  const mod = deg % 360;
  return mod < 0 ? mod + 360 : mod;
}

/**
 * İki dairesel hue açısı arasındaki en kısa derece farkını (0–180) hesaplar.
 */
export function shortestCircularHueDistance(aDeg: number, bDeg: number): number {
  const a = normalizeHueDeg(aDeg);
  const b = normalizeHueDeg(bDeg);
  const diff = Math.abs(a - b);
  return diff > 180 ? 360 - diff : diff;
}

/**
 * sRGB (0–255) bileşenlerinden HSL [hueDeg(0..360), sat(0..1), light(0..1)] hesaplar.
 */
export function rgbToHslTuple(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  const rn = clamp(r, 0, 255) / 255;
  const gn = clamp(g, 0, 255) / 255;
  const bn = clamp(b, 0, 255) / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      case bn:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }

  return [normalizeHueDeg(h * 360), clamp(s, 0, 1), clamp(l, 0, 1)];
}

/**
 * sRGB (0–255) bileşenlerinden HSV doygunluğu (0..1) hesaplar.
 * Yüksek veya çok düşük açıklıkta HSL'nin yapay doygunluk şişmesini dengeler.
 */
export function rgbToHsvSaturation(r: number, g: number, b: number): number {
  const rn = clamp(r, 0, 255) / 255;
  const gn = clamp(g, 0, 255) / 255;
  const bn = clamp(b, 0, 255) / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  if (max <= 0) return 0;
  return clamp((max - min) / max, 0, 1);
}

/**
 * DominantColor veya eksik/bozuk eski kayıttan güvenli [r, g, b] üçlüsü çıkarır.
 */
export function resolveSafeRgb(
  color: Partial<DominantColor> | null | undefined
): [number, number, number] | null {
  if (!color) return null;

  if (
    Array.isArray(color.rgb) &&
    color.rgb.length === 3 &&
    color.rgb.every((n) => typeof n === 'number' && Number.isFinite(n))
  ) {
    return [
      Math.round(clamp(color.rgb[0], 0, 255)),
      Math.round(clamp(color.rgb[1], 0, 255)),
      Math.round(clamp(color.rgb[2], 0, 255)),
    ];
  }

  if (typeof color.hex === 'string' && color.hex.trim().length > 0) {
    const parsed = parseHexColorInput(color.hex);
    if (parsed.ok) {
      return [parsed.rgb.r, parsed.rgb.g, parsed.rgb.b];
    }
  }

  return null;
}

/**
 * Hue açısına göre aile çıkarımı yapar (aile bilgisi verilmediğinde yedek olarak).
 */
function inferFamilyFromHsl(hueDeg: number, isNeutral: boolean): ColorFamily {
  if (isNeutral) return 'Nötr';
  const h = normalizeHueDeg(hueDeg);
  if (h >= 345 || h < 15) return 'Kırmızı';
  if (h >= 15 && h < 45) return 'Turuncu';
  if (h >= 45 && h < 70) return 'Sarı';
  if (h >= 70 && h < 165) return 'Yeşil';
  if (h >= 165 && h < 260) return 'Mavi';
  if (h >= 260 && h < 315) return 'Mor';
  return 'Kırmızı';
}

/**
 * `colorTemperatureRules.json` içindeki `familyRelativeUndertones` kurallarını kullanarak
 * aynı renk ailesi içindeki göreli alt-ton karşılaştırma notunu üretir.
 */
export function buildFamilyUndertoneNote(
  family: ColorFamily | string,
  hueDeg: number,
  isNeutral: boolean,
  extraContext?: string
): string {
  const effectiveFamily = isNeutral ? 'Nötr' : family;
  const rule =
    RULES.familyRelativeUndertones.find(
      (item) => item.familyId.toLowerCase() === effectiveFamily.toLowerCase()
    ) ??
    RULES.familyRelativeUndertones.find((item) => item.familyId === 'Nötr');

  if (!rule) {
    return extraContext || 'Aynı renk ailesi içindeki diğer tonlarla göreli karşılaştırma önerilir.';
  }

  if (isNeutral || effectiveFamily === 'Nötr') {
    return extraContext ? `${extraContext} ${rule.warmDirectionTr}` : rule.warmDirectionTr;
  }

  const h = normalizeHueDeg(hueDeg);
  let leaning = '';

  switch (effectiveFamily) {
    case 'Kırmızı': {
      if (h >= 0 && h < 30) {
        leaning = `Bu ton kırmızı içinde turuncuya yakın yönelir (${Math.round(h)}°). `;
      } else if (h >= 305 && h < 355) {
        leaning = `Bu ton kırmızı içinde viyole/mora yakın yönelir (${Math.round(h)}°). `;
      }
      break;
    }
    case 'Turuncu': {
      if (h < 28) {
        leaning = `Kızıla/turuncuya daha yakın alt ton (${Math.round(h)}°). `;
      } else {
        leaning = `Sarıya/okraya daha yakın görece serin alt ton (${Math.round(h)}°). `;
      }
      break;
    }
    case 'Sarı': {
      if (h < 54) {
        leaning = `Altın/turuncuya daha yakın alt ton (${Math.round(h)}°). `;
      } else {
        leaning = `Yeşile/limonî tarafa daha yakın alt ton (${Math.round(h)}°). `;
      }
      break;
    }
    case 'Yeşil': {
      if (h < 115) {
        leaning = `Sarı/zeytin tarafına kayan yeşil alt tonu (${Math.round(h)}°). `;
      } else {
        leaning = `Camgöbeği/mavi-yeşil tarafına kayan alt ton (${Math.round(h)}°). `;
      }
      break;
    }
    case 'Mavi': {
      if (h >= 225) {
        leaning = `Viyole/mor tarafına yaklaşan mavi alt tonu (${Math.round(h)}°). `;
      } else {
        leaning = `Camgöbeği/yeşil tarafına yaklaşan mavi alt tonu (${Math.round(h)}°). `;
      }
      break;
    }
    case 'Mor': {
      if (h >= 285) {
        leaning = `Magenta/kırmızı tarafına kayan mor alt tonu (${Math.round(h)}°). `;
      } else {
        leaning = `Mavi tarafına kayan mor alt tonu (${Math.round(h)}°). `;
      }
      break;
    }
    default:
      break;
  }

  const comparisonHint = `${rule.warmDirectionTr} ${rule.coolDirectionTr}`;
  const prefix = extraContext ? `${extraContext} ` : '';
  return `${prefix}${leaning}Göreli aile karşılaştırması: ${comparisonHint}`.trim();
}

/**
 * Tek bir sRGB rengi `colorTemperatureRules.json` çok boyutlu kurallarına göre sınıflandırır.
 * Hue açısına ek olarak HSL/HSV doygunluk, lightness, CIELAB kroma (C*ab), Lab a/b dengesi
 * ve renk ailesi/toprak-bej bağlamını birlikte değerlendirir.
 */
export function classifyColorTemperature(
  r: number,
  g: number,
  b: number,
  knownFamily?: ColorFamily
): ClassifiedColorTemperature {
  const safeR = Number.isFinite(r) ? Math.round(clamp(r, 0, 255)) : 0;
  const safeG = Number.isFinite(g) ? Math.round(clamp(g, 0, 255)) : 0;
  const safeB = Number.isFinite(b) ? Math.round(clamp(b, 0, 255)) : 0;

  const [hueDeg, saturation, lightness] = rgbToHslTuple(safeR, safeG, safeB);
  const hsvSat = rgbToHsvSaturation(safeR, safeG, safeB);
  const lab = rgbToCielab({ r: safeR, g: safeG, b: safeB });
  const rawChroma = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  const cielabChroma = Number.isFinite(rawChroma)
    ? parseFloat(rawChroma.toFixed(1))
    : 0;

  const { neutralGate, anchors, categories, confidence, multiFactorWeighting } =
    RULES.classificationModel;

  const belowHslSat = saturation < neutralGate.hslSaturationBelow;
  const belowHsvSat =
    typeof neutralGate.hsvSaturationBelow === 'number' &&
    hsvSat < neutralGate.hsvSaturationBelow;
  const belowChroma = cielabChroma < neutralGate.cielabChromaBelow;
  const extremeLowMaxChroma = neutralGate.extremeLightnessMaxChroma ?? 15;
  const extremeDark =
    typeof neutralGate.extremeLightnessLow === 'number' &&
    lightness < neutralGate.extremeLightnessLow &&
    cielabChroma < extremeLowMaxChroma;
  const extremeLight =
    typeof neutralGate.extremeLightnessHigh === 'number' &&
    lightness > neutralGate.extremeLightnessHigh &&
    cielabChroma < extremeLowMaxChroma;

  const isNeutral =
    neutralGate.combineWith === 'AND'
      ? belowHslSat && belowChroma
      : belowHslSat || belowHsvSat || belowChroma || extremeDark || extremeLight;

  const family = knownFamily ?? inferFamilyFromHsl(hueDeg, isNeutral);

  if (isNeutral) {
    const lowConfDef =
      confidence.levels.find((lv) => lv.id === 'low') ??
      confidence.levels[confidence.levels.length - 1];
    const undertoneNote = buildFamilyUndertoneNote(family, hueDeg, true);

    return {
      legacyTemperature: 'Nötr',
      warmthScore: 50,
      categoryId: 'neutral',
      labelTr: categories.neutral.labelTr,
      confidence: 'low',
      confidenceLabelTr: lowConfDef?.labelTr ?? 'Düşük',
      confidenceNumeric: 0.2,
      cielabChroma,
      hueDeg: Math.round(hueDeg),
      saturation: parseFloat(saturation.toFixed(2)),
      lightness: parseFloat(lightness.toFixed(2)),
      isNeutral: true,
      basis: `Nötr kapısı devrede (HSL S=%${Math.round(saturation * 100)}, HSV S=%${Math.round(hsvSat * 100)}, L=%${Math.round(lightness * 100)}, C*ab=${cielabChroma}) — düşük kroma veya uç açıklık nedeniyle sıcaklık yönelimi nötr/belirsiz.`,
      undertoneNote,
    };
  }

  // Çok boyutlu yönelim skoru: Hue polaritesi × sürekli termal genlik
  const mf = multiFactorWeighting ?? {
    chromaFloor: 8,
    chromaFullRange: 56,
    effectiveSatWeights: { hsl: 0.45, hsv: 0.55 },
    satFloor: 0.08,
    satFullRange: 0.52,
    strengthBlend: { chroma: 0.58, saturation: 0.42 },
    lightnessPeakRange: [0.28, 0.72],
    lightnessFloorEnvelope: 0.45,
    earthBeigeModeration: {
      hueRangeDeg: [10, 65],
      mutedChromaThreshold: 38,
      mutedEffectiveSatThreshold: 0.56,
      lightBeigeThreshold: 0.68,
      darkEarthThreshold: 0.34,
      minRednessRatioForFullWarmth: 0.32,
      yellowishBrownFactor: 0.56,
      paleBeigeFactor: 0.58,
      mutedUmberFactor: 0.66,
      orangishEarthFactor: 0.88,
      neutralFamilyFactor: 0.55,
    },
  };

  const distToWarmPole = shortestCircularHueDistance(
    hueDeg,
    anchors.warmPoleHueDeg
  );
  const huePolarity = Math.cos((distToWarmPole * Math.PI) / 180);

  const chromaFactor = clamp(
    (cielabChroma - mf.chromaFloor) / mf.chromaFullRange,
    0.08,
    1.0
  );
  const effectiveSat = clamp(
    mf.effectiveSatWeights.hsl * saturation + mf.effectiveSatWeights.hsv * hsvSat,
    0,
    1
  );
  const satFactor = clamp(
    (effectiveSat - mf.satFloor) / mf.satFullRange,
    0.1,
    1.0
  );
  const baseChromaticStrength =
    mf.strengthBlend.chroma * chromaFactor +
    mf.strengthBlend.saturation * satFactor;

  const peakLow = mf.lightnessPeakRange[0] ?? 0.28;
  const peakHigh = mf.lightnessPeakRange[1] ?? 0.72;
  const floorEnv = mf.lightnessFloorEnvelope ?? 0.45;
  let lightnessFactor = 1.0;
  if (lightness < peakLow) {
    lightnessFactor = clamp(
      floorEnv + (1 - floorEnv) * (lightness / peakLow),
      0.35,
      1.0
    );
  } else if (lightness > peakHigh) {
    lightnessFactor = clamp(
      floorEnv + (1 - floorEnv) * ((1 - lightness) / (1 - peakHigh)),
      0.35,
      1.0
    );
  }

  // Toprak, kahverengi, bej ve nötr aile bağlamı düzeltmesi
  const eb = mf.earthBeigeModeration;
  const rednessRatio =
    rawChroma > 0
      ? clamp(lab.a / (Math.abs(lab.a) + Math.abs(lab.b) + 1e-6), 0, 1)
      : 0;

  let contextFactor = 1.0;
  let earthContextHint = '';

  if (family === 'Nötr') {
    contextFactor = eb.neutralFamilyFactor;
    earthContextHint =
      'Nötr aile sınırındaki düşük doygunluklu ton; yumuşatılmış yönelim uygulanmıştır.';
  } else if (
    hueDeg >= (eb.hueRangeDeg[0] ?? 10) &&
    hueDeg <= (eb.hueRangeDeg[1] ?? 65)
  ) {
    const isLightBeige =
      lightness > eb.lightBeigeThreshold &&
      (cielabChroma < eb.mutedChromaThreshold ||
        effectiveSat < eb.mutedEffectiveSatThreshold);
    const isMutedEarth =
      cielabChroma < eb.mutedChromaThreshold ||
      effectiveSat < eb.mutedEffectiveSatThreshold ||
      lightness < eb.darkEarthThreshold;

    if (isLightBeige) {
      contextFactor = eb.paleBeigeFactor;
      earthContextHint =
        'Düşük kromalı açık bej alt tonu; yüksek açıklık nedeniyle yapay sıcaklık artışı bastırıldı.';
    } else if (isMutedEarth) {
      if (hueDeg >= 27 || rednessRatio < eb.minRednessRatioForFullWarmth) {
        contextFactor = eb.yellowishBrownFactor;
        earthContextHint =
          'Sarımsı-toprak/kahve alt tonu; yüksek Lab +b* / düşük +a* dengesi ve ılımlı kroma nedeniyle dengelendi.';
      } else {
        contextFactor =
          cielabChroma < 24 ? eb.mutedUmberFactor : eb.orangishEarthFactor;
        earthContextHint =
          'Turuncumsu/kızıl toprak alt tonu; sarımsı kahvelere göre daha sıcak yönelimli.';
      }
    } else if (
      lightness < 0.48 &&
      cielabChroma < 60 &&
      rednessRatio >= eb.minRednessRatioForFullWarmth
    ) {
      contextFactor = eb.orangishEarthFactor;
      earthContextHint =
        'Zengin turuncumsu kahve / sienna alt tonu; parlak turuncuların altında sıcak bölgede konumlanır.';
    } else if (
      hueDeg >= 30 &&
      cielabChroma < 58 &&
      rednessRatio < 0.2
    ) {
      contextFactor = 0.84;
      earthContextHint =
        'Okra / sarımsı toprak alt tonu; kızıl-turuncu tonlara göre görece daha yumuşak sıcaklık taşır.';
    }
  }

  const thermalStrength = clamp(
    baseChromaticStrength * lightnessFactor * contextFactor,
    0.08,
    1.0
  );
  const rawWarmth = 50 + 50 * huePolarity * thermalStrength;
  const warmthScore = Math.round(clamp(rawWarmth, 0, 100));

  let categoryId: TemperatureCategoryId = 'transitional';
  let labelTr = categories.transitional.labelTr;
  let legacyTemperature: ColorTemperature = 'Nötr';

  if (warmthScore >= categories.warm.minInclusive) {
    categoryId = 'warm';
    labelTr = categories.warm.labelTr;
    legacyTemperature = 'Sıcak';
  } else if (warmthScore < categories.cool.maxExclusive) {
    categoryId = 'cool';
    labelTr = categories.cool.labelTr;
    legacyTemperature = 'Soğuk';
  } else {
    categoryId = 'transitional';
    labelTr = categories.transitional.labelTr;
    legacyTemperature = 'Nötr';
  }

  const confNumeric =
    0.7 * clamp(cielabChroma / 30, 0, 1) +
    0.3 * clamp(Math.abs(warmthScore - 50) / 35, 0, 1);

  const matchedLevel =
    confidence.levels.find((lv) => {
      const aboveMin =
        lv.minInclusive === undefined || confNumeric >= lv.minInclusive;
      const belowMax =
        lv.maxExclusive === undefined || confNumeric < lv.maxExclusive;
      return aboveMin && belowMax;
    }) ?? confidence.levels[confidence.levels.length - 1];

  const undertoneNote = buildFamilyUndertoneNote(
    family,
    hueDeg,
    false,
    earthContextHint
  );

  return {
    legacyTemperature,
    warmthScore,
    categoryId,
    labelTr,
    confidence: matchedLevel?.id ?? 'medium',
    confidenceLabelTr: matchedLevel?.labelTr ?? 'Orta',
    confidenceNumeric: parseFloat(confNumeric.toFixed(2)),
    cielabChroma,
    hueDeg: Math.round(hueDeg),
    saturation: parseFloat(saturation.toFixed(2)),
    lightness: parseFloat(lightness.toFixed(2)),
    isNeutral: false,
    basis: `Çok boyutlu analiz (${family}): Hue ${Math.round(hueDeg)}°, S_eff=%${Math.round(effectiveSat * 100)}, L=%${Math.round(lightness * 100)}, C*ab=${cielabChroma} (fiziksel Kelvin değildir).`,
    undertoneNote,
  };
}

/**
 * Yüzde paylarını toplamda tam 100.0 olacak şekilde normalize eder.
 */
function normalizeFourBucketShares(
  warmRaw: number,
  coolRaw: number,
  transitionalRaw: number,
  neutralRaw: number
): {
  warmSharePercent: number;
  coolSharePercent: number;
  transitionalSharePercent: number;
  neutralSharePercent: number;
} {
  const total = warmRaw + coolRaw + transitionalRaw + neutralRaw;
  if (total <= 0) {
    return {
      warmSharePercent: 0,
      coolSharePercent: 0,
      transitionalSharePercent: 0,
      neutralSharePercent: 100,
    };
  }

  const buckets = [
    { key: 'warm', val: parseFloat(((warmRaw / total) * 100).toFixed(1)) },
    { key: 'cool', val: parseFloat(((coolRaw / total) * 100).toFixed(1)) },
    {
      key: 'transitional',
      val: parseFloat(((transitionalRaw / total) * 100).toFixed(1)),
    },
    {
      key: 'neutral',
      val: parseFloat(((neutralRaw / total) * 100).toFixed(1)),
    },
  ];

  const roundedSum = parseFloat(
    buckets.reduce((acc, b) => acc + b.val, 0).toFixed(1)
  );
  const diff = parseFloat((100 - roundedSum).toFixed(1));
  if (Math.abs(diff) > 0) {
    const largest = buckets
      .filter((b) => b.val > 0)
      .sort((a, b) => b.val - a.val)[0];
    if (largest) {
      largest.val = parseFloat(clamp(largest.val + diff, 0, 100).toFixed(1));
    }
  }

  return {
    warmSharePercent: buckets[0].val,
    coolSharePercent: buckets[1].val,
    transitionalSharePercent: buckets[2].val,
    neutralSharePercent: buckets[3].val,
  };
}

/**
 * K-Means dominant renklerini yüzde ağırlıklı palet sıcaklık analiziyle zenginleştirir.
 */
export function enrichPaletteWithTemperatureAnalysis(
  dominantColors: DominantColor[],
  spatialRelations?: SpatialTemperatureRelation[]
): PaletteTemperatureAggregation {
  if (!Array.isArray(dominantColors) || dominantColors.length === 0) {
    return {
      dominantColors: [],
      overallTemperature: 'Dengeli / geçişli',
      warmthScoreWeightedMean: null,
      warmSharePercent: 0,
      coolSharePercent: 0,
      transitionalSharePercent: 0,
      neutralSharePercent: 0,
      temperatureSummary: 'Analiz edilecek baskın renk kümesi bulunamadı.',
      temperatureModelVersion: RULES.classificationModel.id,
      spatialTemperatureRelations: spatialRelations,
    };
  }

  // 1. Her renk kümesini JSON çok boyutlu kurallarıyla sınıflandır
  const classifiedList = dominantColors.map((col) => {
    const rgb = resolveSafeRgb(col);
    const weight =
      typeof col.percentage === 'number' &&
      Number.isFinite(col.percentage) &&
      col.percentage > 0
        ? col.percentage
        : 0;

    if (!rgb) {
      const neutralLabel = RULES.classificationModel.categories.neutral.labelTr;
      return {
        original: col,
        weight,
        classified: {
          legacyTemperature: 'Nötr' as ColorTemperature,
          warmthScore: 50,
          categoryId: 'neutral' as TemperatureCategoryId,
          labelTr: neutralLabel,
          confidence: 'low' as TemperatureConfidenceLevel,
          confidenceLabelTr: 'Düşük',
          confidenceNumeric: 0.2,
          cielabChroma: 0,
          hueDeg: 0,
          saturation: 0,
          lightness: 0.5,
          isNeutral: true,
          basis: 'Geçerli RGB/HEX koordinatı bulunamadığından nötr varsayıldı.',
          undertoneNote: buildFamilyUndertoneNote('Nötr', 0, true),
        },
      };
    }

    return {
      original: col,
      weight,
      classified: classifyColorTemperature(
        rgb[0],
        rgb[1],
        rgb[2],
        col.family
      ),
    };
  });

  // Toplam ağırlık 0 ise eşit ağırlık fallback'i
  const totalProvidedWeight = classifiedList.reduce(
    (sum, item) => sum + item.weight,
    0
  );
  const effectiveWeights = classifiedList.map((item) =>
    totalProvidedWeight > 0 ? item.weight : 100 / classifiedList.length
  );

  let warmRaw = 0;
  let coolRaw = 0;
  let transitionalRaw = 0;
  let neutralRaw = 0;
  let chromaticWeightSum = 0;
  let chromaticWeightedScoreSum = 0;

  classifiedList.forEach((item, idx) => {
    const w = effectiveWeights[idx];
    const cat = item.classified.categoryId;
    if (cat === 'warm') warmRaw += w;
    else if (cat === 'cool') coolRaw += w;
    else if (cat === 'transitional') transitionalRaw += w;
    else neutralRaw += w;

    if (!RULES.paletteAggregation.ignoreNeutralForChromaticMean || cat !== 'neutral') {
      chromaticWeightSum += w;
      chromaticWeightedScoreSum += item.classified.warmthScore * w;
    }
  });

  const shares = normalizeFourBucketShares(
    warmRaw,
    coolRaw,
    transitionalRaw,
    neutralRaw
  );

  const warmthScoreWeightedMean =
    chromaticWeightSum > 0
      ? Math.round(chromaticWeightedScoreSum / chromaticWeightSum)
      : null;

  // JSON overallLabels kurallarını sırayla uygula
  let overallTemperature = 'Dengeli / geçişli';

  if (shares.warmSharePercent >= 55) {
    overallTemperature = 'Sıcak ağırlıklı';
  } else if (shares.coolSharePercent >= 55) {
    overallTemperature = 'Soğuk ağırlıklı';
  } else if (shares.neutralSharePercent >= 60) {
    overallTemperature = 'Nötr ağırlıklı / belirsiz';
  } else if (
    Math.abs(shares.warmSharePercent - shares.coolSharePercent) < 12 ||
    (shares.transitionalSharePercent > 0 &&
      shares.transitionalSharePercent >= shares.warmSharePercent &&
      shares.transitionalSharePercent >= shares.coolSharePercent &&
      shares.transitionalSharePercent >= shares.neutralSharePercent)
  ) {
    overallTemperature = 'Dengeli / geçişli';
  } else {
    overallTemperature =
      shares.warmSharePercent > shares.coolSharePercent
        ? 'Hafif sıcak eğilimli'
        : 'Hafif soğuk eğilimli';
  }

  const relCfg = RULES.paletteAggregation.relativeToPalette;
  const enrichedColors: DominantColor[] = classifiedList.map((item) => {
    const { original, classified } = item;

    let relativeToPalette = relCfg.labels.within;
    let relativeToPaletteDelta: number | undefined = undefined;

    if (classified.isNeutral) {
      relativeToPalette = 'Nötr ton (kromatik ortalamaya katılmaz)';
    } else if (warmthScoreWeightedMean !== null) {
      const delta = Math.round(classified.warmthScore - warmthScoreWeightedMean);
      relativeToPaletteDelta = delta;
      if (delta >= relCfg.deltaThreshold) {
        relativeToPalette = relCfg.labels.above;
      } else if (delta <= -relCfg.deltaThreshold) {
        relativeToPalette = relCfg.labels.below;
      } else {
        relativeToPalette = relCfg.labels.within;
      }
    }

    return {
      ...original,
      temperature: classified.legacyTemperature,
      warmthScore: classified.warmthScore,
      temperatureCategory: classified.categoryId,
      temperatureLabel: classified.labelTr,
      temperatureConfidence: classified.confidence,
      temperatureConfidenceLabel: classified.confidenceLabelTr,
      temperatureBasis: classified.basis,
      relativeToPalette,
      relativeToPaletteDelta,
      undertoneNote: classified.undertoneNote,
      cielabChroma: classified.cielabChroma,
    };
  });

  const temperatureSummary =
    warmthScoreWeightedMean === null
      ? `Palet %${shares.neutralSharePercent} düşük doygunluklu nötr tonlardan oluşmaktadır; mutlak sıcak/soğuk yönelim belirsizdir ve çevresel bağlama bağlıdır.`
      : `Alan payları: %${shares.warmSharePercent} sıcak, %${shares.transitionalSharePercent} geçişli, %${shares.coolSharePercent} soğuk, %${shares.neutralSharePercent} nötr · Genel eğilim: ${overallTemperature} · Kromatik ortalama skor: ${warmthScoreWeightedMean}/100 (nötr kümeler hariç yüzdelik alan ağırlıklı ortalama).`;

  return {
    dominantColors: enrichedColors,
    overallTemperature,
    warmthScoreWeightedMean,
    warmSharePercent: shares.warmSharePercent,
    coolSharePercent: shares.coolSharePercent,
    transitionalSharePercent: shares.transitionalSharePercent,
    neutralSharePercent: shares.neutralSharePercent,
    temperatureSummary,
    temperatureModelVersion: RULES.classificationModel.id,
    spatialTemperatureRelations:
      spatialRelations && spatialRelations.length > 0
        ? spatialRelations
        : undefined,
  };
}

/**
 * Eski localStorage veya arşiv kayıtlarını dominantColors üzerinden geriye dönük zenginleştirir.
 * Model sürümü güncel değilse yeni çok boyutlu ağırlıklandırma ile yeniden hesaplar.
 */
export function hydrateLegacyArtworkTemperature(
  artwork: ArtworkMetadata
): ArtworkMetadata {
  if (!artwork.dominantColors || artwork.dominantColors.length === 0) {
    return artwork;
  }

  const alreadyEnriched =
    artwork.temperatureModelVersion === RULES.classificationModel.id &&
    typeof artwork.warmSharePercent === 'number' &&
    artwork.dominantColors.every(
      (c) =>
        typeof c.warmthScore === 'number' &&
        typeof c.temperatureLabel === 'string' &&
        typeof c.relativeToPalette === 'string'
    );

  if (alreadyEnriched) {
    return artwork;
  }

  const enriched = enrichPaletteWithTemperatureAnalysis(
    artwork.dominantColors,
    artwork.spatialTemperatureRelations
  );

  return {
    ...artwork,
    dominantColors: enriched.dominantColors,
    overallTemperature: enriched.overallTemperature,
    warmthScoreWeightedMean: enriched.warmthScoreWeightedMean,
    warmSharePercent: enriched.warmSharePercent,
    coolSharePercent: enriched.coolSharePercent,
    transitionalSharePercent: enriched.transitionalSharePercent,
    neutralSharePercent: enriched.neutralSharePercent,
    temperatureSummary: enriched.temperatureSummary,
    temperatureModelVersion: enriched.temperatureModelVersion,
    spatialTemperatureRelations: enriched.spatialTemperatureRelations,
  };
}
