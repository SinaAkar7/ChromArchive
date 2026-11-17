/**
 * @file src/services/colorAnalyzer.ts
 * @description HTML5 Canvas API ve K-Means++ kümeleme algoritması ile istemci taraflı renk analizi servisi.
 */

import {
  ArtworkMetadata,
  ClusterCountOption,
  ColorAnalysisResult,
  ColorFamily,
  ColorTemperature,
  DominantColor,
  SpatialTemperatureRelation,
} from '../types';
import {
  classifyColorTemperature,
  enrichPaletteWithTemperatureAnalysis,
  getTemperatureRules,
  rgbToHsvSaturation,
} from './colorTemperatureService';

/**
 * RGB değerlerini HEX formatına dönüştürür.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * HEX kodunu RGB üçlüsüne dönüştürür.
 */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean,
    16
  );
  if (isNaN(bigint)) return [0, 0, 0];
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

/**
 * RGB'den HSL renk uzayına dönüştürür.
 */
export function rgbToHsl(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

/**
 * İki RGB rengi arasındaki algısal mesafeyi (İnsan gözü ağırlıklı Öklid) hesaplar.
 */
export function colorDistance(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const rMean = (rgb1[0] + rgb2[0]) / 2;
  const rDiff = rgb1[0] - rgb2[0];
  const gDiff = rgb1[1] - rgb2[1];
  const bDiff = rgb1[2] - rgb2[2];
  const weightR = 2 + rMean / 256;
  const weightG = 4.0;
  const weightB = 2 + (255 - rMean) / 256;
  return Math.sqrt(
    weightR * rDiff * rDiff + weightG * gDiff * gDiff + weightB * bDiff * bDiff
  );
}

/**
 * Rengin sıcak, soğuk veya nötr kategorisini yerel JSON kural motoruyla belirler.
 */
export function determineTemperature(
  r: number,
  g: number,
  b: number
): ColorTemperature {
  return classifyColorTemperature(r, g, b).legacyTemperature;
}

/**
 * Türkçe renk adını ve renk ailesini belirler.
 */
export function determineColorNameAndFamily(
  r: number,
  g: number,
  b: number
): { name: string; family: ColorFamily } {
  const [h, s, l] = rgbToHsl(r, g, b);
  const hsvSat = rgbToHsvSaturation(r, g, b);

  if (l < 0.13) {
    return { name: 'Kömür Karası / Gece', family: 'Nötr' };
  }
  if (l > 0.86 && hsvSat < 0.14) {
    return { name: 'Tebeşir / Alabaster Beyazı', family: 'Nötr' };
  }
  if (s < 0.14 || hsvSat < 0.14) {
    if (l < 0.4) return { name: 'Antrasit Grisi', family: 'Nötr' };
    if (l < 0.7) return { name: 'Küllü Müze Grisi', family: 'Nötr' };
    return { name: 'Kırık Parşömen Beji', family: 'Nötr' };
  }
  if (l > 0.66 && hsvSat < 0.28 && h >= 20 && h <= 55) {
    return {
      name: 'Açık Kum / Parşömen Beji',
      family: hsvSat < 0.2 ? 'Nötr' : 'Turuncu',
    };
  }

  if (h >= 350 || h < 15) {
    if (l < 0.35) return { name: 'Bordo / Koyu Karmin', family: 'Kırmızı' };
    if (s > 0.6) return { name: 'Kırmızı Lal / Kadmiyum', family: 'Kırmızı' };
    return { name: 'Pişmiş Toprak / Terracotta', family: 'Kırmızı' };
  }
  if (h >= 15 && h < 45) {
    if (l < 0.35) return { name: 'Yanık Umber / Kahve', family: 'Turuncu' };
    if (s > 0.6) return { name: 'Aşıboyası / Sıcak Amber', family: 'Turuncu' };
    return { name: 'Toprak Kahverengisi', family: 'Turuncu' };
  }
  if (h >= 45 && h < 70) {
    if (l < 0.45) return { name: 'Hardal / Antik Altın', family: 'Sarı' };
    return { name: 'Güneş / Kadmiyum Sarısı', family: 'Sarı' };
  }
  if (h >= 70 && h < 165) {
    if (l < 0.35) return { name: 'Zeytin / Koyu Orman Yeşili', family: 'Yeşil' };
    if (s < 0.4) return { name: 'Adaçayı / Nilüfer Yeşili', family: 'Yeşil' };
    return { name: 'Zümrüt Yeşili', family: 'Yeşil' };
  }
  if (h >= 165 && h < 260) {
    if (l < 0.28) return { name: 'Prusya / Derin İndigo', family: 'Mavi' };
    if (s < 0.45) return { name: 'Sisli Gölet Mavisi', family: 'Mavi' };
    return { name: 'Ultramarin / Okyanus Mavisi', family: 'Mavi' };
  }
  if (h >= 260 && h < 315) {
    if (l < 0.35) return { name: 'Mürdüm / Gece Menekşesi', family: 'Mor' };
    return { name: 'Lavanta Moru', family: 'Mor' };
  }
  return { name: 'Gül Kurusu / Pudra Pembe', family: 'Kırmızı' };
}

/**
 * Canvas API ve K-Means++ algoritması kullanarak görsel piksellerini analiz eder.
 *
 * @param imgElement Analiz edilecek HTML görsel elementi
 * @param requestedK Küme sayısı ('auto' veya 5-8)
 */
export function analyzeImagePixelsWithCanvas(
  imgElement: HTMLImageElement,
  requestedK: ClusterCountOption = 'auto'
): ColorAnalysisResult {
  if (
    !imgElement ||
    !imgElement.complete ||
    (imgElement.naturalWidth === 0 && imgElement.width === 0)
  ) {
    throw new Error('Görsel henüz yüklenemedi veya geçerli piksel verisi bulunamadı.');
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Tarayıcıda Canvas 2D bağlamı oluşturulamadı.');
  }

  const tempRules = getTemperatureRules();
  const maxDimension =
    tempRules.spatialContext.recommendedSampling.maxCanvasDimensionPx || 240;
  let width = imgElement.naturalWidth || imgElement.width || 300;
  let height = imgElement.naturalHeight || imgElement.height || 300;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.max(1, Math.round((height * maxDimension) / width));
      width = maxDimension;
    } else {
      width = Math.max(1, Math.round((width * maxDimension) / height));
      height = maxDimension;
    }
  }

  canvas.width = width;
  canvas.height = height;

  try {
    ctx.drawImage(imgElement, 0, 0, width, height);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error('Görsel Canvas üzerine aktarılırken hata oluştu: ' + msg);
  }

  let imageData: ImageData;
  try {
    imageData = ctx.getImageData(0, 0, width, height);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      'Görsel piksel verisi okunamadı. Harici bir kaynaktan yüklendiyse CORS kısıtlaması olabilir: ' +
        msg
    );
  }

  const data = imageData.data;
  const pixels: Array<[number, number, number]> = [];
  const pixelGridIndices: number[] = [];
  const step = Math.max(
    1,
    tempRules.spatialContext.recommendedSampling.sampleStepPx || 2
  ); // Performans ve doğruluk dengesi için her 2 pikselde bir grid örnekleme
  const gridW = Math.ceil(width / step);
  const gridH = Math.ceil(height / step);

  for (let y = 0, gy = 0; y < height; y += step, gy++) {
    for (let x = 0, gx = 0; x < width; x += step, gx++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha < 128) continue; // Saydam pikselleri atla
      pixels.push([data[idx], data[idx + 1], data[idx + 2]]);
      pixelGridIndices.push(gy * gridW + gx);
    }
  }

  return analyzePixelSamples({
    pixels,
    width,
    height,
    step,
    pixelGridIndices,
    requestedK,
  });
}

export interface AnalyzePixelSamplesParams {
  pixels: Array<[number, number, number]>;
  width: number;
  height: number;
  step?: number;
  pixelGridIndices?: number[];
  requestedK?: ClusterCountOption;
}

/**
 * Doğrudan sRGB piksel dizisi üzerinde K-Means++ kümeleme, renk adlandırma,
 * sıcaklık analizi ve örneklem grid komşuluk ilişkilerini çalıştıran saf motor.
 */
export function analyzePixelSamples({
  pixels,
  width,
  height,
  step = 2,
  pixelGridIndices = [],
  requestedK = 'auto',
}: AnalyzePixelSamplesParams): ColorAnalysisResult {
  if (pixels.length === 0) {
    throw new Error('Görselde analiz edilecek geçerli renk pikseli bulunamadı.');
  }

  const tempRules = getTemperatureRules();
  const gridW = Math.ceil(width / Math.max(1, step));
  const gridH = Math.ceil(height / Math.max(1, step));

  // Küme Sayısını (K) belirleme (5-8 arası)
  let k = 6;
  if (requestedK === 'auto') {
    const sampleSize = Math.min(600, pixels.length);
    const stride = Math.max(1, Math.floor(pixels.length / sampleSize));
    let sumL = 0;
    for (let i = 0; i < sampleSize; i++) {
      const p = pixels[i * stride];
      if (p) sumL += 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
    }
    const meanL = sumL / sampleSize;

    let varL = 0;
    for (let i = 0; i < sampleSize; i++) {
      const p = pixels[i * stride];
      if (p) {
        const lum = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
        varL += (lum - meanL) * (lum - meanL);
      }
    }
    const stdDev = Math.sqrt(varL / sampleSize);

    if (stdDev > 46) {
      k = 7;
    } else if (stdDev > 30) {
      k = 6;
    } else {
      k = 5;
    }
  } else {
    k = Math.max(5, Math.min(8, Number(requestedK) || 6));
  }

  // K-Means++ Merkez Başlatma (Centroid Seeding)
  const centroids: Array<[number, number, number]> = [];
  centroids.push([...pixels[Math.floor(pixels.length / 2)]]);

  for (let c = 1; c < k; c++) {
    const distances = new Float64Array(pixels.length);
    let sumDistSq = 0;

    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i];
      let minDist = Infinity;
      for (let j = 0; j < centroids.length; j++) {
        const d = colorDistance(p, centroids[j]);
        if (d < minDist) minDist = d;
      }
      const dSq = minDist * minDist;
      distances[i] = dSq;
      sumDistSq += dSq;
    }

    if (sumDistSq === 0) {
      centroids.push([...pixels[Math.floor(Math.random() * pixels.length)]]);
      continue;
    }

    const threshold = Math.random() * sumDistSq;
    let runningSum = 0;
    let chosenIdx = 0;
    for (let i = 0; i < pixels.length; i++) {
      runningSum += distances[i];
      if (runningSum >= threshold) {
        chosenIdx = i;
        break;
      }
    }
    centroids.push([...pixels[chosenIdx]]);
  }

  // K-Means İteratif Yakınsama (10 İterasyon)
  const maxIterations = 10;
  const assignments = new Uint8Array(pixels.length);

  for (let iter = 0; iter < maxIterations; iter++) {
    const sumsR = new Float64Array(k);
    const sumsG = new Float64Array(k);
    const sumsB = new Float64Array(k);
    const counts = new Uint32Array(k);

    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i];
      let bestDist = Infinity;
      let bestCluster = 0;

      for (let j = 0; j < k; j++) {
        const d = colorDistance(p, centroids[j]);
        if (d < bestDist) {
          bestDist = d;
          bestCluster = j;
        }
      }

      assignments[i] = bestCluster;
      sumsR[bestCluster] += p[0];
      sumsG[bestCluster] += p[1];
      sumsB[bestCluster] += p[2];
      counts[bestCluster]++;
    }

    let maxShift = 0;
    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        const newR = Math.round(sumsR[j] / counts[j]);
        const newG = Math.round(sumsG[j] / counts[j]);
        const newB = Math.round(sumsB[j] / counts[j]);
        const shift =
          Math.abs(centroids[j][0] - newR) +
          Math.abs(centroids[j][1] - newG) +
          Math.abs(centroids[j][2] - newB);
        if (shift > maxShift) maxShift = shift;
        centroids[j] = [newR, newG, newB];
      } else {
        centroids[j] = [...pixels[Math.floor(Math.random() * pixels.length)]];
      }
    }

    if (maxShift < 2) break;
  }

  // Küme ağırlıklarını say
  const finalCounts = new Uint32Array(k);
  for (let i = 0; i < pixels.length; i++) {
    finalCounts[assignments[i]]++;
  }

  const rawClusters: Array<{
    rawId: number;
    rgb: [number, number, number];
    count: number;
  }> = [];
  for (let j = 0; j < k; j++) {
    if (finalCounts[j] > 0) {
      rawClusters.push({
        rawId: j,
        rgb: centroids[j],
        count: finalCounts[j],
      });
    }
  }

  // Aşırı yakın kümeleri birleştir (Delta-E < 16) ve grid indeks eşlemesini koru
  const clusters: Array<{
    mergedId: number;
    rgb: [number, number, number];
    count: number;
  }> = [];
  const rawToMerged = new Int16Array(k).fill(-1);

  for (const cl of rawClusters) {
    let merged = false;
    for (const m of clusters) {
      if (colorDistance(cl.rgb, m.rgb) < 16) {
        m.count += cl.count;
        rawToMerged[cl.rawId] = m.mergedId;
        merged = true;
        break;
      }
    }
    if (!merged) {
      const mergedId = clusters.length;
      clusters.push({
        mergedId,
        rgb: cl.rgb,
        count: cl.count,
      });
      rawToMerged[cl.rawId] = mergedId;
    }
  }

  clusters.sort((a, b) => b.count - a.count);

  const mergedToFinal = new Int16Array(clusters.length).fill(-1);
  clusters.forEach((cl, finalIdx) => {
    mergedToFinal[cl.mergedId] = finalIdx;
  });

  const rawToFinal = new Int16Array(k).fill(-1);
  for (let rawId = 0; rawId < k; rawId++) {
    const mId = rawToMerged[rawId];
    if (mId >= 0) {
      rawToFinal[rawId] = mergedToFinal[mId];
    }
  }

  const totalPixelsCount =
    clusters.reduce((sum, c) => sum + c.count, 0) || 1;

  const dominantColors: DominantColor[] = clusters.map((cluster) => {
    const rawPercent = (cluster.count / totalPixelsCount) * 100;
    const hex = rgbToHex(cluster.rgb[0], cluster.rgb[1], cluster.rgb[2]);
    const { name, family } = determineColorNameAndFamily(
      cluster.rgb[0],
      cluster.rgb[1],
      cluster.rgb[2]
    );
    const classified = classifyColorTemperature(
      cluster.rgb[0],
      cluster.rgb[1],
      cluster.rgb[2],
      family
    );

    return {
      hex,
      rgb: [cluster.rgb[0], cluster.rgb[1], cluster.rgb[2]],
      rgbString: `rgb(${cluster.rgb[0]}, ${cluster.rgb[1]}, ${cluster.rgb[2]})`,
      percentage: parseFloat(rawPercent.toFixed(1)),
      name,
      family,
      temperature: classified.legacyTemperature,
      warmthScore: classified.warmthScore,
      temperatureCategory: classified.categoryId,
      temperatureLabel: classified.labelTr,
      temperatureConfidence: classified.confidence,
      temperatureConfidenceLabel: classified.confidenceLabelTr,
      temperatureBasis: classified.basis,
      undertoneNote: classified.undertoneNote,
      cielabChroma: classified.cielabChroma,
    };
  });

  // Toplam yüzdeyi %100'e normalize et
  const sumPercent = dominantColors.reduce((acc, c) => acc + c.percentage, 0);
  if (dominantColors.length > 0 && Math.abs(sumPercent - 100) > 0.01) {
    dominantColors[0].percentage = parseFloat(
      (dominantColors[0].percentage + (100 - sumPercent)).toFixed(1)
    );
  }

  // Örneklem grid'i üzerinde 4-komşuluk mekânsal sıcaklık ilişkilerini çıkar (yalnızca özet)
  let spatialTemperatureRelations: SpatialTemperatureRelation[] | undefined;
  if (
    tempRules.spatialContext.enabled &&
    dominantColors.length > 1 &&
    pixelGridIndices.length === pixels.length
  ) {
    const gridClusters = new Int16Array(gridW * gridH).fill(-1);
    for (let i = 0; i < pixels.length; i++) {
      const gridIdx = pixelGridIndices[i];
      const finalIdx = rawToFinal[assignments[i]];
      if (gridIdx !== undefined && finalIdx >= 0) {
        gridClusters[gridIdx] = finalIdx;
      }
    }

    const pairCounts = new Map<string, number>();
    const addBoundaryPair = (c1: number, c2: number) => {
      if (c1 < 0 || c2 < 0 || c1 === c2) return;
      const a = c1 < c2 ? c1 : c2;
      const b = c1 < c2 ? c2 : c1;
      const key = `${a}:${b}`;
      pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
    };

    for (let gy = 0; gy < gridH; gy++) {
      for (let gx = 0; gx < gridW; gx++) {
        const idx = gy * gridW + gx;
        const c = gridClusters[idx];
        if (c < 0) continue;
        if (gx + 1 < gridW) {
          addBoundaryPair(c, gridClusters[idx + 1]);
        }
        if (gy + 1 < gridH) {
          addBoundaryPair(c, gridClusters[idx + gridW]);
        }
      }
    }

    const minSharedSamples =
      tempRules.spatialContext.recommendedSampling.minSharedBoundarySamples || 8;
    const minScoreDiff =
      tempRules.paletteAggregation.relativeToPalette.deltaThreshold || 8;

    const relations: SpatialTemperatureRelation[] = [];
    pairCounts.forEach((sharedBoundarySamples, key) => {
      if (sharedBoundarySamples < minSharedSamples) return;
      const [idxA, idxB] = key.split(':').map(Number);
      const colA = dominantColors[idxA];
      const colB = dominantColors[idxB];
      if (!colA || !colB) return;

      const scoreA = colA.warmthScore ?? 50;
      const scoreB = colB.warmthScore ?? 50;
      const diff = Math.abs(scoreA - scoreB);
      if (diff < minScoreDiff) return;

      const warmer = scoreA >= scoreB ? colA : colB;
      const cooler = scoreA >= scoreB ? colB : colA;

      relations.push({
        clusterA: warmer.hex,
        clusterAName: warmer.name,
        clusterB: cooler.hex,
        clusterBName: cooler.name,
        relation: `${warmer.hex} (${warmer.name}), komşu ${cooler.hex} (${cooler.name}) kümesine göre daha sıcak yönelimli`,
        warmthScoreDifference: Math.round(diff),
        sharedBoundarySamples,
        evidence: 'shared_sampled_boundary',
      });
    });

    if (relations.length > 0) {
      relations.sort(
        (a, b) =>
          b.sharedBoundarySamples * b.warmthScoreDifference -
          a.sharedBoundarySamples * a.warmthScoreDifference
      );
      spatialTemperatureRelations = relations.slice(0, 6);
    }
  }

  // Palet düzeyinde ağırlıklı sıcaklık profili ve göreli karşılaştırmalar
  const paletteTemp = enrichPaletteWithTemperatureAnalysis(
    dominantColors,
    spatialTemperatureRelations
  );

  // Renk çeşitlilik endeksi
  let totalPairwiseDist = 0;
  let pairCount = 0;
  for (let i = 0; i < paletteTemp.dominantColors.length; i++) {
    for (let j = i + 1; j < paletteTemp.dominantColors.length; j++) {
      totalPairwiseDist += colorDistance(
        paletteTemp.dominantColors[i].rgb,
        paletteTemp.dominantColors[j].rgb
      );
      pairCount++;
    }
  }
  const avgDist = pairCount > 0 ? totalPairwiseDist / pairCount : 150;
  const colorDiversityScore = Math.min(
    100,
    Math.max(30, Math.round((avgDist / 380) * 100))
  );

  return {
    dominantColors: paletteTemp.dominantColors,
    overallTemperature: paletteTemp.overallTemperature,
    colorDiversityScore,
    clusterCountUsed: paletteTemp.dominantColors.length,
    analyzedPixels: pixels.length,
    sampleResolution: `${width}×${height} px`,
    warmthScoreWeightedMean: paletteTemp.warmthScoreWeightedMean,
    warmSharePercent: paletteTemp.warmSharePercent,
    coolSharePercent: paletteTemp.coolSharePercent,
    transitionalSharePercent: paletteTemp.transitionalSharePercent,
    neutralSharePercent: paletteTemp.neutralSharePercent,
    temperatureSummary: paletteTemp.temperatureSummary,
    temperatureModelVersion: paletteTemp.temperatureModelVersion,
    spatialTemperatureRelations: paletteTemp.spatialTemperatureRelations,
  };
}

/**
 * Hedef renge göre bir eserin baskın renkleri arasındaki en yakın mesafeyi ve benzerlik puanını hesaplar.
 */
export function calculateSimilarityScore(
  targetRgb: [number, number, number],
  artworkColors: DominantColor[]
): { similarityScore: number; closestColor: DominantColor } {
  let minDistance = Infinity;
  let closestColor = artworkColors[0];

  for (const c of artworkColors) {
    const dist = colorDistance(targetRgb, c.rgb);
    if (dist < minDistance) {
      minDistance = dist;
      closestColor = c;
    }
  }

  // Maksimum renk mesafesi yaklaşık 440 kabul edilerek yüzde benzerlik hesaplanır
  const similarityScore = Math.max(
    0,
    Math.min(100, Math.round(100 - (minDistance / 440) * 100))
  );

  return { similarityScore, closestColor };
}

/**
 * Bir görsel URL'si veya File verisini yükleyip Canvas K-Means analizi çalıştırır,
 * tam bir ArtworkMetadata nesnesi olarak döndürür.
 */
export async function analyzeImageSource(
  source: string,
  requestedK: ClusterCountOption = 'auto',
  metaOverrides?: Partial<ArtworkMetadata>
): Promise<ArtworkMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const analysis = analyzeImagePixelsWithCanvas(img, requestedK);
        const now = new Date();
        const dateStr = now.toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const fullMetadata: ArtworkMetadata = {
          id: metaOverrides?.id || 'custom_' + Date.now().toString(36),
          title: metaOverrides?.title || 'Yüklenen Görsel Analizi',
          artist: metaOverrides?.artist || 'Bilinmeyen Sanatçı / Kullanıcı',
          date: metaOverrides?.date || dateStr,
          year: metaOverrides?.year || String(now.getFullYear()),
          period: metaOverrides?.period || 'Çağdaş / Dijital Yükleme',
          institution: metaOverrides?.institution || 'Kullanıcı Dijital Koleksiyonu',
          accessionNumber:
            metaOverrides?.accessionNumber ||
            'USR-' + Math.floor(100000 + Math.random() * 900000),
          sourceUrl: metaOverrides?.sourceUrl || '#',
          museumUrl: metaOverrides?.museumUrl,
          license: metaOverrides?.license || 'Kişisel / CC0 Kamu Malı',
          rights: metaOverrides?.rights || 'Kişisel / Araştırma Amaçlı',
          medium: metaOverrides?.medium || 'Dijital Görsel',
          dimensions:
            metaOverrides?.dimensions || `${img.naturalWidth || 300} × ${img.naturalHeight || 300} px`,
          description:
            metaOverrides?.description ||
            `HTML5 Canvas API ve K-Means++ algoritması ile analiz edilen ${analysis.dominantColors.length} baskın renkli dijital görsel kaydı.`,
          imageUrl: metaOverrides?.imageUrl || source,
          thumbnailUrl: metaOverrides?.thumbnailUrl,
          tags: metaOverrides?.tags || ['renk-analizi', 'k-means', 'dijital-arsiv'],
          culture: metaOverrides?.culture || 'Evrensel',
          category: metaOverrides?.category || 'Dijital Analiz',
          dominantColors: analysis.dominantColors,
          overallTemperature: analysis.overallTemperature,
          dominantCount: analysis.dominantColors.length,
          analysisDate: dateStr,
          colorDiversityScore: analysis.colorDiversityScore,
          warmthScoreWeightedMean: analysis.warmthScoreWeightedMean,
          warmSharePercent: analysis.warmSharePercent,
          coolSharePercent: analysis.coolSharePercent,
          transitionalSharePercent: analysis.transitionalSharePercent,
          neutralSharePercent: analysis.neutralSharePercent,
          temperatureSummary: analysis.temperatureSummary,
          temperatureModelVersion: analysis.temperatureModelVersion,
          spatialTemperatureRelations: analysis.spatialTemperatureRelations,
          fileFormat: metaOverrides?.fileFormat || 'JPEG',
          isCustom: metaOverrides?.isCustom ?? true,
          analysisStatus: 'analyzed',
        };

        resolve(fullMetadata);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('Görsel dosyası yüklenemedi. Formatı veya CORS bağlantısını kontrol edin.'));
    };

    img.src = source;
  });
}

