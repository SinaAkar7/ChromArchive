/**
 * @file src/App.tsx
 * @description ChromArchive: Yapay Zekâ Destekli Görsel Renk Analizi ve Dijital Arşiv Sistemi.
 * Modern, strict TypeScript + React SPA application with client-side Canvas K-Means++ analysis.
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  exportMetadataAsJson
} from './services/archiveService';

import { Navbar } from './components/Navbar';
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

  // Archive & Analysis State
  const [archiveItems, setArchiveItems] = useState<ArtworkMetadata[]>([]);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [currentArtworkMeta, setCurrentArtworkMeta] = useState<Partial<ArtworkMetadata>>({});
  const [analysisData, setAnalysisData] = useState<ArtworkMetadata | null>(null);
  const [currentMetaStrip, setCurrentMetaStrip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Gallery Filters
  const [gallerySearchQuery, setGallerySearchQuery] = useState<string>('');
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('all');
  const [galleryTempFilter, setGalleryTempFilter] = useState<string>('all');

  // Modal State
  const [modalArtwork, setModalArtwork] = useState<ArtworkMetadata | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load archive items on mount
  useEffect(() => {
    const items = getArchiveItems();
    setArchiveItems(items);
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

  // Core Canvas K-Means analysis runner
  const performAnalysis = useCallback(
    async (
      src: string,
      metaOverrides: Partial<ArtworkMetadata>,
      kOption: ClusterCountOption
    ) => {
      setIsLoading(true);
      try {
        const result = await analyzeImageSource(src, kOption, metaOverrides);
        setAnalysisData(result);
        setCurrentMetaStrip(
          `${result.dimensions || '300x300'} · ${result.dominantColors.length} Küme · ${result.overallTemperature} Ton`
        );
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
    [showToast]
  );

  // Handle new image upload or preset click
  const handleImageSelected = useCallback(
    (src: string, meta: Partial<ArtworkMetadata>) => {
      setSelectedImageSrc(src);
      setCurrentArtworkMeta(meta);
      performAnalysis(src, meta, clusterCount);
      // Auto switch or scroll to analyzer if on home
      if (activeSection === 'home') {
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

  // Load modal artwork directly into analyzer
  const handleLoadIntoAnalyzer = useCallback(
    (artwork: ArtworkMetadata) => {
      setSelectedImageSrc(artwork.imageUrl);
      setCurrentArtworkMeta(artwork);
      setAnalysisData(artwork);
      setCurrentMetaStrip(
        `${artwork.dimensions || 'Müze Kaydı'} · ${artwork.dominantColors.length} Küme · ${artwork.overallTemperature}`
      );
      setActiveSection('analyzer');
      showToast(`'${artwork.title}' analizöre aktarıldı.`, 'info');
    },
    [showToast]
  );

  return (
    <div className="site-wrapper">
      {/* 3-Zone Institutional Top Bar */}
      <Navbar activeSection={activeSection} onNavigate={setActiveSection} />

      {/* Main Content Area */}
      <main className="main-content container" id="mainContent">
        {/* HERO / HOME SECTION */}
        {activeSection === 'home' && (
          <section className="hero-section">
            <div className="hero-text-container">
              <div className="curatorial-badge">
                <span className="badge-dot" />
                <span>MÜZE & AÇIK ERİŞİM DİJİTAL ARŞİVİ</span>
              </div>
              <h1 className="hero-headline">
                Yapay Zekâ Destekli Görsel Renk Analizi ve Dijital Arşiv Sistemi
              </h1>
              <p className="hero-subline">
                The Metropolitan Museum of Art ve Wikimedia Commons açık erişimli sanat koleksiyonlarının
                kromatik mirasını piksel düzeyinde keşfedin. K-Means++ kümeleme algoritmasıyla kendi görsellerinizi
                tarayıcınızda doğrudan analiz edin ve renk benzerliklerine göre arşivde arama yapın.
              </p>
              <div className="hero-cta-group">
                <button
                  type="button"
                  className="hero-btn-primary"
                  onClick={() => setActiveSection('analyzer')}
                >
                  Görsel Analizörünü Başlat
                </button>
                <button
                  type="button"
                  className="hero-btn-secondary"
                  onClick={() => setActiveSection('archive')}
                >
                  Koleksiyonu İncele ({archiveItems.length} Eser)
                </button>
              </div>
            </div>

            {/* Quick Demo Preview on Home */}
            <div className="hero-feature-panel">
              <ImageUploader
                onImageSelected={handleImageSelected}
                currentPreviewSrc={selectedImageSrc}
                currentMetaStrip={currentMetaStrip}
                isLoading={isLoading}
                onShowToast={showToast}
              />
              {analysisData && (
                <div style={{ marginTop: '2rem' }}>
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
                </div>
              )}
            </div>
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
