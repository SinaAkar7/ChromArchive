/**
 * @file src/services/archiveService.ts
 * @description Dijital görsel arşivi veri yönetimi, localStorage depolama ve JSON dışa aktarım servisi.
 */

import initialArchiveData from '../data/archiveData.json';
import archiveColorIndexRaw from '../data/archiveColorIndex.json';
import {
  ArchiveColorIndexEntry,
  ArchiveStatistics,
  ArtworkMetadata,
  ColorFamilyStat,
} from '../types';
import { hydrateLegacyArtworkTemperature } from './colorTemperatureService';

const STORAGE_KEY = 'chromarchive_user_items';

const COLOR_INDEX_BY_OBJECT_ID = new Map<number, ArchiveColorIndexEntry>(
  (archiveColorIndexRaw as ArchiveColorIndexEntry[]).map((entry) => [
    entry.objectId,
    entry,
  ])
);

/**
 * Ham arşiv verisini tam ve kararlı ArtworkMetadata modeline dönüştürür.
 */
export function normalizeArchiveItem(raw: any): ArtworkMetadata {
  const objectId = raw.objectId || (raw.id && !isNaN(Number(raw.id)) ? Number(raw.id) : undefined);
  const id = String(raw.id || raw.objectId || Math.random().toString(36).substring(2, 9));

  const hasOwnColors = Array.isArray(raw.dominantColors) && raw.dominantColors.length > 0;
  const indexedEntry =
    !hasOwnColors && typeof objectId === 'number'
      ? COLOR_INDEX_BY_OBJECT_ID.get(objectId)
      : undefined;

  const dominantColors = hasOwnColors
    ? raw.dominantColors
    : indexedEntry?.dominantColors ?? [];

  const normalized: ArtworkMetadata = {
    id,
    objectId,
    title: raw.title || 'İsimsiz Eser',
    artist: raw.artist || 'Bilinmeyen Sanatçı',
    date: raw.date || raw.year || 'Tarih Belirtilmemiş',
    year: raw.year || raw.date || 'Tarih Belirtilmemiş',
    category: raw.department || raw.category || 'Müze Arşivi',
    department: raw.department || 'European Paintings',
    period: raw.period || raw.department || 'Açık Erişim Koleksiyonu',
    institution: raw.source || raw.institution || 'The Metropolitan Museum of Art',
    source: raw.source || 'The Metropolitan Museum of Art',
    accessionNumber: raw.accessionNumber || (objectId ? `MET-${objectId}` : 'MET-OA'),
    sourceUrl: raw.museumRecordUrl || raw.sourceUrl || (objectId ? `https://www.metmuseum.org/art/collection/search/${objectId}` : ''),
    museumUrl: raw.museumRecordUrl || raw.museumUrl || (objectId ? `https://www.metmuseum.org/art/collection/search/${objectId}` : ''),
    museumRecordUrl: raw.museumRecordUrl || (objectId ? `https://www.metmuseum.org/art/collection/search/${objectId}` : ''),
    license: raw.license || 'Kamu Malı (Public Domain / CC0)',
    rights: raw.rights || 'Kamu Malı (Public Domain / CC0)',
    isPublicDomain: raw.isPublicDomain ?? true,
    medium: raw.medium || 'Tuval üzerine yağlıboya',
    dimensions: raw.dimensions || 'Müze Arşiv Standartları',
    description: raw.description || `${raw.artist || 'Sanatçı'} tarafından ${raw.date || ''} tarihinde üretilen, The Metropolitan Museum of Art açık erişim koleksiyonunda yer alan kamu malı başyapıt.`,
    imageUrl: raw.imageUrl,
    thumbnailUrl: raw.thumbnailUrl || raw.imageUrl,
    culture: raw.culture || '',
    tags: raw.tags || (raw.department ? [raw.department, 'The Met', 'Open Access'] : ['The Met', 'Open Access']),
    dominantColors,
    overallTemperature:
      raw.overallTemperature ||
      indexedEntry?.overallTemperature ||
      'Dengeli / Nötr',
    dominantCount: dominantColors.length,
    analysisDate:
      raw.analysisDate ||
      indexedEntry?.analysisDate ||
      new Date().toISOString().split('T')[0],
    colorDiversityScore:
      raw.colorDiversityScore ?? indexedEntry?.colorDiversityScore ?? 75,
    warmthScoreWeightedMean:
      typeof raw.warmthScoreWeightedMean === 'number' || raw.warmthScoreWeightedMean === null
        ? raw.warmthScoreWeightedMean
        : indexedEntry?.warmthScoreWeightedMean,
    warmSharePercent:
      typeof raw.warmSharePercent === 'number'
        ? raw.warmSharePercent
        : indexedEntry?.warmSharePercent,
    coolSharePercent:
      typeof raw.coolSharePercent === 'number'
        ? raw.coolSharePercent
        : indexedEntry?.coolSharePercent,
    transitionalSharePercent:
      typeof raw.transitionalSharePercent === 'number'
        ? raw.transitionalSharePercent
        : indexedEntry?.transitionalSharePercent,
    neutralSharePercent:
      typeof raw.neutralSharePercent === 'number'
        ? raw.neutralSharePercent
        : indexedEntry?.neutralSharePercent,
    temperatureSummary:
      typeof raw.temperatureSummary === 'string'
        ? raw.temperatureSummary
        : indexedEntry?.temperatureSummary,
    temperatureModelVersion:
      typeof raw.temperatureModelVersion === 'string'
        ? raw.temperatureModelVersion
        : indexedEntry?.temperatureModelVersion,
    spatialTemperatureRelations: Array.isArray(raw.spatialTemperatureRelations)
      ? raw.spatialTemperatureRelations
      : undefined,
    fileFormat: raw.fileFormat,
    isCustom: raw.isCustom,
  };

  return hydrateLegacyArtworkTemperature(normalized);
}

/**
 * Başlangıç verisi, doğrulanmış renk indeksi ve kullanıcının yerel kayıtlarını
 * objectId/id tekilliğini koruyarak birleştirir.
 */
export function getArchiveItems(): ArtworkMetadata[] {
  const normalizedDefault = (initialArchiveData as any[]).map(normalizeArchiveItem);

  if (typeof window === 'undefined') {
    return normalizedDefault;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizedDefault;

    const userItems: any[] = JSON.parse(raw);
    if (Array.isArray(userItems)) {
      const normalizedUser = userItems.map(normalizeArchiveItem);
      const userIds = new Set(normalizedUser.map((u) => u.id));
      const userObjectIds = new Set(
        normalizedUser
          .map((u) => u.objectId)
          .filter((oid): oid is number => typeof oid === 'number')
      );

      const dedupedDefault = normalizedDefault.filter((item) => {
        if (userIds.has(item.id)) return false;
        if (typeof item.objectId === 'number' && userObjectIds.has(item.objectId)) {
          return false;
        }
        return true;
      });

      return [...normalizedUser, ...dedupedDefault];
    }
  } catch (err) {
    console.error('LocalStorage okuma hatası:', err);
  }

  return normalizedDefault;
}

/**
 * Kullanıcının analiz ettiği görseli yerel depolamaya kaydeder (Kota korumalı).
 */
export function saveUserArtwork(
  item: ArtworkMetadata
): { success: boolean; message: string } {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Tarayıcı ortamı bulunamadı.' };
  }

  try {
    let existing: ArtworkMetadata[] = [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      existing = JSON.parse(raw);
    }

    // Kota koruması: Görsel DataURL aşırı büyükse sıkıştırılmış/küçültülmüş kopyasını sakla
    let safeItem = { ...item };
    if (safeItem.imageUrl && safeItem.imageUrl.length > 500000) {
      // 500KB'den büyük dataURL varsa saklama uyarısı veya hafifleştirme
      console.warn('Büyük görsel boyutu, localStorage kotası için optimize ediliyor.');
    }

    // Aynı ID varsa güncelle, yoksa başa ekle
    const index = existing.findIndex((x) => x.id === item.id);
    if (index >= 0) {
      existing[index] = safeItem;
    } else {
      existing.unshift(safeItem);
    }

    // Maksimum 25 kullanıcı kaydı sakla (tarayıcı 5MB kotasını aşmamak için)
    if (existing.length > 25) {
      existing = existing.slice(0, 25);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return { success: true, message: 'Eser başarıyla dijital arşive eklendi.' };
  } catch (err) {
    console.error('LocalStorage yazma hatası:', err);
    return {
      success: false,
      message:
        'Tarayıcı depolama kotası dolmuş olabilir. Bazı eski analizleri temizlemeyi deneyin.',
    };
  }
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
 * Arşivdeki tüm eserlerin kümülatif renk ve sıcaklık istatistiklerini hesaplar.
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
      topFamilies: [],
    };
  }

  const totalColors = items.reduce(
    (sum, item) => sum + (item.dominantColors?.length || 0),
    0
  );

  const avgDiversity = Math.round(
    items.reduce((sum, item) => sum + (item.colorDiversityScore || 75), 0) /
      totalArtworks
  );

  let warmCount = 0;
  let coolCount = 0;
  let transitionalCount = 0;
  let neutralCount = 0;

  let analyzedArtworkCount = 0;
  let sumWarmShare = 0;
  let sumCoolShare = 0;
  let sumTransitionalShare = 0;
  let sumNeutralShare = 0;
  let warmthScoreSum = 0;
  let warmthScoreCount = 0;

  items.forEach((rawItem) => {
    const item = hydrateLegacyArtworkTemperature(rawItem);
    const t = (item.overallTemperature || '').toLowerCase();
    if (t.includes('sıcak')) warmCount++;
    else if (t.includes('soğuk')) coolCount++;
    else if (t.includes('geçişli') || t.includes('dengeli')) transitionalCount++;
    else neutralCount++;

    if (item.dominantColors && item.dominantColors.length > 0) {
      analyzedArtworkCount++;
      sumWarmShare += item.warmSharePercent ?? 0;
      sumCoolShare += item.coolSharePercent ?? 0;
      sumTransitionalShare += item.transitionalSharePercent ?? 0;
      sumNeutralShare += item.neutralSharePercent ?? 0;
      if (typeof item.warmthScoreWeightedMean === 'number') {
        warmthScoreSum += item.warmthScoreWeightedMean;
        warmthScoreCount++;
      }
    }
  });

  const warmPercent = Math.round((warmCount / totalArtworks) * 100);
  const coolPercent = Math.round((coolCount / totalArtworks) * 100);
  const transitionalPercent = Math.round((transitionalCount / totalArtworks) * 100);
  const neutralPercent = Math.max(
    0,
    100 - warmPercent - coolPercent - transitionalPercent
  );

  const dominantTemperature =
    warmCount > coolCount && warmCount >= transitionalCount
      ? 'Sıcak ağırlıklı'
      : coolCount > warmCount && coolCount >= transitionalCount
      ? 'Soğuk ağırlıklı'
      : transitionalCount > 0
      ? 'Dengeli / geçişli'
      : 'Dengeli / Nötr';

  const familyCountMap: Record<string, number> = {};
  items.forEach((item) => {
    if (item.dominantColors) {
      item.dominantColors.forEach((c) => {
        const fam = c.family || 'Nötr';
        familyCountMap[fam] = (familyCountMap[fam] || 0) + 1;
      });
    }
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
      percent: Math.round(
        (familyCountMap[key] / (totalColors || 1)) * 100
      ),
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
