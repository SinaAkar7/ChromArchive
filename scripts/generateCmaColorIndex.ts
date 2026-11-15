/**
 * @file scripts/generateCmaColorIndex.ts
 * @description Cleveland Museum of Art açık erişimli 100 CC0 resmi gerçek piksel verisiyle
 * `colorAnalyzer.ts` (K-Means++ + çok boyutlu sıcaklık modeli) üzerinden analiz eder ve
 * mevcut `src/data/archiveColorIndex.json` indeksine (40 Met kaydını koruyarak) ekler.
 * Çalıştırma: npx tsx scripts/generateCmaColorIndex.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { execFileSync } from 'node:child_process';
import existingIndexRaw from '../src/data/archiveColorIndex.json';
import cmaAdditionsRaw from '../src/data/archive-additions-100-paintings.json';
import { analyzePixelSamples } from '../src/services/colorAnalyzer';
import type { ArchiveColorIndexEntry } from '../src/types';

function fetchImageBuffer(
  url: string
): Promise<{ status: number; contentType: string; buffer: Buffer }> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ChromArchive-Indexer/1.0)',
          Accept: 'image/jpeg,image/png,image/*,*/*;q=0.8',
        },
        timeout: 25000,
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
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          resolve({ status, contentType, buffer: Buffer.concat(chunks) });
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('HTTP zaman aşımı')));
  });
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

async function analyzeCmaArtwork(item: {
  id: string;
  accessionNumber: string;
  title: string;
  artist: string;
  imageUrl: string;
}): Promise<ArchiveColorIndexEntry | null> {
  let res: { status: number; contentType: string; buffer: Buffer };
  try {
    res = await fetchImageBuffer(item.imageUrl);
  } catch (err) {
    console.warn(`[HATA] ${item.id}: Ağ hatası:`, err);
    return null;
  }

  if (res.status !== 200 || !res.contentType.startsWith('image/') || res.buffer.length < 1000) {
    console.warn(`[ATLANDI] ${item.id}: HTTP ${res.status} (${res.contentType})`);
    return null;
  }

  const safeAcc = item.accessionNumber.replace(/[^a-zA-Z0-9._-]/g, '_');
  const tmpFile = path.join('/tmp', `cma_${safeAcc}.jpg`);
  fs.writeFileSync(tmpFile, res.buffer);

  try {
    const dimOut = execFileSync('identify', ['-format', '%w %h', tmpFile], {
      encoding: 'utf-8',
    }).trim();
    const [rawW, rawH] = dimOut.split(/\s+/).map(Number);
    if (!rawW || !rawH) {
      console.warn(`[ATLANDI] ${item.id}: Boyut okunamadı.`);
      return null;
    }

    const { width, height } = getScaledDimensions(rawW, rawH, 240);
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
      console.warn(`[ATLANDI] ${item.id}: Beklenmeyen piksel tamponu.`);
      return null;
    }

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
      artworkId: item.id,
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
    console.warn(`[ATLANDI] ${item.id}: Piksel çözümleme hatası:`, err);
    return null;
  } finally {
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  }
}

async function main() {
  const existing = (existingIndexRaw as ArchiveColorIndexEntry[]).filter(
    (e) => typeof e.objectId === 'number' && (!e.artworkId || !e.artworkId.startsWith('cma-'))
  );
  const cmaArtworks = cmaAdditionsRaw.artworks;

  console.log(`Mevcut Met indeksi korunuyor: ${existing.length} eser.`);
  console.log(`${cmaArtworks.length} CMA resmi için gerçek piksel analizi başlatılıyor...`);

  const cmaEntries: ArchiveColorIndexEntry[] = [];
  const failedIds: string[] = [];

  for (let i = 0; i < cmaArtworks.length; i++) {
    const item = cmaArtworks[i];
    const analyzed = await analyzeCmaArtwork(item);
    if (analyzed) {
      cmaEntries.push(analyzed);
      if ((i + 1) % 10 === 0 || i === cmaArtworks.length - 1) {
        console.log(`[İLERLEME] ${i + 1}/${cmaArtworks.length} işlendi (Başarılı: ${cmaEntries.length})`);
      }
    } else {
      failedIds.push(item.id);
    }
  }

  const combined = [...existing, ...cmaEntries];
  const outPath = path.resolve(process.cwd(), 'src/data/archiveColorIndex.json');
  fs.writeFileSync(outPath, JSON.stringify(combined, null, 2) + '\n', 'utf-8');
  console.log(
    `\nTamamlandı: ${existing.length} Met + ${cmaEntries.length} CMA = ${combined.length} analiz edilmiş eser ${outPath} dosyasına yazıldı.`
  );
  if (failedIds.length > 0) {
    console.warn('Başarısız CMA ID listesi:', failedIds);
  }
}

main().catch((err) => {
  console.error('CMA indeks hatası:', err);
  process.exit(1);
});
