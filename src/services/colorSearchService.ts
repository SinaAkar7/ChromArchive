/**
 * @file src/services/colorSearchService.ts
 * @description CIELAB + CIEDE2000 (Delta E 2000) tabanlı yerel adlandırılmış renk arama motoru.
 * colors.json veri setini modül yüklenirken bir kez belleğe alır ve CIELAB vektörlerini önceden hesaplar.
 * Harici API çağrısı yapmaz; görüntü K-Means++ analiz motorundan tamamen bağımsız çalışır.
 */

import colorsDatasetRaw from '../data/colors.json';
import type {
  ArtworkColorMatchResult,
  ArtworkMetadata,
  CielabColor,
  ColorDictionaryFamily,
  ColorSearchResult,
  ColorsDataset,
  DominantColor,
  NamedColorEntry,
  RgbObject,
} from '../types';

const DATASET = colorsDatasetRaw as ColorsDataset;

export interface ColorFamilyOption {
  id: ColorDictionaryFamily;
  labelEn: string;
  labelTr: string;
  swatchHex: string;
}

export const COLOR_FAMILY_OPTIONS: ColorFamilyOption[] = [
  { id: 'red', labelEn: 'Red', labelTr: 'Kırmızı', swatchHex: '#C82829' },
  { id: 'orange', labelEn: 'Orange', labelTr: 'Turuncu', swatchHex: '#E07A2B' },
  { id: 'yellow', labelEn: 'Yellow', labelTr: 'Sarı', swatchHex: '#E2B63B' },
  { id: 'green', labelEn: 'Green', labelTr: 'Yeşil', swatchHex: '#4E7A51' },
  { id: 'cyan', labelEn: 'Cyan', labelTr: 'Camgöbeği', swatchHex: '#1F9AA3' },
  { id: 'blue', labelEn: 'Blue', labelTr: 'Mavi', swatchHex: '#2C5AA0' },
  { id: 'purple', labelEn: 'Purple', labelTr: 'Mor', swatchHex: '#6E4C9E' },
  { id: 'pink', labelEn: 'Pink', labelTr: 'Pembe', swatchHex: '#D87093' },
  { id: 'brown', labelEn: 'Brown', labelTr: 'Kahverengi', swatchHex: '#7B4F32' },
  { id: 'beige', labelEn: 'Beige', labelTr: 'Bej', swatchHex: '#D8C7A8' },
  { id: 'gray', labelEn: 'Gray', labelTr: 'Gri', swatchHex: '#80848A' },
  { id: 'black', labelEn: 'Black', labelTr: 'Siyah', swatchHex: '#1B1C1E' },
  { id: 'white', labelEn: 'White', labelTr: 'Beyaz', swatchHex: '#F7F6F2' },
];

export function getFamilyLabelTr(family: ColorDictionaryFamily): string {
  return COLOR_FAMILY_OPTIONS.find((f) => f.id === family)?.labelTr ?? family;
}

export function getFamilyLabelEn(family: ColorDictionaryFamily): string {
  return COLOR_FAMILY_OPTIONS.find((f) => f.id === family)?.labelEn ?? family;
}

/**
 * Normalizes Turkish & English strings for diacritic-insensitive matching.
 */
export function normalizeSearchText(input: string): string {
  return input
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function rgbToHex({ r, g, b }: RgbObject): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0').toUpperCase())
      .join('')
  );
}

export type ColorParseResult =
  | { ok: true; hex: string; rgb: RgbObject }
  | { ok: false; error: string };

/**
 * Validates and parses a HEX input (#RGB or #RRGGBB, with or without leading #).
 */
export function parseHexColorInput(raw: string): ColorParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: 'Lütfen geçerli bir HEX renk kodu girin (örn. #B2AC88).' };
  }

  const body = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  if (!/^[0-9a-fA-F]+$/.test(body)) {
    return {
      ok: false,
      error: `Geçersiz HEX karakteri: "${trimmed}". Yalnızca 0-9 ve A-F karakterleri kullanılabilir.`,
    };
  }

  if (body.length !== 3 && body.length !== 6) {
    return {
      ok: false,
      error: `Geçersiz HEX uzunluğu: "${trimmed}". #RGB (3 hane) veya #RRGGBB (6 hane) biçiminde olmalıdır.`,
    };
  }

  const fullHex =
    body.length === 3
      ? body
          .split('')
          .map((ch) => ch + ch)
          .join('')
          .toUpperCase()
      : body.toUpperCase();

  return {
    ok: true,
    hex: `#${fullHex}`,
    rgb: {
      r: parseInt(fullHex.slice(0, 2), 16),
      g: parseInt(fullHex.slice(2, 4), 16),
      b: parseInt(fullHex.slice(4, 6), 16),
    },
  };
}

/**
 * Validates and parses RGB inputs like "178, 172, 136", "rgb(178, 172, 136)", or "178 172 136".
 */
export function parseRgbColorInput(raw: string): ColorParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: 'Lütfen RGB değeri girin (örn. 178, 172, 136).' };
  }

  const unwrapped = trimmed.replace(/^rgba?\s*\(/i, '').replace(/\)$/i, '').trim();
  const parts = unwrapped.split(/[\s,;]+/).filter(Boolean);

  if (parts.length !== 3) {
    return {
      ok: false,
      error: `Geçersiz RGB biçimi: "${trimmed}". Üç tam sayı girin (örn. 178, 172, 136).`,
    };
  }

  const nums = parts.map((p) => {
    if (!/^-?\d+$/.test(p)) return NaN;
    return Number(p);
  });

  if (nums.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return {
      ok: false,
      error: 'RGB bileşenleri 0 ile 255 arasında tam sayılar olmalıdır.',
    };
  }

  const rgb: RgbObject = { r: nums[0], g: nums[1], b: nums[2] };
  return {
    ok: true,
    hex: rgbToHex(rgb),
    rgb,
  };
}

/**
 * Converts sRGB (0..255) to CIE L*a*b* (D65 / 2° standard observer).
 */
export function rgbToCielab({ r, g, b }: RgbObject): CielabColor {
  // 1. sRGB to linear RGB
  const toLinear = (c: number): number => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const rl = toLinear(r);
  const gl = toLinear(g);
  const bl = toLinear(b);

  // 2. Linear RGB to CIE XYZ (D65, scaled 0..100)
  const x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) * 100;
  const y = (rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750) * 100;
  const z = (rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041) * 100;

  // D65 reference white
  const refX = 95.047;
  const refY = 100.0;
  const refZ = 108.883;

  // 3. CIE XYZ to CIELAB
  const f = (t: number): number =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;

  const fx = f(x / refX);
  const fy = f(y / refY);
  const fz = f(z / refZ);

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

/**
 * Exact CIEDE2000 (Delta E 2000) perceptual color difference calculation.
 * Reference: Sharma, Wu, Dalal (2005), "The CIEDE2000 Color-Difference Formula".
 */
export function calculateDeltaE2000(lab1: CielabColor, lab2: CielabColor): number {
  const kL = 1.0;
  const kC = 1.0;
  const kH = 1.0;
  const deg2rad = (deg: number) => (deg * Math.PI) / 180;
  const rad2deg = (rad: number) => (rad * 180) / Math.PI;

  const C1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
  const C2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
  const Cbar = 0.5 * (C1 + C2);

  const Cbar7 = Math.pow(Cbar, 7);
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + Math.pow(25, 7))));

  const a1Prime = (1 + G) * lab1.a;
  const a2Prime = (1 + G) * lab2.a;

  const C1Prime = Math.sqrt(a1Prime * a1Prime + lab1.b * lab1.b);
  const C2Prime = Math.sqrt(a2Prime * a2Prime + lab2.b * lab2.b);

  const computeHPrime = (bVal: number, aPrime: number): number => {
    if (bVal === 0 && aPrime === 0) return 0;
    const h = rad2deg(Math.atan2(bVal, aPrime));
    return h >= 0 ? h : h + 360;
  };

  const h1Prime = computeHPrime(lab1.b, a1Prime);
  const h2Prime = computeHPrime(lab2.b, a2Prime);

  const dLPrime = lab2.L - lab1.L;
  const dCPrime = C2Prime - C1Prime;

  let dhPrime = 0;
  if (C1Prime * C2Prime !== 0) {
    const diff = h2Prime - h1Prime;
    if (Math.abs(diff) <= 180) dhPrime = diff;
    else if (diff > 180) dhPrime = diff - 360;
    else dhPrime = diff + 360;
  }

  const dHPrime = 2 * Math.sqrt(C1Prime * C2Prime) * Math.sin(deg2rad(dhPrime / 2));

  const LbarPrime = 0.5 * (lab1.L + lab2.L);
  const CbarPrime = 0.5 * (C1Prime + C2Prime);

  let hbarPrime = 0;
  if (C1Prime * C2Prime === 0) {
    hbarPrime = h1Prime + h2Prime;
  } else {
    const sum = h1Prime + h2Prime;
    if (Math.abs(h1Prime - h2Prime) <= 180) hbarPrime = sum / 2;
    else if (sum < 360) hbarPrime = (sum + 360) / 2;
    else hbarPrime = (sum - 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos(deg2rad(hbarPrime - 30)) +
    0.24 * Math.cos(deg2rad(2 * hbarPrime)) +
    0.32 * Math.cos(deg2rad(3 * hbarPrime + 6)) -
    0.2 * Math.cos(deg2rad(4 * hbarPrime - 63));

  const dTheta = 30 * Math.exp(-Math.pow((hbarPrime - 275) / 25, 2));
  const CbarPrime7 = Math.pow(CbarPrime, 7);
  const RC = 2 * Math.sqrt(CbarPrime7 / (CbarPrime7 + Math.pow(25, 7)));

  const LbarPrimeMinus50Sq = Math.pow(LbarPrime - 50, 2);
  const SL = 1 + (0.015 * LbarPrimeMinus50Sq) / Math.sqrt(20 + LbarPrimeMinus50Sq);
  const SC = 1 + 0.045 * CbarPrime;
  const SH = 1 + 0.015 * CbarPrime * T;
  const RT = -Math.sin(deg2rad(2 * dTheta)) * RC;

  const termL = dLPrime / (kL * SL);
  const termC = dCPrime / (kC * SC);
  const termH = dHPrime / (kH * SH);

  return Math.sqrt(termL * termL + termC * termC + termH * termH + RT * termC * termH);
}

export function getPerceptualSimilarityLabel(deltaE: number): string {
  if (deltaE < 1.0) return 'Birebir Eşleşme';
  if (deltaE < 2.5) return 'Çok Yakın';
  if (deltaE < 6.0) return 'Yakın Ton';
  if (deltaE < 12.0) return 'Benzer';
  return 'Uzak Ton';
}

interface IndexedColorEntry {
  entry: NamedColorEntry;
  lab: CielabColor;
  normalizedName: string;
  normalizedTokens: string;
}

// Precompute CIELAB and normalized search fields ONCE on startup in memory
const INDEXED_COLORS: IndexedColorEntry[] = (DATASET.colors || []).map((entry) => {
  const lab = rgbToCielab(entry.rgb);
  const normalizedName = normalizeSearchText(entry.name);
  const familyTr = normalizeSearchText(getFamilyLabelTr(entry.family));
  const normalizedTokens = [
    normalizedName,
    entry.hex.toLowerCase(),
    entry.family,
    familyTr,
    ...(entry.tags || []).map((t) => normalizeSearchText(t)),
  ].join(' ');

  return {
    entry,
    lab,
    normalizedName,
    normalizedTokens,
  };
});

export function getColorsDatasetSummary() {
  return {
    totalColors: INDEXED_COLORS.length,
    sources: DATASET.dataset.sources,
    familyCounts: COLOR_FAMILY_OPTIONS.reduce<Record<string, number>>((acc, fam) => {
      acc[fam.id] = INDEXED_COLORS.filter((c) => c.entry.family === fam.id).length;
      return acc;
    }, {}),
  };
}

/**
 * Finds the top N nearest colors in CIELAB space using Delta E 2000.
 */
export function findNearestColorsByRgb(
  targetRgb: RgbObject,
  options?: {
    family?: ColorDictionaryFamily | 'all';
    limit?: number;
  }
): ColorSearchResult[] {
  const family = options?.family ?? 'all';
  const limit = options?.limit ?? 10;
  const targetLab = rgbToCielab(targetRgb);

  const pool =
    family === 'all'
      ? INDEXED_COLORS
      : INDEXED_COLORS.filter((item) => item.entry.family === family);

  return pool
    .map((item) => {
      const deltaE = calculateDeltaE2000(targetLab, item.lab);
      return {
        color: item.entry,
        lab: item.lab,
        deltaE: Number(deltaE.toFixed(2)),
        similarityLabel: getPerceptualSimilarityLabel(deltaE),
      };
    })
    .sort((a, b) => a.deltaE - b.deltaE)
    .slice(0, limit);
}

/**
 * Searches colors by name, Turkish alias, tag, or HEX substring, optionally filtered by family.
 * Computes Delta E 2000 relative to targetRgb (or first matched color if none given).
 */
export function searchColorsByNameOrTags(
  query: string,
  options?: {
    family?: ColorDictionaryFamily | 'all';
    referenceRgb?: RgbObject;
    limit?: number;
  }
): ColorSearchResult[] {
  const family = options?.family ?? 'all';
  const limit = options?.limit ?? 30;
  const normQuery = normalizeSearchText(query);

  const pool =
    family === 'all'
      ? INDEXED_COLORS
      : INDEXED_COLORS.filter((item) => item.entry.family === family);

  if (!normQuery) {
    const refLab = options?.referenceRgb ? rgbToCielab(options.referenceRgb) : null;
    return pool
      .map((item) => {
        const deltaE = refLab ? calculateDeltaE2000(refLab, item.lab) : 0;
        return {
          color: item.entry,
          lab: item.lab,
          deltaE: Number(deltaE.toFixed(2)),
          similarityLabel: refLab ? getPerceptualSimilarityLabel(deltaE) : item.entry.family,
        };
      })
      .sort((a, b) => (refLab ? a.deltaE - b.deltaE : a.color.name.localeCompare(b.color.name, 'en')))
      .slice(0, limit);
  }

  // Score matches: exact name (0) -> startsWith name (1) -> word boundary match (2) -> tag/substring (3)
  const scored: Array<{ item: IndexedColorEntry; rank: number }> = [];
  for (const item of pool) {
    if (item.normalizedName === normQuery) {
      scored.push({ item, rank: 0 });
    } else if (item.normalizedName.startsWith(normQuery)) {
      scored.push({ item, rank: 1 });
    } else if (item.normalizedName.includes(normQuery)) {
      scored.push({ item, rank: 2 });
    } else if (item.normalizedTokens.includes(normQuery)) {
      scored.push({ item, rank: 3 });
    }
  }

  if (scored.length === 0) {
    return [];
  }

  // Use top match's CIELAB (or provided referenceRgb) to display meaningful Delta E distances
  const anchorLab = options?.referenceRgb
    ? rgbToCielab(options.referenceRgb)
    : scored.sort((a, b) => a.rank - b.rank)[0].item.lab;

  return scored
    .map(({ item, rank }) => {
      const deltaE = calculateDeltaE2000(anchorLab, item.lab);
      return {
        rank,
        result: {
          color: item.entry,
          lab: item.lab,
          deltaE: Number(deltaE.toFixed(2)),
          similarityLabel: getPerceptualSimilarityLabel(deltaE),
        },
      };
    })
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      if (a.result.deltaE !== b.result.deltaE) return a.result.deltaE - b.result.deltaE;
      return a.result.color.name.localeCompare(b.result.color.name, 'en');
    })
    .slice(0, limit)
    .map((x) => x.result);
}

/**
 * Returns a single color entry if exact HEX or exact name matches.
 */
export function findExactColorMatch(hexOrName: string): NamedColorEntry | null {
  const normHex = parseHexColorInput(hexOrName);
  if (normHex.ok) {
    const byHex = INDEXED_COLORS.find((c) => c.entry.hex === normHex.hex);
    if (byHex) return byHex.entry;
  }
  const normName = normalizeSearchText(hexOrName);
  if (!normName) return null;
  return INDEXED_COLORS.find((c) => c.normalizedName === normName)?.entry ?? null;
}

function resolveDominantColorRgb(color: DominantColor): RgbObject | null {
  if (
    Array.isArray(color.rgb) &&
    color.rgb.length >= 3 &&
    color.rgb.every((n) => typeof n === 'number' && !Number.isNaN(n))
  ) {
    return { r: color.rgb[0], g: color.rgb[1], b: color.rgb[2] };
  }
  if (typeof color.hex === 'string') {
    const parsed = parseHexColorInput(color.hex);
    if (parsed.ok) return parsed.rgb;
  }
  return null;
}

/**
 * Matches analyzed archive artworks against a target RGB color using CIELAB + CIEDE2000 (Delta E 2000).
 * Artworks with missing or empty dominantColors are strictly excluded (never fabricated).
 */
export function findMatchingArtworksByRgb(
  targetRgb: RgbObject,
  artworks: ArtworkMetadata[],
  options?: {
    limit?: number;
    maxDeltaE?: number;
  }
): ArtworkColorMatchResult[] {
  if (!Array.isArray(artworks) || artworks.length === 0) {
    return [];
  }

  const targetLab = rgbToCielab(targetRgb);
  const matches: ArtworkColorMatchResult[] = [];

  for (const artwork of artworks) {
    if (!Array.isArray(artwork.dominantColors) || artwork.dominantColors.length === 0) {
      continue;
    }

    let bestColor: DominantColor | null = null;
    let minDeltaE = Infinity;

    for (const domColor of artwork.dominantColors) {
      const colRgb = resolveDominantColorRgb(domColor);
      if (!colRgb) continue;

      const deltaE = calculateDeltaE2000(targetLab, rgbToCielab(colRgb));
      if (
        deltaE < minDeltaE ||
        (Math.abs(deltaE - minDeltaE) < 1e-6 &&
          bestColor &&
          (domColor.percentage ?? 0) > (bestColor.percentage ?? 0))
      ) {
        minDeltaE = deltaE;
        bestColor = domColor;
      }
    }

    if (!bestColor || !Number.isFinite(minDeltaE)) {
      continue;
    }

    if (typeof options?.maxDeltaE === 'number' && minDeltaE > options.maxDeltaE) {
      continue;
    }

    const roundedDeltaE = Number(minDeltaE.toFixed(2));
    matches.push({
      artwork,
      closestColor: bestColor,
      deltaE: roundedDeltaE,
      similarityLabel: getPerceptualSimilarityLabel(roundedDeltaE),
    });
  }

  matches.sort((a, b) => {
    if (a.deltaE !== b.deltaE) return a.deltaE - b.deltaE;
    return (b.closestColor.percentage ?? 0) - (a.closestColor.percentage ?? 0);
  });

  if (typeof options?.limit === 'number' && options.limit > 0) {
    return matches.slice(0, options.limit);
  }

  return matches;
}

