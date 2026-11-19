/**
 * @file src/components/ImageUploader.tsx
 * @description İki durumlu görsel yükleme, canlı kamera fotoğrafı çekimi, sürükle-bırak,
 * hazır başyapıt örnekleri ve analiz sırasında/sonrasında korunan önizleme bileşeni.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, RotateCcw, Upload, X } from 'lucide-react';
import { ArtworkMetadata, SampleArtworkPreset } from '../types';

const SAMPLE_PRESETS: SampleArtworkPreset[] = [
  {
    id: 'vermeer',
    src: 'images/vermeer.jpg',
    name: 'Vermeer',
    title: 'Süt Döken Kadın (The Milkmaid)',
    artist: 'Johannes Vermeer',
    period: 'Hollanda Baroğu',
  },
  {
    id: 'hokusai',
    src: 'images/hokusai.jpg',
    name: 'Hokusai',
    title: 'Kanagawa Açıklarında Büyük Dalga',
    artist: 'Katsushika Hokusai',
    period: 'Edo Ukiyo-e',
  },
  {
    id: 'monet',
    src: 'images/monet.jpg',
    name: 'Monet',
    title: 'Nilüferler ve Japon Köprüsü',
    artist: 'Claude Monet',
    period: 'İzlenimcilik',
  },
  {
    id: 'cezanne',
    src: 'images/cezanne.jpg',
    name: 'Cézanne',
    title: 'Elmalı Natürmort',
    artist: 'Paul Cézanne',
    period: 'Post-İzlenimcilik',
  },
  {
    id: 'monalisa',
    src: 'images/monalisa.jpg',
    name: 'Mona Lisa',
    title: 'Mona Lisa (La Gioconda)',
    artist: 'Leonardo da Vinci',
    period: 'Yüksek Rönesans',
  },
];

type CameraStatus = 'idle' | 'starting' | 'active' | 'error';

interface ImageUploaderProps {
  onImageSelected: (src: string, meta: Partial<ArtworkMetadata>) => void;
  onResetAnalysis?: () => void;
  currentPreviewSrc: string | null;
  currentMetaStrip: string | null;
  currentArtworkTitle?: string;
  isCustomAnalysis?: boolean;
  isLoading: boolean;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onResetAnalysis,
  currentPreviewSrc,
  currentMetaStrip,
  currentArtworkTitle,
  isCustomAnalysis = false,
  isLoading,
  onShowToast,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Canlı kamera durumları (yalnızca kullanıcı açıkça "Kamerayı Aç" tıkladığında başlar)
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef<boolean>(true);
  const sessionCounterRef = useRef<number>(0);

  const hasActiveSession = Boolean(currentPreviewSrc) || isLoading;

  // Tüm MediaStreamTrack kanallarını güvenli şekilde durdurur ve video kaynağını temizler
  const stopCameraStream = useCallback(() => {
    sessionCounterRef.current += 1;

    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => {
        try {
          track.stop();
        } catch {
          // Tarayıcı durdurma istisnalarını sessizce yut
        }
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {
        // Ignore pause errors
      }
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
  }, []);

  const handleCloseCamera = useCallback(() => {
    stopCameraStream();
    setCameraOpen(false);
    setCameraStatus('idle');
    setCameraError(null);
  }, [stopCameraStream]);

  // Bileşen ayrılırken (sekme değişimi veya sayfa kapanışı) kamerayı mutlaka serbest bırak
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Analiz oturumu açıldığında olası açık kamera akışını kapat
  useEffect(() => {
    if (hasActiveSession && (cameraOpen || streamRef.current)) {
      stopCameraStream();
      setCameraOpen(false);
      setCameraStatus('idle');
      setCameraError(null);
    }
  }, [hasActiveSession, cameraOpen, stopCameraStream]);

  const mapCameraErrorMessage = (err: unknown): string => {
    const name =
      err && typeof err === 'object' && 'name' in err
        ? String((err as { name: unknown }).name)
        : '';

    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return 'Kamera izni verilmedi. Tarayıcı adres çubuğundan kamera iznini onaylayıp yeniden deneyebilir veya cihazdan görsel yükleyebilirsiniz.';
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return 'Cihazda kullanılabilir bir kamera bulunamadı. Cihazdan dosya yükleme veya örnek eserlerle devam edebilirsiniz.';
    }
    if (name === 'NotReadableError' || name === 'TrackStartError') {
      return 'Kamera şu anda başka bir uygulama veya sekme tarafından kullanılıyor. Diğer uygulamayı kapatıp yeniden deneyin.';
    }
    if (name === 'SecurityError') {
      return 'Güvenlik politikası nedeniyle kamera başlatılamadı (HTTPS veya localhost gereklidir).';
    }
    return 'Kamera başlatılırken bir hata oluştu. Lütfen tekrar deneyin veya cihazdan görsel yükleyin.';
  };

  const startCamera = useCallback(async () => {
    stopCameraStream();
    setCameraOpen(true);
    setCameraStatus('starting');
    setCameraError(null);
    setCameraReady(false);

    const requestId = ++sessionCounterRef.current;

    const isLocalHost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '[::1]');

    if (typeof window !== 'undefined' && !window.isSecureContext && !isLocalHost) {
      const msg =
        'Kamera erişimi yalnızca güvenli HTTPS bağlantısında veya localhost üzerinde çalışır. Cihazdan görsel yüklemeye devam edebilirsiniz.';
      setCameraStatus('error');
      setCameraError(msg);
      onShowToast(msg, 'error');
      return;
    }

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      const msg =
        'Tarayıcınız canlı kamera erişimini desteklemiyor. Cihazdan fotoğraf yükleme veya örnek eser seçimi ile devam edebilirsiniz.';
      setCameraStatus('error');
      setCameraError(msg);
      onShowToast(msg, 'error');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (constraintErr: unknown) {
        const errName =
          constraintErr && typeof constraintErr === 'object' && 'name' in constraintErr
            ? String((constraintErr as { name: unknown }).name)
            : '';
        if (errName === 'OverconstrainedError' || errName === 'ConstraintNotSatisfiedError') {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } else {
          throw constraintErr;
        }
      }

      if (!mountedRef.current || requestId !== sessionCounterRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      setCameraStatus('active');

      // Video elementi DOM'a bağlandığında akışı ata ve oynat
      requestAnimationFrame(() => {
        if (!mountedRef.current || requestId !== sessionCounterRef.current) return;
        const videoEl = videoRef.current;
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.play().catch(() => {
            // Auto-play engellenirse kullanıcı etkileşiminden sonraki metadata olayı beklenir
          });
        }
      });
    } catch (err: unknown) {
      stopCameraStream();
      if (!mountedRef.current || requestId !== sessionCounterRef.current) return;
      const msg = mapCameraErrorMessage(err);
      setCameraStatus('error');
      setCameraError(msg);
      onShowToast(msg, 'error');
    }
  }, [onShowToast, stopCameraStream]);

  const handleVideoMetadataLoaded = () => {
    const videoEl = videoRef.current;
    if (videoEl && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
      setCameraReady(true);
    }
  };

  const handleCapturePhoto = () => {
    const videoEl = videoRef.current;
    if (!videoEl || videoEl.videoWidth === 0 || videoEl.videoHeight === 0) {
      onShowToast('Kamera karesi henüz hazır değil, lütfen kısa bir an bekleyin.', 'info');
      return;
    }

    const width = videoEl.videoWidth;
    const height = videoEl.videoHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onShowToast('Fotoğraf yakalama için Canvas bağlamı oluşturulamadı.', 'error');
      return;
    }

    ctx.drawImage(videoEl, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Fotoğraf çekilir çekilmez canlı kamera akışını kapat
    handleCloseCamera();
    setActivePresetId(null);

    const timeLabel = new Date().toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    onImageSelected(dataUrl, {
      title: `Kamera Fotoğrafı (${timeLabel})`,
      artist: 'Kamera Çekimi',
      period: 'Anlık Kamera Analizi',
      dimensions: `${width} × ${height} px`,
      fileFormat: 'JPEG',
      isCustom: true,
    });
  };

  const handleFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      onShowToast('Hata: Yalnızca JPG, PNG veya WEBP formatları desteklenmektedir.', 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      onShowToast('Hata: Dosya boyutu çok büyük (Maksimum 25MB).', 'error');
      return;
    }

    handleCloseCamera();
    setActivePresetId(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onImageSelected(dataUrl, {
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Kullanıcı Görseli',
          period: 'Oturum İçi Analiz',
          fileFormat: file.type.split('/')[1]?.toUpperCase() || 'JPEG',
          isCustom: true,
        });
      }
    };
    reader.onerror = () => {
      onShowToast('Dosya okunurken bir hata oluştu.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePresetClick = (preset: SampleArtworkPreset) => {
    handleCloseCamera();
    setActivePresetId(preset.id);
    onImageSelected(preset.src, {
      title: preset.title,
      artist: preset.artist,
      period: preset.period,
      fileFormat: 'JPEG',
      isCustom: false,
    });
  };

  const handleReset = () => {
    handleCloseCamera();
    setActivePresetId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onResetAnalysis?.();
  };

  // DURUM B: Analiz Edilen / Yüklenen Görsel Önizleme Paneli
  if (hasActiveSession) {
    const sourceTag = isCustomAnalysis
      ? currentArtworkTitle?.startsWith('Kamera Fotoğrafı')
        ? 'Kamera Çekimi · Yalnızca Oturum İçi'
        : 'Cihaz Yüklemesi · Yalnızca Oturum İçi'
      : 'Müze Seçkisi · Referans Analiz';

    return (
      <div className="upload-panel upload-panel-preview-mode" id="activePreviewPanel">
        <div className="preview-header-bar">
          <div className="preview-title-group">
            <span className="preview-source-label">{sourceTag}</span>
            <h3 className="preview-artwork-title">
              {currentArtworkTitle || 'Analiz Edilen Görsel'}
            </h3>
          </div>
          {onResetAnalysis && (
            <button
              type="button"
              className="btn-secondary btn-reset-analysis"
              id="previewNewAnalysisBtn"
              onClick={handleReset}
              disabled={isLoading}
            >
              <RotateCcw size={14} />
              <span>Yeni Görsel Analiz</span>
            </button>
          )}
        </div>

        {currentPreviewSrc && (
          <div className="preview-container active" id="previewContainer">
            <div className="image-preview-wrapper">
              <img
                src={currentPreviewSrc}
                id="analysisPreviewImg"
                className="image-preview"
                alt={currentArtworkTitle || 'Analiz Önizlemesi'}
              />
            </div>
            {currentMetaStrip && (
              <div className="image-meta-strip" id="previewMetaStrip">
                <span>{currentMetaStrip}</span>
              </div>
            )}
          </div>
        )}

        <p className="preview-privacy-note">
          {isCustomAnalysis
            ? 'Bu görsel ve elde edilen renk paleti yalnızca tarayıcı belleğinde işlenir; dijital arşive, localStorage veya harici bir sunucuya kaydedilmez.'
            : 'Referans eser tarayıcı içinde K-Means++ piksel kümelemesi ile analiz edilir.'}
        </p>
      </div>
    );
  }

  // DURUM A: Henüz Görsel Seçilmemiş Başlangıç / Kaynak Seçim Ekranı
  return (
    <div className="upload-panel upload-panel-entry-mode" id="entryUploaderPanel">
      {/* Sürükle Bırak Alanı */}
      <div
        className={`drop-zone ${dragOver ? 'dragover' : ''}`}
        id="imageDropZone"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
      >
        <svg
          className="drop-zone-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <div className="drop-zone-title">Görseli Buraya Sürükleyin veya Seçin</div>
        <div className="drop-zone-subtext">
          JPG, JPEG, PNG veya WEBP formatları desteklenir (Maks. 25 MB) · Arşive kaydedilmez
        </div>
        <input
          type="file"
          ref={fileInputRef}
          id="imageFileInput"
          accept=".jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />
      </div>

      {/* Dosya Yükleme & Canlı Kamera Tetikleyicileri */}
      <div className="upload-camera-trigger-row">
        <button
          type="button"
          className="btn-secondary"
          id="triggerFileUploadBtn"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={15} />
          <span>Dosya Seç</span>
        </button>

        <button
          type="button"
          className={`btn-open-camera ${cameraOpen ? 'is-active' : ''}`}
          id="openCameraBtn"
          onClick={() => {
            if (cameraOpen && cameraStatus === 'active') {
              handleCloseCamera();
            } else {
              void startCamera();
            }
          }}
        >
          <Camera size={15} />
          <span>{cameraOpen && cameraStatus === 'active' ? 'Kamerayı Kapat' : 'Kamerayı Aç'}</span>
        </button>
      </div>

      {/* Canlı Kamera Çekim Alanı (Yalnızca Kullanıcı "Kamerayı Aç" Dedikten Sonra) */}
      {cameraOpen && (
        <div className="camera-capture-panel" id="cameraCapturePanel" role="region" aria-label="Canlı Kamera Çekimi">
          <div className="camera-panel-header">
            <div className="camera-panel-title-group">
              <Camera size={16} />
              <h4>Canlı Kamera Çekimi</h4>
            </div>
            <button
              type="button"
              className="camera-close-icon-btn"
              onClick={handleCloseCamera}
              aria-label="Kamerayı Kapat"
            >
              <X size={16} />
            </button>
          </div>

          {cameraStatus === 'error' && cameraError ? (
            <div className="camera-error-box" role="alert">
              <p>{cameraError}</p>
              <div className="camera-controls-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => void startCamera()}
                >
                  <RefreshCw size={14} />
                  <span>Kamerayı Yeniden Aç</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseCamera}
                >
                  <X size={14} />
                  <span>Kamerayı Kapat</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="camera-video-frame">
                <video
                  ref={videoRef}
                  className="camera-live-video"
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={handleVideoMetadataLoaded}
                  onCanPlay={handleVideoMetadataLoaded}
                />
                {(cameraStatus === 'starting' || !cameraReady) && (
                  <div className="camera-placeholder-box">
                    <div className="analysis-spinner" />
                    <span>Kamera akışı başlatılıyor...</span>
                  </div>
                )}
              </div>

              <div className="camera-controls-row">
                <button
                  type="button"
                  className="btn-primary"
                  id="captureCameraPhotoBtn"
                  onClick={handleCapturePhoto}
                  disabled={!cameraReady || cameraStatus !== 'active'}
                >
                  <Camera size={15} />
                  <span>Fotoğraf Çek</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  id="restartCameraBtn"
                  onClick={() => void startCamera()}
                >
                  <RefreshCw size={14} />
                  <span>Kamerayı Yeniden Aç</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  id="closeCameraBtn"
                  onClick={handleCloseCamera}
                >
                  <X size={14} />
                  <span>Kamerayı Kapat</span>
                </button>
              </div>
            </>
          )}

          <p className="camera-privacy-hint">
            Fotoğraf çekildiği anda kamera akışı otomatik kapatılır; görüntü yalnızca bu analiz oturumu için kullanılır ve arşive kaydedilmez.
          </p>
        </div>
      )}

      {/* Hızlı Örnek Eser Seçici */}
      <div className="samples-selector">
        <span className="samples-label">Veya Örnek Eserle Test Edin</span>
        <div className="sample-buttons-row">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`sample-thumbnail-btn ${
                activePresetId === preset.id ? 'active' : ''
              }`}
              onClick={() => handlePresetClick(preset)}
              title={`${preset.title} - ${preset.artist}`}
            >
              <img
                src={preset.src}
                alt={preset.name}
                className="sample-thumb-img"
                loading="lazy"
              />
              <span className="sample-thumb-name">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
