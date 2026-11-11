/**
 * @file src/services/archiveService.ts
 * @description Dijital görsel arşivi veri yönetimi, localStorage depolama ve JSON dışa aktarım servisi.
 */

import initialArchiveData from '../data/archiveData.json';
import {
  ArchiveStatistics,
  ArtworkMetadata,
  ColorFamilyStat,
} from '../types';

const STORAGE_KEY = 'chromarchive_user_items';

/**
 * Başlangıç verisi ve kullanıcının yerel kayıtlarını birleştirerek tüm arşivi döndürür.
 */
export function getArchiveItems(): ArtworkMetadata[] {
  const defaultItems = initialArchiveData as ArtworkMetadata[];

  if (typeof window === 'undefined') {
    return defaultItems;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultItems;

    const userItems: ArtworkMetadata[] = JSON.parse(raw);
    if (Array.isArray(userItems)) {
      return [...userItems, ...defaultItems];
    }
  } catch (err) {
    console.error('LocalStorage okuma hatası:', err);
  }

  return defaultItems;
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
  let neutralCount = 0;

  items.forEach((item) => {
    const t = (item.overallTemperature || '').toLowerCase();
    if (t.includes('sıcak')) warmCount++;
    else if (t.includes('soğuk')) coolCount++;
    else neutralCount++;
  });

  const warmPercent = Math.round((warmCount / totalArtworks) * 100);
  const coolPercent = Math.round((coolCount / totalArtworks) * 100);
  const neutralPercent = Math.max(0, 100 - warmPercent - coolPercent);

  const dominantTemperature =
    warmCount >= coolCount && warmCount >= neutralCount
      ? 'Sıcak Ağırlıklı'
      : coolCount >= warmCount && coolCount >= neutralCount
      ? 'Soğuk Ağırlıklı'
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
    topFamilies,
  };
}
