/**
 * @file src/services/colorMeaningsService.ts
 * @description Ana renk ailelerinin tarihsel pigment verileri, kaynaklandırılmış kültürel
 * anlamları ve K-Means++ analiz sonuçlarıyla CIELAB + Delta E 2000 üzerinden tarihsel eşleştirme servisi.
 */

import colorMeaningsData from '../data/colorMeanings.json';
import {
  ColorDictionaryFamily,
  ColorHistoricalInsight,
  ColorMeaningEntry,
  ColorMeaningSource,
  ColorMeaningsDataset,
  DominantColor,
  RgbObject,
} from '../types';
import {
  findNearestColorsByRgb,
  parseHexColorInput,
  rgbToHex,
} from './colorSearchService';

const dataset = colorMeaningsData as ColorMeaningsDataset;

/**
 * Tüm renk ailesi kayıtlarını döndürür (11 temel renk ailesi).
 */
export function getColorMeanings(): ColorMeaningEntry[] {
  return dataset.colors || [];
}

/**
 * Veri setinin genel bilgilerini ve kaynaklarını döndürür.
 */
export function getColorMeaningsDataset(): ColorMeaningsDataset {
  return dataset;
}

/**
 * Belirli bir renk ID'sine göre kaydı döndürür (örn. 'red', 'blue', 'green', 'gray').
 */
export function getColorMeaningById(id: string): ColorMeaningEntry | undefined {
  if (!id) return undefined;
  const normId = id.toLowerCase().trim();
  return dataset.colors.find((c) => c.id.toLowerCase() === normId);
}

/**
 * Kaynak ID'sine göre kaynak metnini döndürür (örn. 'S1', 'S11').
 */
export function getSourceById(id: string): ColorMeaningSource | undefined {
  return dataset.sources.find((s) => s.id === id);
}

/**
 * Birden fazla kaynak ID'si için ilgili kaynak nesnelerini benzersiz biçimde listeler.
 */
export function getSourcesForIds(ids: string[]): ColorMeaningSource[] {
  if (!Array.isArray(ids)) return [];
  const uniqueIds = Array.from(new Set(ids));
  return uniqueIds
    .map((id) => getSourceById(id))
    .filter((s): s is ColorMeaningSource => s !== undefined);
}

/**
 * Bir ColorMeaningEntry kaydındaki tüm tarihsel, pigment ve kültürel kaynakları toplar.
 */
export function getAllSourcesForEntry(entry: ColorMeaningEntry): ColorMeaningSource[] {
  const ids = [
    ...(entry.historicalContext || []).flatMap((h) => h.sourceIds || []),
    ...(entry.historicalPigments || []).flatMap((p) => p.sourceIds || []),
    ...(entry.meaningShifts || []).flatMap((m) => m.sourceIds || []),
    ...(entry.documentedMeanings || []).flatMap((d) => d.sourceIds || []),
  ];
  return getSourcesForIds(ids);
}

/**
 * Türkçe veya İngilizce renk adı, renk ailesi veya koduna göre eşleşen kaydı bulur.
 */
export function getColorMeaningByQuery(query: string): ColorMeaningEntry | undefined {
  if (!query) return undefined;
  const q = query.toLowerCase().trim();

  // 1. Doğrudan id eşleşmesi
  const byId = dataset.colors.find((c) => c.id.toLowerCase() === q);
  if (byId) return byId;

  // 2. Türkçe veya İngilizce ad eşleşmesi
  const byName = dataset.colors.find(
    (c) =>
      c.name.tr.toLowerCase() === q ||
      c.name.en.toLowerCase() === q ||
      c.name.tr.toLowerCase().includes(q) ||
      c.name.en.toLowerCase().includes(q)
  );
  if (byName) return byName;

  // 3. Renk ailesi haritası
  const mapping: Record<string, string> = {
    kırmızı: 'red',
    kirmizi: 'red',
    red: 'red',
    mavi: 'blue',
    blue: 'blue',
    yeşil: 'green',
    yesil: 'green',
    green: 'green',
    sarı: 'yellow',
    sari: 'yellow',
    yellow: 'yellow',
    siyah: 'black',
    black: 'black',
    beyaz: 'white',
    white: 'white',
    mor: 'purple',
    purple: 'purple',
    turuncu: 'orange',
    orange: 'orange',
    kahverengi: 'brown',
    brown: 'brown',
    pembe: 'pink',
    pink: 'pink',
    gri: 'gray',
    gray: 'gray',
    grey: 'gray',
    camgöbeği: 'blue',
    cyan: 'blue',
    bej: 'brown',
    beige: 'brown',
    nötr: 'gray',
  };

  const mappedId = mapping[q];
  if (mappedId) {
    return getColorMeaningById(mappedId);
  }

  return undefined;
}

/**
 * 13 sözlük ailesini ve HSL özelliklerini 11 tarihsel renk ailesine eşler.
 */
function resolveHistoricalFamilyId(
  dictFamily: ColorDictionaryFamily | undefined,
  hsl: { h: number; s: number; l: number } | undefined,
  fallbackDominant: DominantColor
): string {
  if (dictFamily) {
    switch (dictFamily) {
      case 'red':
      case 'blue':
      case 'yellow':
      case 'green':
      case 'purple':
      case 'orange':
      case 'black':
      case 'white':
      case 'brown':
      case 'pink':
      case 'gray':
        return dictFamily;
      case 'cyan':
        return hsl && hsl.h < 176 ? 'green' : 'blue';
      case 'beige':
        if (hsl && hsl.l >= 89 && hsl.s <= 26) return 'white';
        if (hsl && hsl.h >= 44 && hsl.s >= 40) return 'yellow';
        return 'brown';
    }
  }

  // Sözlük eşleşmesi bulunamazsa K-Means renk adı / ailesi üzerinden yedek eşleme
  const lowerName = (fallbackDominant.name || '').toLowerCase();
  if (lowerName.includes('kahve') || lowerName.includes('umber') || lowerName.includes('toprak')) {
    return 'brown';
  }
  if (lowerName.includes('pembe') || lowerName.includes('gül')) {
    return 'pink';
  }
  if (lowerName.includes('kömür') || lowerName.includes('gece') || lowerName.includes('siyah')) {
    return 'black';
  }
  if (lowerName.includes('beyaz') || lowerName.includes('tebeşir') || lowerName.includes('alabaster')) {
    return 'white';
  }
  if (lowerName.includes('gri') || lowerName.includes('antrasit')) {
    return 'gray';
  }

  return getColorMeaningByQuery(fallbackDominant.family || fallbackDominant.name)?.id ?? 'gray';
}

/**
 * Analiz edilen bir baskın rengi (HEX + RGB) CIELAB ve Delta E 2000 ile sözlükteki en yakın
 * adlandırılmış renklere eşler ve ilgili tarihsel renk ailesi kayıtlarıyla birleştirir.
 */
export function analyzeDominantColorWithHistory(
  dominantColor: DominantColor
): ColorHistoricalInsight {
  // 1. HEX doğrulama ve güvenli RGB çıkarımı
  const parsedHex = parseHexColorInput(dominantColor.hex || '');
  const safeRgb: RgbObject = parsedHex.ok
    ? parsedHex.rgb
    : {
        r: Math.max(0, Math.min(255, Math.round(dominantColor.rgb?.[0] ?? 0))),
        g: Math.max(0, Math.min(255, Math.round(dominantColor.rgb?.[1] ?? 0))),
        b: Math.max(0, Math.min(255, Math.round(dominantColor.rgb?.[2] ?? 0))),
      };
  const safeHex = parsedHex.ok ? parsedHex.hex : rgbToHex(safeRgb);

  // 2. CIELAB + Delta E 2000 üzerinden yerel sözlükteki en yakın 3 rengi bul
  const topMatches = findNearestColorsByRgb(safeRgb, { limit: 3 });
  const nearestMatch = topMatches[0] ?? null;

  // 3. Uygun 11 tarihsel renk ailesinden birine yönlendir
  const matchedMeaningId = resolveHistoricalFamilyId(
    nearestMatch?.color.family,
    nearestMatch?.color.hsl,
    dominantColor
  );
  const meaningEntry = getColorMeaningById(matchedMeaningId) ?? null;
  const sources = meaningEntry ? getAllSourcesForEntry(meaningEntry) : [];

  const approximationNote = nearestMatch
    ? `Tespit edilen ${safeHex} dijital piksel rengi, CIELAB uzayında Delta E 2000 (ΔE = ${nearestMatch.deltaE.toFixed(
        2
      )}) ölçütüyle "${nearestMatch.color.name}" (${nearestMatch.color.hex}) kaydına en yakın bulunmuştur. Bu eşleşme algısal bir yaklaşımdır; görseldeki rengin kesin kimyasal pigment kanıtı değildir.`
    : `Tespit edilen ${safeHex} dijital piksel rengi için algısal renk ailesi üzerinden tarihsel bağlam sunulmaktadır; kesin pigment kimyası yerine yaklaşık aile eşleşmesi esas alınmıştır.`;

  return {
    dominantColor,
    validatedHex: safeHex,
    validatedRgb: safeRgb,
    nearestDictionaryMatch: nearestMatch,
    topDictionaryMatches: topMatches,
    matchedMeaningId,
    meaningEntry,
    sources,
    approximationNote,
  };
}
