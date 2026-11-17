/**
 * @file src/App.tsx
 * @description ChromArchive: Yapay Zekâ Destekli Görsel Renk Analizi ve Dijital Arşiv Sistemi.
 * Modern, strict TypeScript + React SPA application with client-side Canvas K-Means++ analysis.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArtworkMetadata,
  ClusterCountOption,
  NavigationSection,
  PaletteViewMode,
  ToastMessage
} from './types';
import { analyzeImageSource } from './services/colorAnalyzer';
import {
  getArchiveItems,
  saveUserArtwork,
  saveArtworkPaletteToCache,
  exportMetadataAsJson
} from './services/archiveService';
import {
  analyzeArchiveArtworkPalette,
  isAllowedMetCrdImageUrl,
  runBatchArchivePaletteAnalysis,
  type BatchAnalysisProgress
} from './services/archivePaletteService';

import { Navbar } from './components/Navbar';
import { HomeOverview } from './components/HomeOverview';
import { ImageUploader } from './components/ImageUploader';
import { ColorPalette } from './components/ColorPalette';
import { ArchiveGallery } from './components/ArchiveGallery';
import { SearchBar } from './components/SearchBar';
import { Statistics } from './components/Statistics';
import { About } from './components/About';
import { ArtworkModal } from './components/ArtworkModal';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

export default function App() {
  // Navigation & View Mode
  const [activeSection, setActiveSection] = useState<NavigationSection>('home');
  const [paletteViewMode, setPaletteViewMode] = useState<PaletteViewMode>('horizontal');
  const [clusterCount, setClusterCount] = useState<ClusterCountOption>('auto');

  // Archive & Analysis State (Preserved across section switches)
  const [archiveItems, setArchiveItems] = useState<ArtworkMetadata[]>([]);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [currentArtworkMeta, setCurrentArtworkMeta] = useState<Partial<ArtworkMetadata>>({});
  const [analysisData, setAnalysisData] = useState<ArtworkMetadata | null>(null);
  const [currentMetaStrip, setCurrentMetaStrip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Archive Palette Extraction State (Single + Max-2 Batch)
  const [analyzingArtworkIds, setAnalyzingArtworkIds] = useState<string[]>([]);
  const [failedArtworkErrors, setFailedArtworkErrors] = useState<Record<string, string>>({});
  const [batchProgress, setBatchProgress] = useState<BatchAnalysisProgress | null>(null);
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const batchAbortControllerRef = useRef<AbortController | null>(null);

  // Gallery Filters
  const [gallerySearchQuery, setGallerySearchQuery] = useState<string>('');
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('all');
  const [galleryTempFilter, setGalleryTempFilter] = useState<string>('all');

  // Modal State
  const [modalArtwork, setModalArtwork] = useState<ArtworkMetadata | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load archive items on mount & clean up batch abort controller on unmount
  useEffect(() => {
    const items = getArchiveItems();
    setArchiveItems(items);
    return () => {
      batchAbortControllerRef.current?.abort();
    };
  }, []);

  // Toast dispatch helper
  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // Copy HEX to clipboard helper
  const handleCopyHex = useCallback(
    (hex: string) => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(hex).then(
          () => {
            showToast(`Kopyalandı: ${hex}`, 'success');
          },
          () => {
            showToast(`Renk: ${hex}`, 'info');
          }
        );
      } else {
        showToast(`Renk: ${hex}`, 'info');
      }
    },
    [showToast]
  );

  // Sync a freshly analyzed archive artwork into state + open modal
  const applyAnalyzedArtworkUpdate = useCallback((updatedArtwork: ArtworkMetadata) => {
    setArchiveItems((prev) =>
      prev.map((item) => (item.id === updatedArtwork.id ? updatedArtwork : item))
    );
    setFailedArtworkErrors((prev) => {
      if (!(updatedArtwork.id in prev)) return prev;
      const next = { ...prev };
      delete next[updatedArtwork.id];
      return next;
    });
    setModalArtwork((prev) => (prev && prev.id === updatedArtwork.id ? updatedArtwork : prev));
  }, []);

  // Core Canvas K-Means analysis runner (supports /api/met-image fallback ONLY for Met CRD URLs)
  const performAnalysis = useCallback(
    async (
      src: string,
      metaOverrides: Partial<ArtworkMetadata>,
      kOption: ClusterCountOption
    ) => {
      setIsLoading(true);
      try {
        let result: ArtworkMetadata;
        try {
          result = await analyzeImageSource(src, kOption, metaOverrides);
        } catch (directErr) {
          if (isAllowedMetCrdImageUrl(src)) {
            const proxyUrl = `/api/met-image?url=${encodeURIComponent(src)}`;
            result = await analyzeImageSource(proxyUrl, kOption, {
              ...metaOverrides,
              imageUrl: metaOverrides.imageUrl || src,
            });
          } else {
            throw directErr;
          }
        }

        setAnalysisData(result);
        setCurrentMetaStrip(
          `${result.dimensions || '300x300'} · ${result.dominantColors.length} Küme · ${result.overallTemperature}`
        );

        // If this came from an existing catalog record without custom override, persist palette cache
        if (metaOverrides.id && metaOverrides.isCustom === false && kOption === 'auto') {
          saveArtworkPaletteToCache(result);
          applyAnalyzedArtworkUpdate(result);
        }

        showToast(
          `Analiz tamamlandı: ${result.dominantColors.length} baskın renk kümelendi.`,
          'success'
        );
      } catch (err: unknown) {
        console.error('Renk analizi hatası:', err);
        const errMsg = err instanceof Error ? err.message : 'Görsel analiz edilirken bir hata oluştu.';
        showToast(errMsg, 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [showToast, applyAnalyzedArtworkUpdate]
  );

  // Handle new image upload or preset click
  const handleImageSelected = useCallback(
    (src: string, meta: Partial<ArtworkMetadata>) => {
      setSelectedImageSrc(src);
      setCurrentArtworkMeta(meta);
      performAnalysis(src, meta, clusterCount);
      if (activeSection !== 'analyzer') {
        setActiveSection('analyzer');
      }
    },
    [clusterCount, performAnalysis, activeSection]
  );

  // Handle cluster count change (re-runs analysis on current image if present)
  const handleClusterCountChange = useCallback(
    (k: ClusterCountOption) => {
      setClusterCount(k);
      if (selectedImageSrc) {
        performAnalysis(selectedImageSrc, currentArtworkMeta, k);
      }
    },
    [selectedImageSrc, currentArtworkMeta, performAnalysis]
  );

  // Single archive artwork real-pixel palette extraction
  const handleGenerateArtworkPalette = useCallback(
    async (artwork: ArtworkMetadata) => {
      setAnalyzingArtworkIds((prev) =>
        prev.includes(artwork.id) ? prev : [...prev, artwork.id]
      );
      setFailedArtworkErrors((prev) => {
        if (!(artwork.id in prev)) return prev;
        const next = { ...prev };
        delete next[artwork.id];
        return next;
      });

      const res = await analyzeArchiveArtworkPalette(artwork, 'auto');

      setAnalyzingArtworkIds((prev) => prev.filter((id) => id !== artwork.id));

      if (res.ok && res.artwork) {
        applyAnalyzedArtworkUpdate(res.artwork);
        showToast(`'${artwork.title}' için renk paleti çıkarıldı ve kaydedildi.`, 'success');
      } else {
        const errMsg = res.error || 'Görsel erişimi başarısız.';
        setFailedArtworkErrors((prev) => ({
          ...prev,
          [artwork.id]: errMsg,
        }));
        setArchiveItems((prev) =>
          prev.map((item) =>
            item.id === artwork.id
              ? { ...item, analysisStatus: 'failed_image_analysis', analysisError: errMsg }
              : item
          )
        );
        showToast(`'${artwork.title}' analiz edilemedi: ${errMsg}`, 'error');
      }
    },
    [applyAnalyzedArtworkUpdate, showToast]
  );

  // Batch archive palette extraction (max 2 concurrent requests, cancelable)
  const handleRunBatchPaletteAnalysis = useCallback(async () => {
    if (isBatchRunning) return;

    const pendingItems = archiveItems.filter(
      (item) => !Array.isArray(item.dominantColors) || item.dominantColors.length === 0
    );

    if (pendingItems.length === 0) {
      showToast('Tüm arşiv eserlerinin renk paletleri zaten hazır.', 'info');
      return;
    }

    const controller = new AbortController();
    batchAbortControllerRef.current = controller;
    setIsBatchRunning(true);

    const summary = await runBatchArchivePaletteAnalysis(pendingItems, {
      concurrency: 2,
      signal: controller.signal,
      onProgress: (progress) => {
        setBatchProgress({ ...progress });
      },
      onItemSuccess: (updatedArtwork) => {
        applyAnalyzedArtworkUpdate(updatedArtwork);
      },
      onItemFailure: (artworkId, errorMessage) => {
        setFailedArtworkErrors((prev) => ({
          ...prev,
          [artworkId]: errorMessage,
        }));
        setArchiveItems((prev) =>
          prev.map((item) =>
            item.id === artworkId
              ? { ...item, analysisStatus: 'failed_image_analysis', analysisError: errorMessage }
              : item
          )
        );
      },
    });

    setIsBatchRunning(false);
    batchAbortControllerRef.current = null;

    if (summary.cancelled) {
      showToast(
        `Toplu analiz durduruldu: ${summary.succeeded} palet kaydedildi.`,
        'info'
      );
    } else if (summary.failed > 0) {
      showToast(
        `Toplu analiz tamamlandı: ${summary.succeeded} başarılı, ${summary.failed} başarısız.`,
        'info'
      );
    } else {
      showToast(
        `${summary.succeeded} arşiv eserinin renk paleti başarıyla oluşturuldu.`,
        'success'
      );
    }
  }, [archiveItems, isBatchRunning, applyAnalyzedArtworkUpdate, showToast]);

  const handleStopBatchPaletteAnalysis = useCallback(() => {
    batchAbortControllerRef.current?.abort();
  }, []);

  // Save analysis to local archive
  const handleSaveToArchive = useCallback(() => {
    if (!analysisData) return;
    const res = saveUserArtwork(analysisData);
    if (res.success) {
      setArchiveItems(getArchiveItems());
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  }, [analysisData, showToast]);

  // Download metadata as JSON
  const handleDownloadJson = useCallback(() => {
    if (!analysisData) return;
    exportMetadataAsJson(analysisData);
    showToast('Metadata JSON dosyası indirildi.', 'success');
  }, [analysisData, showToast]);

  // Inspect artwork in detail modal
  const handleInspectArtwork = useCallback((artwork: ArtworkMetadata) => {
    setModalArtwork(artwork);
    setIsModalOpen(true);
  }, []);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setModalArtwork(null);
  }, []);

  // Load modal or archive artwork directly into analyzer
  const handleLoadIntoAnalyzer = useCallback(
    (artwork: ArtworkMetadata) => {
      const sourceUrl = artwork.thumbnailUrl || artwork.imageUrl;
      const metaForAnalyzer: Partial<ArtworkMetadata> = {
        ...artwork,
        isCustom: artwork.isCustom ?? false,
      };
      setSelectedImageSrc(sourceUrl);
      setCurrentArtworkMeta(metaForAnalyzer);
      setActiveSection('analyzer');

      if (artwork.dominantColors && artwork.dominantColors.length > 0) {
        setAnalysisData(artwork);
        setCurrentMetaStrip(
          `${artwork.dimensions || 'Müze Kaydı'} · ${artwork.dominantColors.length} Küme · ${artwork.overallTemperature}`
        );
        showToast(`'${artwork.title}' analizöre aktarıldı.`, 'info');
      } else {
        showToast(`'${artwork.title}' için piksel renk analizi başlatılıyor...`, 'info');
        performAnalysis(sourceUrl, metaForAnalyzer, clusterCount);
      }
    },
    [showToast, clusterCount, performAnalysis]
  );

  return (
    <div className="site-wrapper">
      {/* 3-Zone Institutional Top Bar */}
      <Navbar activeSection={activeSection} onNavigate={setActiveSection} />

      {/* Main Content Area */}
      <main className="main-content container" id="mainContent">
        {/* HOME SECTION (Strict Editorial Showcase — Separate from Analyzer) */}
        {activeSection === 'home' && (
          <section className="app-section active" aria-label="Ana Sayfa">
            <HomeOverview
              archiveItems={archiveItems}
              onNavigate={setActiveSection}
              onInspectArtwork={handleInspectArtwork}
            />
          </section>
        )}

        {/* ANALYZER SECTION */}
        {activeSection === 'analyzer' && (
          <section className="section-block">
            <div className="section-header-compact">
              <div className="badge-tag">
                <span>PİKSEL KÜMELEME MOTORU</span>
              </div>
              <h2 className="section-title">Görsel Renk Analizi ve Palet Üretici</h2>
              <p className="section-lead">
                JPG, PNG veya WEBP formatında bir görsel yükleyin veya aşağıdaki örnek başyapıtlardan birini seçin.
                Canvas API piksel verilerini tarar ve K-Means++ algoritması insan algısına duyarlı ağırlıklı
                Öklid mesafesiyle baskın 5–8 rengi ve kullanım yüzdelerini hesaplar.
              </p>
            </div>

            <ImageUploader
              onImageSelected={handleImageSelected}
              currentPreviewSrc={selectedImageSrc}
              currentMetaStrip={currentMetaStrip}
              isLoading={isLoading}
              onShowToast={showToast}
            />

            <ColorPalette
              analysisData={analysisData}
              clusterCount={clusterCount}
              onClusterCountChange={handleClusterCountChange}
              paletteViewMode={paletteViewMode}
              onPaletteViewModeChange={setPaletteViewMode}
              onSaveToArchive={handleSaveToArchive}
              onDownloadJson={handleDownloadJson}
              onCopyHex={handleCopyHex}
            />
          </section>
        )}

        {/* ARCHIVE GALLERY SECTION */}
        {activeSection === 'archive' && (
          <section className="section-block">
            <ArchiveGallery
              items={archiveItems}
              searchQuery={gallerySearchQuery}
              onSearchQueryChange={setGallerySearchQuery}
              categoryFilter={galleryCategoryFilter}
              onCategoryFilterChange={setGalleryCategoryFilter}
              temperatureFilter={galleryTempFilter}
              onTemperatureFilterChange={setGalleryTempFilter}
              onInspectArtwork={handleInspectArtwork}
              onAnalyzeArtwork={handleLoadIntoAnalyzer}
              onGenerateArtworkPalette={handleGenerateArtworkPalette}
              onRunBatchPaletteAnalysis={handleRunBatchPaletteAnalysis}
              onStopBatchPaletteAnalysis={handleStopBatchPaletteAnalysis}
              analyzingArtworkIds={analyzingArtworkIds}
              failedArtworkErrors={failedArtworkErrors}
              batchProgress={batchProgress}
              isBatchRunning={isBatchRunning}
            />
          </section>
        )}

        {/* CHROMATIC SEARCH SECTION */}
        {activeSection === 'search' && (
          <section className="section-block">
            <SearchBar
              archiveItems={archiveItems}
              onSelectArtwork={handleInspectArtwork}
              onCopyColor={handleCopyHex}
            />
          </section>
        )}

        {/* STATISTICS SECTION */}
        {activeSection === 'stats' && (
          <section className="section-block">
            <Statistics
              archiveItems={archiveItems}
              onSelectArtwork={handleInspectArtwork}
            />
          </section>
        )}

        {/* ABOUT & METHODOLOGY SECTION */}
        {activeSection === 'about' && (
          <section className="section-block">
            <About />
          </section>
        )}
      </main>

      {/* Curatorial Footer */}
      <Footer onNavigate={setActiveSection} />

      {/* Accessible Artwork Detail Modal */}
      <ArtworkModal
        artwork={modalArtwork}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCopyColor={handleCopyHex}
        onLoadIntoAnalyzer={handleLoadIntoAnalyzer}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} />
    </div>
  );
}
