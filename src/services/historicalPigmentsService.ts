/**
 * @file src/services/historicalPigmentsService.ts
 * @description ChromArchive tarihsel pigment veri seti servisi.
 * src/data/historicalPigments.json dosyasını yerel olarak içe aktarır; tarayıcıda harici API çağrısı yapmaz.
 * displayRgb örneklerini mevcut rgbToCielab ve calculateDeltaE2000 fonksiyonlarıyla karşılaştırarak
 * yalnızca "olası görsel renk yakınlığı" (benzer tarihsel renk örnekleri) hesaplar.
 */

import historicalPigmentsRaw from '../data/historicalPigments.json';
import type {
  CielabColor,
  HistoricalColorFamilyOverview,
  HistoricalPigmentEntry,
  HistoricalPigmentMatch,
  HistoricalPigmentSource,
  HistoricalPigmentsDataset,
  RgbObject,
} from '../types';
import {
  calculateDeltaE2000,
  getPerceptualSimilarityLabel,
  rgbToCielab,
} from './colorSearchService';

interface IndexedHistoricalPigment {
  pigment: HistoricalPigmentEntry;
  lab: CielabColor;
}

const rawDataset = historicalPigmentsRaw as Partial<HistoricalPigmentsDataset> | null;

const VALID_DATASET: HistoricalPigmentsDataset | null =
  rawDataset &&
  Array.isArray(rawDataset.pigments) &&
  Array.isArray(rawDataset.colorFamilies) &&
  Array.isArray(rawDataset.sources)
    ? (rawDataset as HistoricalPigmentsDataset)
    : null;

const SOURCE_MAP = new Map<string, HistoricalPigmentSource>(
  (VALID_DATASET?.sources ?? []).map((src) => [src.id, src])
);

const FAMILY_MAP = new Map<string, HistoricalColorFamilyOverview>(
  (VALID_DATASET?.colorFamilies ?? []).map((fam) => [fam.id.toLowerCase(), fam])
);

const INDEXED_PIGMENTS: IndexedHistoricalPigment[] = (VALID_DATASET?.pigments ?? [])
  .filter(
    (p): p is HistoricalPigmentEntry =>
      Boolean(p) &&
      typeof p.id === 'string' &&
      p.displayRgb !== undefined &&
      typeof p.displayRgb.r === 'number' &&
      typeof p.displayRgb.g === 'number' &&
      typeof p.displayRgb.b === 'number'
  )
  .map((pigment) => ({
    pigment,
    lab: rgbToCielab(pigment.displayRgb),
  }));

/**
 * Veri setinin sağlam şekilde yüklenip yüklenmediğini bildirir.
 */
export function isHistoricalPigmentsAvailable(): boolean {
  return VALID_DATASET !== null && INDEXED_PIGMENTS.length > 0;
}

/**
 * Veri seti üst bilgisini (editorialPolicy, displayHexPolicy, licenseNote vb.) döndürür.
 */
export function getHistoricalDatasetMetadata(): HistoricalPigmentsDataset['dataset'] | null {
  return VALID_DATASET?.dataset ?? null;
}

/**
 * Tüm tarihsel pigment kayıtlarını döndürür (38 kayıt).
 */
export function getHistoricalPigments(): HistoricalPigmentEntry[] {
  return INDEXED_PIGMENTS.map((item) => item.pigment);
}

/**
 * 13 renk ailesine ait tarihsel genel bakış kayıtlarını döndürür.
 */
export function getHistoricalColorFamilies(): HistoricalColorFamilyOverview[] {
  return VALID_DATASET?.colorFamilies ?? [];
}

/**
 * Belirtilen aile kimliğine göre (ör. 'blue', 'red', 'brown') renk ailesi özetini döndürür.
 */
export function getHistoricalColorFamilyById(
  family: string
): HistoricalColorFamilyOverview | null {
  if (!family) return null;
  return FAMILY_MAP.get(family.toLowerCase().trim()) ?? null;
}

/**
 * Belirtilen renk ailesine bağlı tarihsel pigmentleri döndürür.
 * Hem pigment.family alanını hem de colorFamilies[i].pigmentIds listesini dikkate alır.
 */
export function getHistoricalPigmentsByFamily(
  family: string
): HistoricalPigmentEntry[] {
  if (!family || INDEXED_PIGMENTS.length === 0) return [];
  const norm = family.toLowerCase().trim();
  const famOverview = FAMILY_MAP.get(norm);
  const overviewIdSet = new Set(famOverview?.pigmentIds ?? []);

  return INDEXED_PIGMENTS.filter(
    ({ pigment }) =>
      pigment.family.toLowerCase() === norm || overviewIdSet.has(pigment.id)
  ).map(({ pigment }) => pigment);
}

/**
 * ID ile tek bir tarihsel pigment kaydı bulur.
 */
export function getHistoricalPigmentById(
  id: string
): HistoricalPigmentEntry | null {
  if (!id) return null;
  const norm = id.toLowerCase().trim();
  return (
    INDEXED_PIGMENTS.find(({ pigment }) => pigment.id.toLowerCase() === norm)
      ?.pigment ?? null
  );
}

/**
 * Kaynak ID listesinden geçerli kaynak nesnelerini benzersiz biçimde döndürür;
 * sözlükte bulunmayan ID'leri (örn. eksik referanslar) hatasız ve güvenli şekilde atlar.
 */
export function getHistoricalSourcesByIds(
  ids: string[] | undefined | null
): HistoricalPigmentSource[] {
  if (!Array.isArray(ids) || SOURCE_MAP.size === 0) return [];
  const seen = new Set<string>();
  const resolved: HistoricalPigmentSource[] = [];

  for (const rawId of ids) {
    if (typeof rawId !== 'string') continue;
    const cleanId = rawId.trim();
    if (!cleanId || seen.has(cleanId)) continue;
    seen.add(cleanId);
    const source = SOURCE_MAP.get(cleanId);
    if (source) {
      resolved.push(source);
    }
  }
  return resolved;
}

/**
 * Bir pigment kaydının hem ana sourceIds hem de historicalBackground[*].sourceIds
 * alanlarındaki tüm erişilebilir kaynakları tekilleştirerek döndürür.
 */
export function getAllSourcesForPigment(
  pigment: HistoricalPigmentEntry
): HistoricalPigmentSource[] {
  const collectedIds: string[] = [
    ...(pigment.sourceIds ?? []),
    ...(pigment.historicalBackground ?? []).flatMap((ctx) => ctx.sourceIds ?? []),
  ];
  return getHistoricalSourcesByIds(collectedIds);
}

/**
 * Toksik veya ağır metal (arsenik, cıva, kurşun, kadmiyum) içeren pigmentleri
 * arayüzde güvenlik uyarısının vurgulanabilmesi için işaretler.
 */
export function isToxicOrHazardousPigment(
  pigment: HistoricalPigmentEntry
): boolean {
  const text = `${pigment.composition} ${pigment.conservationAndSafetyNotes}`.toLowerCase();
  return /toksik|arsenik|cıva|civa|kurşun|kursun|kadmiyum|hgs|pb₃|pbcro|as₂s|as₄s|cds|cuhaso/.test(
    text
  );
}

/**
 * Verilen RGB değerini yalnızca tarihsel pigmentlerin yaklaşık sRGB arayüz örnekleriyle (`displayRgb`)
 * mevcut `rgbToCielab` ve `calculateDeltaE2000` fonksiyonları üzerinden karşılaştırır.
 *
 * NOT: Dönen sonuçlar kimyasal pigment teşhisi DEĞİLDİR; yalnızca "olası görsel renk yakınlığı /
 * benzer tarihsel renk örnekleri" sunar.
 */
export function findNearestHistoricalPigments(
  rgb: RgbObject,
  options?: {
    family?: string;
    limit?: number;
  }
): HistoricalPigmentMatch[] {
  if (INDEXED_PIGMENTS.length === 0) return [];

  const limit = Math.max(1, options?.limit ?? 3);
  const filterFamily = options?.family?.toLowerCase().trim();

  const safeRgb: RgbObject = {
    r: Math.max(0, Math.min(255, Math.round(rgb.r))),
    g: Math.max(0, Math.min(255, Math.round(rgb.g))),
    b: Math.max(0, Math.min(255, Math.round(rgb.b))),
  };
  const targetLab = rgbToCielab(safeRgb);

  const pool =
    filterFamily && filterFamily !== 'all'
      ? INDEXED_PIGMENTS.filter(
          ({ pigment }) => pigment.family.toLowerCase() === filterFamily
        )
      : INDEXED_PIGMENTS;

  return pool
    .map(({ pigment, lab }) => {
      const rawDeltaE = calculateDeltaE2000(targetLab, lab);
      const deltaE = Number(rawDeltaE.toFixed(2));
      const similarityLabel = getPerceptualSimilarityLabel(deltaE);
      const colorFamilyOverview = getHistoricalColorFamilyById(pigment.family);

      return {
        pigment,
        deltaE,
        similarityLabel,
        explanation: `Olası görsel renk yakınlığı (CIEDE2000 ΔE = ${deltaE.toFixed(
          2
        )} · ${similarityLabel}): Piksel rengi, "${pigment.name.tr}" (${pigment.name.en}) kaydının yaklaşık arayüz örneği (${pigment.displayHex}) ile algısal benzerlik göstermektedir. Bu değer kimyasal pigment teşhisi değildir.`,
        colorFamilyOverview,
      };
    })
    .sort((a, b) => a.deltaE - b.deltaE)
    .slice(0, limit);
}
