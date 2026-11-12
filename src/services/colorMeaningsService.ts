/**
 * @file src/services/colorMeaningsService.ts
 * @description Ana renk ailelerinin tarihsel pigment verileri, kaynaklandırılmış kültürel
 * anlamları ve modern kullanım alanlarını sunan servis.
 */

import colorMeaningsData from '../data/colorMeanings.json';
import {
  ColorMeaningEntry,
  ColorMeaningSource,
  ColorMeaningsDataset
} from '../types';

const dataset = colorMeaningsData as ColorMeaningsDataset;

/**
 * Tüm renk ailesi kayıtlarını döndürür.
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
 * Belirli bir renk ID'sine göre kaydı döndürür (örn. 'red', 'blue', 'green').
 */
export function getColorMeaningById(id: string): ColorMeaningEntry | undefined {
  const normId = id.toLowerCase().trim();
  return dataset.colors.find((c) => c.id.toLowerCase() === normId);
}

/**
 * Kaynak ID'sine göre kaynak metnini döndürür (örn. 'S1', 'S4').
 */
export function getSourceById(id: string): ColorMeaningSource | undefined {
  return dataset.sources.find((s) => s.id === id);
}

/**
 * Birden fazla kaynak ID'si için ilgili kaynak nesnelerini listeler.
 */
export function getSourcesForIds(ids: string[]): ColorMeaningSource[] {
  if (!Array.isArray(ids)) return [];
  return ids
    .map((id) => getSourceById(id))
    .filter((s): s is ColorMeaningSource => s !== undefined);
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
    red: 'red',
    mavi: 'blue',
    blue: 'blue',
    yeşil: 'green',
    green: 'green',
    sarı: 'yellow',
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
    nötr: 'black'
  };

  const mappedId = mapping[q];
  if (mappedId) {
    return getColorMeaningById(mappedId);
  }

  return undefined;
}
