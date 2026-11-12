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
  objectId?: number;
  thumbnailUrl?: string;
  department?: string;
  isPublicDomain?: boolean;
  museumRecordUrl?: string;
  source?: string;
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

export interface ColorMeaningSource {
  id: string;
  title: string;
  url: string;
  type: string;
  notes: string;
}

export interface HistoricalContextItem {
  period: string;
  region: string;
  detail: string;
  sourceIds: string[];
}

export interface DocumentedMeaningItem {
  context: string;
  meanings: string[];
  note?: string;
  sourceIds: string[];
}

export interface ColorMeaningEntry {
  id: string;
  name: {
    tr: string;
    en: string;
  };
  family: 'warm' | 'cool' | 'neutral' | 'mixed' | 'earth' | string;
  displayHex: string;
  displayHexNote?: string;
  description: string;
  historicalContext: HistoricalContextItem[];
  documentedMeanings: DocumentedMeaningItem[];
  modernUses: string[];
  evidenceLevel: 'mixed' | 'historical' | 'limited' | string;
  tags: string[];
  editorialNote?: string;
}

export interface ColorMeaningsDataset {
  schemaVersion: string;
  dataset: {
    id: string;
    name: string;
    language: string;
    description: string;
    created: string;
    license: string;
    editorialPolicy: string[];
  };
  sources: ColorMeaningSource[];
  colors: ColorMeaningEntry[];
}

