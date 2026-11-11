/**
 * @file src/types/index.ts
 * @description ChromArchive uygulaması için güçlü TypeScript tip ve arayüz tanımları.
 */

export type ColorFamily =
  | 'Mavi'
  | 'Sarı'
  | 'Yeşil'
  | 'Kırmızı'
  | 'Turuncu'
  | 'Mor'
  | 'Nötr';

export type ColorTemperature = 'Sıcak' | 'Soğuk' | 'Nötr';

export interface DominantColor {
  hex: string;
  rgb: [number, number, number];
  rgbString: string;
  percentage: number;
  name: string;
  family: ColorFamily;
  temperature: ColorTemperature;
}

export interface ColorAnalysisResult {
  dominantColors: DominantColor[];
  overallTemperature: string;
  colorDiversityScore: number;
  clusterCountUsed: number;
  analyzedPixels: number;
  sampleResolution: string;
}

export interface ArtworkMetadata {
  id: string;
  title: string;
  artist: string;
  date: string;
  year?: string;
  category?: string;
  period: string;
  institution: string;
  accessionNumber: string;
  sourceUrl: string;
  museumUrl?: string;
  license: string;
  rights?: string;
  medium: string;
  dimensions: string;
  description: string;
  imageUrl: string;
  tags?: string[];
  culture?: string;
  dominantColors: DominantColor[];
  overallTemperature: string;
  dominantCount: number;
  analysisDate: string;
  colorDiversityScore?: number;
  fileFormat?: string;
  isCustom?: boolean;
  similarityScore?: number;
  closestColor?: DominantColor;
}

export type ClusterCountOption = 'auto' | 5 | 6 | 7 | 8;

export type PaletteViewMode = 'horizontal' | 'grid';

export type NavigationSection =
  | 'home'
  | 'analyzer'
  | 'archive'
  | 'search'
  | 'stats'
  | 'about';

export interface ColorFamilyStat {
  family: string;
  count: number;
  percent: number;
  color: string;
}

export interface ArchiveStatistics {
  totalArtworks: number;
  totalColors: number;
  avgDiversity: number;
  dominantTemperature: string;
  warmCount: number;
  warmPercent: number;
  coolCount: number;
  coolPercent: number;
  neutralCount: number;
  neutralPercent: number;
  topFamilies: ColorFamilyStat[];
}

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}

export interface SampleArtworkPreset {
  id: string;
  src: string;
  name: string;
  title: string;
  artist: string;
  period: string;
}
