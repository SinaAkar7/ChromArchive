/**
 * @file src/services/archiveService.ts
 * @description Dijital görsel arşivi veri yönetimi, localStorage depolama ve JSON dışa aktarım servisi.
 */

import initialArchiveData from '../data/archiveData.json';
import cmaAdditionsRaw from '../data/archive-additions-100-paintings.json';
import archiveColorIndexRaw from '../data/archiveColorIndex.json';
import {
  ArchiveColorIndexEntry,
  ArchiveStatistics,
  ArtworkMetadata,
  CachedArtworkPaletteEntry,
  ColorFamilyStat,
} from '../types';
import { hydrateLegacyArtworkTemperature } from './colorTemperatureService';

const LEGACY_USER_ITEMS_KEY = 'chromarchive_user_items';
export const ARCHIVE_PALETTE_CACHE_KEY = 'chromarchive_archive_palette_cache_v1';

const COLOR_INDEX_BY_OBJECT_ID = new Map<number, ArchiveColorIndexEntry>();
const COLOR_INDEX_BY_ARTWORK_ID = new Map<string, ArchiveColorIndexEntry>();

for (const entry of archiveColorIndexRaw as ArchiveColorIndexEntry[]) {
  if (typeof entry.objectId === 'number') {
    COLOR_INDEX_BY_OBJECT_ID.set(entry.objectId, entry);
  }
  if (typeof entry.artworkId === 'string' && entry.artworkId.trim()) {
    COLOR_INDEX_BY_ARTWORK_ID.set(entry.artworkId.trim(), entry);
  }
}

function normKey(value?: string): string {
  return (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function buildDedupeKeys(item: ArtworkMetadata): string[] {
  const keys: string[] = [];
  if (item.id) keys.push(`id:${normKey(item.id)}`);
  if (typeof item.objectId === 'number') keys.push(`oid:${item.objectId}`);
  if (item.museumRecordId) keys.push(`mrid:${normKey(item.museumRecordId)}`);
  if (item.accessionNumber) {
    const museumName = normKey(item.museum || item.institution || 'met');
    keys.push(`acc:${museumName}::${normKey(item.accessionNumber)}`);
  }
  return keys;
}

function isCustomOrLocalUserEntry(raw: any): boolean {
  if (!raw || typeof raw !== 'object') return true;
  if (raw.isCustom === true) return true;
  if (typeof raw.id === 'string' && raw.id.startsWith('custom_')) return true;
  if (typeof raw.accessionNumber === 'string' && raw.accessionNumber.startsWith('USR-')) {
    return true;
  }
  if (
    typeof raw.imageUrl === 'string' &&
    (raw.imageUrl.startsWith('data:') || raw.imageUrl.startsWith('blob:'))
  ) {
    return true;
  }
  if (
    typeof raw.thumbnailUrl === 'string' &&
    (raw.thumbnailUrl.startsWith('data:') || raw.thumbnailUrl.startsWith('blob:'))
  ) {
    return true;
  }
  const hasMuseumIdentity =
    typeof raw.objectId === 'number' ||
    (typeof raw.museumRecordId === 'string' && raw.museumRecordId.trim().length > 0);
  return !hasMuseumIdentity;
}

/**
 * Kalıcı palet önbelleğini localStorage'dan güvenli biçimde okur.
 * Bozuk JSON veya depolama kısıtlaması uygulamayı çökertmez.
 */
export function loadArtworkPaletteCache(): Record<string, CachedArtworkPaletteEntry> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(ARCHIVE_PALETTE_CACHE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    const validMap: Record<string, CachedArtworkPaletteEntry> = {};
    for (const [key, entry] of Object.entries(parsed as Record<string, unknown>)) {
      if (key.startsWith('custom_')) continue;
      if (
        entry &&
        typeof entry === 'object' &&
        Array.isArray((entry as CachedArtworkPaletteEntry).dominantColors) &&
        (entry as CachedArtworkPaletteEntry).dominantColors.length > 0
      ) {
        validMap[key] = entry as CachedArtworkPaletteEntry;
      }
    }
    return validMap;
  } catch (err) {
    console.warn('Palet önbelleği okunamadı, varsayılan katalog kullanılıyor:', err);
    return {};
  }
}

/**
 * Yalnızca resmî müze kataloğundaki eserlerin gerçek piksel analiz paletini kalıcı önbelleğe kaydeder.
 * Kullanıcı yüklemeleri veya kamera fotoğrafları kesinlikle önbelleğe veya arşive yazılmaz.
 */
export function saveArtworkPaletteToCache(
  artwork: ArtworkMetadata
): { success: boolean; error?: string } {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Tarayıcı depolama ortamı bulunamadı.' };
  }
  if (isCustomOrLocalUserEntry(artwork)) {
    return {
      success: false,
      error: 'Kullanıcı tarafından yüklenen veya kamerayla çekilen görseller arşive kaydedilemez.',
    };
  }
  if (!Array.isArray(artwork.dominantColors) || artwork.dominantColors.length === 0) {
    return { success: false, error: 'Boş renk paleti önbelleğe kaydedilemez.' };
  }

  try {
    const cache = loadArtworkPaletteCache();
    const entry: CachedArtworkPaletteEntry = {
      id: artwork.id,
      dominantColors: artwork.dominantColors,
      overallTemperature: artwork.overallTemperature,
      dominantCount: artwork.dominantColors.length,
      analysisDate: artwork.analysisDate || new Date().toISOString().split('T')[0],
      colorDiversityScore: artwork.colorDiversityScore ?? 50,
      dimensions: artwork.dimensions,
      warmthScoreWeightedMean: artwork.warmthScoreWeightedMean,
      warmSharePercent: artwork.warmSharePercent,
      coolSharePercent: artwork.coolSharePercent,
      transitionalSharePercent: artwork.transitionalSharePercent,
      neutralSharePercent: artwork.neutralSharePercent,
      temperatureSummary: artwork.temperatureSummary,
      temperatureModelVersion: artwork.temperatureModelVersion,
      spatialTemperatureRelations: artwork.spatialTemperatureRelations,
      cachedAt: new Date().toISOString(),
    };

    cache[artwork.id] = entry;
    window.localStorage.setItem(ARCHIVE_PALETTE_CACHE_KEY, JSON.stringify(cache));
    return { success: true };
  } catch (err) {
    console.warn('Palet önbelleğine yazma hatası:', err);
    return {
      success: false,
      error: 'Tarayıcı localStorage kotası dolduğu için palet önbelleğe yazılamadı.',
    };
  }
}

/**
 * Ham arşiv verisini tam ve kararlı ArtworkMetadata modeline dönüştürür.
 */
export function normalizeArchiveItem(
  raw: any,
  paletteCache?: Record<string, CachedArtworkPaletteEntry>
): ArtworkMetadata {
  const objectId =
    typeof raw.objectId === 'number'
      ? raw.objectId
      : raw.id && !isNaN(Number(raw.id))
      ? Number(raw.id)
      : undefined;
  const id = String(raw.id || raw.objectId || Math.random().toString(36).substring(2, 9));

  const hasOwnColors = Array.isArray(raw.dominantColors) && raw.dominantColors.length > 0;
  const cachedEntry =
    !hasOwnColors && paletteCache ? paletteCache[id] : undefined;
  const indexedEntry =
    !hasOwnColors && !cachedEntry
      ? COLOR_INDEX_BY_ARTWORK_ID.get(id) ??
        (typeof objectId === 'number' ? COLOR_INDEX_BY_OBJECT_ID.get(objectId) : undefined)
      : undefined;

  const sourceAnalysis = cachedEntry ?? indexedEntry;
  const dominantColors = hasOwnColors
    ? raw.dominantColors
    : sourceAnalysis?.dominantColors ?? [];

  const isAnalyzed = dominantColors.length > 0;
  const analysisStatus: ArtworkMetadata['analysisStatus'] = isAnalyzed
    ? 'analyzed'
    : raw.analysisStatus === 'failed_image_analysis'
    ? 'failed_image_analysis'
    : 'pending_image_analysis';

  const museumName =
    raw.museum || raw.institution || raw.source || 'The Metropolitan Museum of Art';
  const defaultRecordUrl =
    raw.museumRecordUrl ||
    raw.museumUrl ||
    (objectId ? `https://www.metmuseum.org/art/collection/search/${objectId}` : '');

  const normalized: ArtworkMetadata = {
    id,
    objectId,
    title: raw.title || 'İsimsiz Eser',
    artist: raw.artist || 'Bilinmeyen Sanatçı',
    date: raw.date || raw.year || 'Tarih Belirtilmemiş',
    year: raw.year || raw.date || 'Tarih Belirtilmemiş',
    category: raw.category || raw.period || raw.department || 'Müze Arşivi',
    department: raw.department || 'European Paintings',
    period: raw.period || raw.department || 'Açık Erişim Koleksiyonu',
    institution: museumName,
    museum: museumName,
    museumRecordId: raw.museumRecordId,
    source: raw.source || museumName,
    accessionNumber: raw.accessionNumber || (objectId ? `MET-${objectId}` : 'MET-OA'),
    sourceApiUrl: raw.sourceApiUrl,
    sourceUrl: raw.sourceApiUrl || raw.sourceUrl || defaultRecordUrl,
    museumUrl: defaultRecordUrl,
    museumRecordUrl: defaultRecordUrl,
    license: raw.license || 'Kamu Malı (Public Domain / CC0)',
    rights: raw.rights || raw.license || 'Kamu Malı (Public Domain / CC0)',
    isPublicDomain: raw.isPublicDomain ?? true,
    medium: raw.medium || 'Belirtilmemiş',
    dimensions:
      (cachedEntry?.dimensions && raw.dimensions === undefined
        ? cachedEntry.dimensions
        : raw.dimensions) || 'Müze Arşiv Standartları',
    description:
      raw.description ||
      `${raw.artist || 'Sanatçı'} tarafından ${raw.date || ''} tarihinde üretilen${
        raw.medium ? ` (${raw.medium})` : ''
      }, ${museumName} açık erişim koleksiyonunda yer alan kamu malı eser.`,
    imageUrl: raw.imageUrl,
    thumbnailUrl: raw.thumbnailUrl || raw.imageUrl,
    culture: raw.culture || '',
    tags:
      raw.tags ||
      [raw.department, raw.workFormatLabelTr, raw.museum || 'The Met', 'Open Access'].filter(
        Boolean
      ),
    workType: raw.workType,
    workFormat: raw.workFormat,
    workFormatLabelTr: raw.workFormatLabelTr,
    analysisStatus,
    analysisError: raw.analysisError,
    dominantColors,
    overallTemperature: isAnalyzed
      ? raw.overallTemperature || sourceAnalysis?.overallTemperature || 'Dengeli / geçişli'
      : 'Analiz Bekleniyor',
    dominantCount: dominantColors.length,
    analysisDate: isAnalyzed
      ? raw.analysisDate || sourceAnalysis?.analysisDate || new Date().toISOString().split('T')[0]
      : '',
    colorDiversityScore: isAnalyzed
      ? raw.colorDiversityScore ?? sourceAnalysis?.colorDiversityScore
      : undefined,
    warmthScoreWeightedMean: isAnalyzed
      ? typeof raw.warmthScoreWeightedMean === 'number' || raw.warmthScoreWeightedMean === null
        ? raw.warmthScoreWeightedMean
        : sourceAnalysis?.warmthScoreWeightedMean
      : undefined,
    warmSharePercent: isAnalyzed
      ? typeof raw.warmSharePercent === 'number'
        ? raw.warmSharePercent
        : sourceAnalysis?.warmSharePercent
      : undefined,
    coolSharePercent: isAnalyzed
      ? typeof raw.coolSharePercent === 'number'
        ? raw.coolSharePercent
        : sourceAnalysis?.coolSharePercent
      : undefined,
    transitionalSharePercent: isAnalyzed
      ? typeof raw.transitionalSharePercent === 'number'
        ? raw.transitionalSharePercent
        : sourceAnalysis?.transitionalSharePercent
      : undefined,
    neutralSharePercent: isAnalyzed
      ? typeof raw.neutralSharePercent === 'number'
        ? raw.neutralSharePercent
        : sourceAnalysis?.neutralSharePercent
      : undefined,
    temperatureSummary: isAnalyzed
      ? typeof raw.temperatureSummary === 'string'
        ? raw.temperatureSummary
        : sourceAnalysis?.temperatureSummary
      : undefined,
    temperatureModelVersion: isAnalyzed
      ? typeof raw.temperatureModelVersion === 'string'
        ? raw.temperatureModelVersion
        : sourceAnalysis?.temperatureModelVersion
      : undefined,
    spatialTemperatureRelations: Array.isArray(raw.spatialTemperatureRelations)
      ? raw.spatialTemperatureRelations
      : cachedEntry?.spatialTemperatureRelations,
    fileFormat: raw.fileFormat,
    isCustom: raw.isCustom,
  };

  return isAnalyzed ? hydrateLegacyArtworkTemperature(normalized) : normalized;
}

/**
 * Eski chromarchive_user_items kaydında yer alan kullanıcı yüklemelerini (isCustom: true
 * ve yerel fotoğraf verilerini) temizler; varsa yalnızca resmî müze kayıtlarını korur.
 * Başka localStorage alanlarına (ör. chromarchive_archive_palette_cache_v1) dokunmaz.
 */
function sanitizeLegacyUserItemsStorage(
  paletteCache: Record<string, CachedArtworkPaletteEntry>
): ArtworkMetadata[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LEGACY_USER_ITEMS_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(LEGACY_USER_ITEMS_KEY);
      return [];
    }

    const officialMuseumRaw = parsed.filter((entry) => !isCustomOrLocalUserEntry(entry));
    if (officialMuseumRaw.length !== parsed.length) {
      if (officialMuseumRaw.length === 0) {
        window.localStorage.removeItem(LEGACY_USER_ITEMS_KEY);
      } else {
        window.localStorage.setItem(
          LEGACY_USER_ITEMS_KEY,
          JSON.stringify(officialMuseumRaw)
        );
      }
    }

    return officialMuseumRaw.map((entry) => normalizeArchiveItem(entry, paletteCache));
  } catch (err) {
    console.warn('Eski arşiv depolaması doğrulanamadı:', err);
    return [];
  }
}

/**
 * Başlangıç müze kataloğu (The Met + CMA ek koleksiyonu), doğrulanmış renk indeksi
 * ve kalıcı müze palet önbelleğini tekilliği koruyarak birleştirir.
 */
export function getArchiveItems(): ArtworkMetadata[] {
  const paletteCache = loadArtworkPaletteCache();
  const metRecords = Array.isArray(initialArchiveData) ? initialArchiveData : [];
  const cmaRecords = Array.isArray((cmaAdditionsRaw as { artworks?: unknown[] })?.artworks)
    ? (cmaAdditionsRaw as { artworks: unknown[] }).artworks
    : [];

  const combinedDefaultsRaw = [...metRecords, ...cmaRecords];
  const seenKeys = new Set<string>();
  const normalizedDefault: ArtworkMetadata[] = [];

  for (const rawItem of combinedDefaultsRaw) {
    const item = normalizeArchiveItem(rawItem, paletteCache);
    const keys = buildDedupeKeys(item);
    if (keys.some((k) => seenKeys.has(k))) {
      continue;
    }
    keys.forEach((k) => seenKeys.add(k));
    normalizedDefault.push(item);
  }

  if (typeof window === 'undefined') {
    return normalizedDefault;
  }

  const officialLegacyRecords = sanitizeLegacyUserItemsStorage(paletteCache);
  if (officialLegacyRecords.length === 0) {
    return normalizedDefault;
  }

  const preservedKeySet = new Set<string>();
  officialLegacyRecords.forEach((item) =>
    buildDedupeKeys(item).forEach((k) => preservedKeySet.add(k))
  );

  const dedupedDefault = normalizedDefault.filter(
    (item) => !buildDedupeKeys(item).some((k) => preservedKeySet.has(k))
  );

  return [...officialLegacyRecords, ...dedupedDefault];
}

/**
 * Eser metadata'sını biçimlendirilmiş JSON dosyası olarak indirir.
 */
export function exportMetadataAsJson(
  data: ArtworkMetadata | ArtworkMetadata[],
  filename?: string
): void {
  if (typeof window === 'undefined') return;

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  let defaultName = 'chromarchive_metadata.json';
  if (filename) {
    defaultName = filename.endsWith('.json') ? filename : `${filename}.json`;
  } else if (!Array.isArray(data)) {
    const safeTitle = data.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    defaultName = `chromarchive_${safeTitle}_metadata.json`;
  }

  a.href = url;
  a.download = defaultName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Arşivdeki eserlerin kümülatif renk ve sıcaklık istatistiklerini hesaplar.
 * Paleti eksik/analiz edilmemiş eserler ne nötr renk sayısına ne de çeşitlilik ortalamasına katılır.
 */
export function calculateArchiveStatistics(
  items: ArtworkMetadata[]
): ArchiveStatistics {
  const totalArtworks = items.length;
  if (totalArtworks === 0) {
    return {
      totalArtworks: 0,
      totalColors: 0,
      avgDiversity: 0,
      dominantTemperature: '—',
      warmCount: 0,
      warmPercent: 0,
      coolCount: 0,
      coolPercent: 0,
      neutralCount: 0,
      neutralPercent: 0,
      transitionalCount: 0,
      transitionalPercent: 0,
      analyzedArtworkCount: 0,
      pendingArtworkCount: 0,
      avgWarmthScore: null,
      weightedWarmSharePercent: 0,
      weightedCoolSharePercent: 0,
      weightedTransitionalSharePercent: 0,
      weightedNeutralSharePercent: 0,
      topFamilies: [],
    };
  }

  const analyzedItems = items.filter(
    (item) => Array.isArray(item.dominantColors) && item.dominantColors.length > 0
  );
  const analyzedArtworkCount = analyzedItems.length;
  const pendingArtworkCount = Math.max(0, totalArtworks - analyzedArtworkCount);

  const totalColors = analyzedItems.reduce(
    (sum, item) => sum + item.dominantColors.length,
    0
  );

  const diversityScores = analyzedItems
    .map((item) => item.colorDiversityScore)
    .filter((s): s is number => typeof s === 'number' && Number.isFinite(s));

  const avgDiversity =
    diversityScores.length > 0
      ? Math.round(diversityScores.reduce((sum, s) => sum + s, 0) / diversityScores.length)
      : 0;

  let warmCount = 0;
  let coolCount = 0;
  let transitionalCount = 0;
  let neutralCount = 0;

  let sumWarmShare = 0;
  let sumCoolShare = 0;
  let sumTransitionalShare = 0;
  let sumNeutralShare = 0;
  let warmthScoreSum = 0;
  let warmthScoreCount = 0;

  analyzedItems.forEach((rawItem) => {
    const item = hydrateLegacyArtworkTemperature(rawItem);
    const t = (item.overallTemperature || '').toLowerCase();
    if (t.includes('sıcak')) warmCount++;
    else if (t.includes('soğuk')) coolCount++;
    else if (t.includes('geçişli') || t.includes('dengeli')) transitionalCount++;
    else neutralCount++;

    sumWarmShare += item.warmSharePercent ?? 0;
    sumCoolShare += item.coolSharePercent ?? 0;
    sumTransitionalShare += item.transitionalSharePercent ?? 0;
    sumNeutralShare += item.neutralSharePercent ?? 0;
    if (typeof item.warmthScoreWeightedMean === 'number') {
      warmthScoreSum += item.warmthScoreWeightedMean;
      warmthScoreCount++;
    }
  });

  const denom = analyzedArtworkCount || 1;
  const warmPercent =
    analyzedArtworkCount > 0 ? Math.round((warmCount / denom) * 100) : 0;
  const coolPercent =
    analyzedArtworkCount > 0 ? Math.round((coolCount / denom) * 100) : 0;
  const transitionalPercent =
    analyzedArtworkCount > 0 ? Math.round((transitionalCount / denom) * 100) : 0;
  const neutralPercent =
    analyzedArtworkCount > 0
      ? Math.max(0, 100 - warmPercent - coolPercent - transitionalPercent)
      : 0;

  const dominantTemperature =
    analyzedArtworkCount === 0
      ? '—'
      : warmCount > coolCount && warmCount >= transitionalCount
      ? 'Sıcak ağırlıklı'
      : coolCount > warmCount && coolCount >= transitionalCount
      ? 'Soğuk ağırlıklı'
      : transitionalCount > 0
      ? 'Dengeli / geçişli'
      : 'Nötr ağırlıklı';

  const familyCountMap: Record<string, number> = {};
  analyzedItems.forEach((item) => {
    item.dominantColors.forEach((c) => {
      const fam = c.family || 'Nötr';
      familyCountMap[fam] = (familyCountMap[fam] || 0) + 1;
    });
  });

  const familyColors: Record<string, string> = {
    Mavi: '#2a598c',
    Sarı: '#d8a838',
    Yeşil: '#4a7c59',
    Kırmızı: '#a83838',
    Turuncu: '#c9702c',
    Mor: '#7c5991',
    Nötr: '#78716c',
  };

  const topFamilies: ColorFamilyStat[] = Object.keys(familyCountMap)
    .map((key) => ({
      family: key,
      count: familyCountMap[key],
      percent: Math.round((familyCountMap[key] / (totalColors || 1)) * 100),
      color: familyColors[key] || '#78716c',
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalArtworks,
    totalColors,
    avgDiversity,
    dominantTemperature,
    warmCount,
    warmPercent,
    coolCount,
    coolPercent,
    neutralCount,
    neutralPercent,
    transitionalCount,
    transitionalPercent,
    analyzedArtworkCount,
    pendingArtworkCount,
    avgWarmthScore:
      warmthScoreCount > 0 ? Math.round(warmthScoreSum / warmthScoreCount) : null,
    weightedWarmSharePercent:
      analyzedArtworkCount > 0
        ? parseFloat((sumWarmShare / analyzedArtworkCount).toFixed(1))
        : 0,
    weightedCoolSharePercent:
      analyzedArtworkCount > 0
        ? parseFloat((sumCoolShare / analyzedArtworkCount).toFixed(1))
        : 0,
    weightedTransitionalSharePercent:
      analyzedArtworkCount > 0
        ? parseFloat((sumTransitionalShare / analyzedArtworkCount).toFixed(1))
        : 0,
    weightedNeutralSharePercent:
      analyzedArtworkCount > 0
        ? parseFloat((sumNeutralShare / analyzedArtworkCount).toFixed(1))
        : 0,
    topFamilies,
  };
}
