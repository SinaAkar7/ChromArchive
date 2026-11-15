/**
 * @file scripts/generateArchiveColorIndex.ts
 * @description Geliştirme ortamı için tek seferlik arşiv renk indeksi üreticisi.
 * Seçilen açık erişimli The Met tablolarının gerçek piksel verilerini CORS doğrulamasıyla indirir,
 * `colorAnalyzer.ts` içerisindeki K-Means++ motoruyla analiz eder ve `src/data/archiveColorIndex.json` dosyasını oluşturur.
 * Çalıştırma: npx tsx scripts/generateArchiveColorIndex.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { execFileSync } from 'node:child_process';
import archiveDataRaw from '../src/data/archiveData.json';
import { analyzePixelSamples } from '../src/services/colorAnalyzer';
import type { ArchiveColorIndexEntry } from '../src/types';

function fetchImageBuffer(
  url: string
): Promise<{ status: number; contentType: string; corsHeader: string | null; buffer: Buffer }> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          Origin: 'http://localhost:3000',
          'User-Agent': 'Mozilla/5.0 (compatible; ChromArchive-Indexer/1.0)',
          Accept: 'image/jpeg,image/png,image/*,*/*;q=0.8',
        },
        timeout: 20000,
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          fetchImageBuffer(res.headers.location).then(resolve, reject);
          return;
        }
        const rawCt = res.headers['content-type'];
        const contentType = Array.isArray(rawCt) ? rawCt[0] : (rawCt ?? '');
        const rawCors = res.headers['access-control-allow-origin'];
        const corsHeader = Array.isArray(rawCors) ? rawCors[0] : (rawCors ?? null);
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            status,
            contentType,
            corsHeader,
            buffer: Buffer.concat(chunks),
          });
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error('HTTP zaman aşımı'));
    });
  });
}

// Farklı sanatçılar, dönemler, üsluplar ve kromatik spektrumlar (kırmızı, mavi, bej/toprak, yeşil, sarı, koyu) arasından dengeli 40 eser seçimi
const TARGET_OBJECT_IDS: number[] = [
  // Post-İzlenimcilik & İzlenimcilik
  436535, // Vincent van Gogh — Wheat Field with Cypresses
  436528, // Vincent van Gogh — Irises
  436534, // Vincent van Gogh — Roses
  437998, // Vincent van Gogh — Olive Trees
  437984, // Vincent van Gogh — La Berceuse
  436532, // Vincent van Gogh — Self-Portrait with a Straw Hat
  437310, // Camille Pissarro — Boulevard Montmartre on a Winter Morning
  438817, // Edgar Degas — The Dance Class
  435876, // Paul Cézanne — Madame Cézanne in a Red Dress (Kırmızı)
  435878, // Paul Cézanne — Mont Sainte-Victoire
  437430, // Auguste Renoir — By the Seashore (Mavi/sıcak)
  437658, // Georges Seurat — Study for A Sunday on La Grande Jatte
  436449, // Paul Gauguin — The Siesta
  436947, // Edouard Manet — Boating (Mavi)
  437835, // Henri de Toulouse-Lautrec — The Englishman at the Moulin Rouge

  // Kuzey Rönesansı & Hollanda / Flaman Altın Çağı
  437881, // Johannes Vermeer — Young Woman with a Water Pitcher
  437879, // Johannes Vermeer — Study of a Young Woman
  437397, // Rembrandt — Self-Portrait (1660)
  437394, // Rembrandt — Aristotle with a Bust of Homer
  436622, // Frans Hals — Merrymakers at Shrovetide
  437535, // Peter Paul Rubens — Venus and Adonis
  435809, // Pieter Bruegel the Elder — The Harvesters (Bej/Altın/Toprak)
  436282, // Jan van Eyck — The Crucifixion; The Last Judgment
  459052, // Petrus Christus — A Goldsmith in his Shop
  437056, // Hans Memling — Portinari Portraits

  // İspanyol, İtalyan & Fransız Barok / Klasisizm / Romantizm / Realizm
  435844, // Caravaggio — The Musicians
  436575, // El Greco — View of Toledo (Mavi/Yeşil)
  436573, // El Greco — Cardinal Fernando Niño de Guevara (Güçlü Kırmızı)
  436838, // Georges de La Tour — The Fortune-Teller (Bej/Toprak/Kırmızı)
  437826, // Titian — Venus and Adonis
  436545, // Goya — Manuel Osorio Manrique de Zuñiga (Parlak Kırmızı)
  437869, // Velázquez — Juan de Pareja
  436324, // Fragonard — A Shaded Avenue (Adaçayı/Bej)
  436703, // Ingres — Madame Jacques-Louis Leblanc
  436005, // Gustave Courbet — The Calm Sea (Mavi/Gri-Bej)
  435702, // Rosa Bonheur — The Horse Fair

  // Amerikan Manzara & Portre Geleneği
  12127,  // John Singer Sargent — Madame X
  11130,  // Winslow Homer — Northeaster (Mavi/Deniz köpüğü)
  10150,  // Albert Bierstadt — Merced River, Yosemite Valley
  10497,  // Thomas Cole — The Oxbow
];

interface RawArchiveRecord {
  objectId: number;
  title: string;
  artist?: string;
  medium?: string;
  isPublicDomain?: boolean;
  imageUrl?: string;
  thumbnailUrl?: string;
}

function getScaledDimensions(srcW: number, srcH: number, maxDim = 240): { width: number; height: number } {
  let width = srcW;
  let height = srcH;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.max(1, Math.round((height * maxDim) / width));
      width = maxDim;
    } else {
      width = Math.max(1, Math.round((width * maxDim) / height));
      height = maxDim;
    }
  }
  return { width, height };
}

async function analyzeRemoteArtwork(item: RawArchiveRecord): Promise<ArchiveColorIndexEntry | null> {
  const url = item.thumbnailUrl || item.imageUrl;
  if (!url) {
    console.warn(`[ATLANDI] ${item.objectId} (${item.title}): Görsel URL eksik.`);
    return null;
  }

  // 1. Görseli indir ve gerçek JPEG/PNG içeriğini doğrula
  let res: { status: number; contentType: string; corsHeader: string | null; buffer: Buffer };
  try {
    res = await fetchImageBuffer(url);
  } catch (err) {
    console.warn(`[ATLANDI] ${item.objectId} (${item.title}): Ağ hatası:`, err);
    return null;
  }

  if (res.status !== 200) {
    console.warn(`[ATLANDI] ${item.objectId} (${item.title}): HTTP ${res.status}`);
    return null;
  }

  if (!res.contentType.startsWith('image/') || res.buffer.length < 1000) {
    console.warn(`[ATLANDI] ${item.objectId} (${item.title}): Geçersiz içerik türü (${res.contentType}, ${res.buffer.length}B).`);
    return null;
  }

  const tmpFile = path.join('/tmp', `met_${item.objectId}.jpg`);
  fs.writeFileSync(tmpFile, res.buffer);

  try {
    // 2. Orijinal görsel boyutlarını oku (ImageMagick identify)
    const dimOut = execFileSync('identify', ['-format', '%w %h', tmpFile], {
      encoding: 'utf-8',
    }).trim();
    const [rawW, rawH] = dimOut.split(/\s+/).map(Number);
    if (!rawW || !rawH) {
      console.warn(`[ATLANDI] ${item.objectId}: Görsel boyutları okunamadı.`);
      return null;
    }

    const { width, height } = getScaledDimensions(rawW, rawH, 240);

    // 3. Canvas 240px max ölçeklemesine birebir denk piksel tamponunu çıkar (ffmpeg raw rgb24)
    const rgbBuffer = execFileSync(
      'ffmpeg',
      [
        '-v',
        'error',
        '-i',
        tmpFile,
        '-vf',
        `scale=${width}:${height}:flags=bilinear`,
        '-f',
        'rawvideo',
        '-pix_fmt',
        'rgb24',
        'pipe:1',
      ],
      { maxBuffer: 10 * 1024 * 1024 }
    );

    if (rgbBuffer.length !== width * height * 3) {
      console.warn(`[ATLANDI] ${item.objectId}: Beklenmeyen piksel tampon boyutu.`);
      return null;
    }

    // 4. Canvas motoruyla birebir aynı step=2 grid örneklemesi
    const step = 2;
    const gridW = Math.ceil(width / step);
    const pixels: Array<[number, number, number]> = [];
    const pixelGridIndices: number[] = [];

    for (let y = 0, gy = 0; y < height; y += step, gy++) {
      for (let x = 0, gx = 0; x < width; x += step, gx++) {
        const offset = (y * width + x) * 3;
        pixels.push([rgbBuffer[offset], rgbBuffer[offset + 1], rgbBuffer[offset + 2]]);
        pixelGridIndices.push(gy * gridW + gx);
      }
    }

    // 5. Mevcut colorAnalyzer.ts K-Means++ çekirdeğini çalıştır
    const result = analyzePixelSamples({
      pixels,
      width,
      height,
      step,
      pixelGridIndices,
      requestedK: 'auto',
    });

    const today = new Date().toISOString().split('T')[0];

    return {
      objectId: item.objectId,
      dominantColors: result.dominantColors,
      overallTemperature: result.overallTemperature,
      clusterCountUsed: result.clusterCountUsed,
      analysisDate: today,
      algorithmVersion: 'chromarchive-kmeans++-v2',
      colorDiversityScore: result.colorDiversityScore,
      warmthScoreWeightedMean: result.warmthScoreWeightedMean,
      warmSharePercent: result.warmSharePercent,
      coolSharePercent: result.coolSharePercent,
      transitionalSharePercent: result.transitionalSharePercent,
      neutralSharePercent: result.neutralSharePercent,
      temperatureSummary: result.temperatureSummary,
      temperatureModelVersion: result.temperatureModelVersion,
    };
  } catch (err) {
    console.warn(`[ATLANDI] ${item.objectId} (${item.title}): Piksel çözümleme hatası:`, err);
    return null;
  } finally {
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  }
}

async function main() {
  const archive = archiveDataRaw as RawArchiveRecord[];
  const byId = new Map(archive.map((item) => [item.objectId, item]));
  const selected = TARGET_OBJECT_IDS.map((id) => byId.get(id)).filter(
    (item): item is RawArchiveRecord => Boolean(item && item.isPublicDomain !== false)
  );

  console.log(`Toplam ${selected.length} seçili tablo için gerçek piksel analizi başlatılıyor...`);

  const entries: ArchiveColorIndexEntry[] = [];
  for (const item of selected) {
    const analyzed = await analyzeRemoteArtwork(item);
    if (analyzed) {
      entries.push(analyzed);
      console.log(
        `[OK ${entries.length}/${selected.length}] [${item.objectId}] ${item.artist} — ${item.title} (${analyzed.clusterCountUsed} küme, ${analyzed.overallTemperature})`
      );
    }
  }

  const outPath = path.resolve(process.cwd(), 'src/data/archiveColorIndex.json');
  fs.writeFileSync(outPath, JSON.stringify(entries, null, 2) + '\n', 'utf-8');
  console.log(`\nTamamlandı: ${entries.length} eser ${outPath} dosyasına kaydedildi.`);
}

main().catch((err) => {
  console.error('İndeks oluşturma hatası:', err);
  process.exit(1);
});
