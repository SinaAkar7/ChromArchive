/**
 * @file src/services/archivePaletteService.ts
 * @description Dijital arşivdeki eksik paletli sanat eserleri için tekil ve eşzamanlılığı
 * sınırlı (maks. 2) gerçek piksel K-Means++ analiz servisi ve The Met CORS/proxy yönlendiricisi.
 */

import type { ArtworkMetadata, ClusterCountOption } from '../types';
import { analyzeImageSource } from './colorAnalyzer';
import { saveArtworkPaletteToCache } from './archiveService';

export const MAX_CONCURRENT_ARCHIVE_ANALYSES = 2;

export function isAllowedMetCrdImageUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname.toLowerCase() === 'images.metmuseum.org' &&
      parsed.pathname.startsWith('/CRDImages/')
    );
  } catch {
    return false;
  }
}

export function buildArchiveAnalysisCandidateUrls(artwork: ArtworkMetadata): string[] {
  const candidates: string[] = [];
  const pushUnique = (u?: string) => {
    if (u && !candidates.includes(u)) {
      candidates.push(u);
    }
  };

  const primaryThumb = artwork.thumbnailUrl;
  const primaryFull = artwork.imageUrl;

  if (primaryThumb) {
    pushUnique(primaryThumb);
    if (isAllowedMetCrdImageUrl(primaryThumb)) {
      pushUnique(`/api/met-image?url=${encodeURIComponent(primaryThumb)}`);
    }
  }

  if (primaryFull && primaryFull !== primaryThumb) {
    pushUnique(primaryFull);
    if (isAllowedMetCrdImageUrl(primaryFull)) {
      pushUnique(`/api/met-image?url=${encodeURIComponent(primaryFull)}`);
    }
  }

  return candidates;
}

export interface AnalyzeArtworkResult {
  ok: boolean;
  artwork?: ArtworkMetadata;
  error?: string;
}

/**
 * Tek bir arşiv eserini gerçek piksel verisi üzerinden Canvas + K-Means++ ile analiz eder
 * ve sonucu kalıcı palet önbelleğine yazar. Başarısızlıkta kesinlikle sahte palet üretmez.
 */
export async function analyzeArchiveArtworkPalette(
  artwork: ArtworkMetadata,
  requestedK: ClusterCountOption = 'auto'
): Promise<AnalyzeArtworkResult> {
  const candidates = buildArchiveAnalysisCandidateUrls(artwork);
  if (candidates.length === 0) {
    return {
      ok: false,
      error: 'Eser için geçerli bir görsel bağlantısı bulunamadı.',
    };
  }

  let lastErrorMessage = 'Görsel erişimi veya CORS doğrulaması başarısız.';

  for (const candidateSrc of candidates) {
    try {
      const analyzed = await analyzeImageSource(candidateSrc, requestedK, {
        ...artwork,
        id: artwork.id,
        imageUrl: artwork.imageUrl,
        thumbnailUrl: artwork.thumbnailUrl,
        isCustom: artwork.isCustom ?? false,
      });

      const mergedArtwork: ArtworkMetadata = {
        ...artwork,
        ...analyzed,
        id: artwork.id,
        imageUrl: artwork.imageUrl,
        thumbnailUrl: artwork.thumbnailUrl || artwork.imageUrl,
        isCustom: artwork.isCustom ?? false,
        analysisStatus: 'analyzed',
        analysisError: undefined,
      };

      saveArtworkPaletteToCache(mergedArtwork);

      return {
        ok: true,
        artwork: mergedArtwork,
      };
    } catch (err: unknown) {
      lastErrorMessage =
        err instanceof Error
          ? err.message
          : 'Görsel piksel verisi okunamadı.';
    }
  }

  return {
    ok: false,
    error: lastErrorMessage,
  };
}

export interface BatchAnalysisProgress {
  total: number;
  completed: number;
  succeeded: number;
  failed: number;
  activeTitles: string[];
  cancelled: boolean;
}

export interface BatchAnalysisOptions {
  concurrency?: number;
  signal?: AbortSignal;
  onProgress?: (progress: BatchAnalysisProgress) => void;
  onItemSuccess?: (artwork: ArtworkMetadata) => void;
  onItemFailure?: (artworkId: string, errorMessage: string) => void;
}

/**
 * Eksik paleti olan arşiv eserlerini en fazla 2 eşzamanlı işlemle analiz eder.
 */
export async function runBatchArchivePaletteAnalysis(
  pendingArtworks: ArtworkMetadata[],
  options: BatchAnalysisOptions = {}
): Promise<BatchAnalysisProgress> {
  const concurrency = Math.max(
    1,
    Math.min(MAX_CONCURRENT_ARCHIVE_ANALYSES, options.concurrency ?? MAX_CONCURRENT_ARCHIVE_ANALYSES)
  );
  const total = pendingArtworks.length;
  let completed = 0;
  let succeeded = 0;
  let failed = 0;
  const activeTitles = new Set<string>();
  let nextIndex = 0;

  const emitProgress = (cancelled = false) => {
    options.onProgress?.({
      total,
      completed,
      succeeded,
      failed,
      activeTitles: Array.from(activeTitles),
      cancelled,
    });
  };

  if (total === 0) {
    const emptyResult: BatchAnalysisProgress = {
      total: 0,
      completed: 0,
      succeeded: 0,
      failed: 0,
      activeTitles: [],
      cancelled: false,
    };
    options.onProgress?.(emptyResult);
    return emptyResult;
  }

  emitProgress(false);

  const worker = async () => {
    while (true) {
      if (options.signal?.aborted) {
        return;
      }

      const idx = nextIndex;
      nextIndex += 1;
      if (idx >= total) {
        return;
      }

      const target = pendingArtworks[idx];
      activeTitles.add(target.title);
      emitProgress(false);

      const res = await analyzeArchiveArtworkPalette(target, 'auto');

      activeTitles.delete(target.title);
      completed += 1;

      if (res.ok && res.artwork) {
        succeeded += 1;
        options.onItemSuccess?.(res.artwork);
      } else {
        failed += 1;
        options.onItemFailure?.(
          target.id,
          res.error || 'Görsel erişimi başarısız.'
        );
      }

      emitProgress(Boolean(options.signal?.aborted));
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
  await Promise.all(workers);

  const finalState: BatchAnalysisProgress = {
    total,
    completed,
    succeeded,
    failed,
    activeTitles: [],
    cancelled: Boolean(options.signal?.aborted),
  };
  emitProgress(finalState.cancelled);
  return finalState;
}
