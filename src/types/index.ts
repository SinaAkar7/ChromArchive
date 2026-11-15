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

export type TemperatureCategoryId = 'warm' | 'transitional' | 'cool' | 'neutral';

export type TemperatureConfidenceLevel = 'high' | 'medium' | 'low';

export interface SpatialTemperatureRelation {
  clusterA: string;
  clusterAName?: string;
  clusterB: string;
  clusterBName?: string;
  relation: string;
  warmthScoreDifference: number;
  sharedBoundarySamples: number;
  evidence: 'shared_sampled_boundary';
}

export interface DominantColor {
  hex: string;
  rgb: [number, number, number];
  rgbString: string;
  percentage: number;
  name: string;
  family: ColorFamily;
  temperature: ColorTemperature;
  warmthScore?: number;
  temperatureCategory?: TemperatureCategoryId;
  temperatureLabel?: string;
  temperatureConfidence?: TemperatureConfidenceLevel;
  temperatureConfidenceLabel?: string;
  temperatureBasis?: string;
  relativeToPalette?: string;
  relativeToPaletteDelta?: number;
  undertoneNote?: string;
  cielabChroma?: number;
}

export interface ColorAnalysisResult {
  dominantColors: DominantColor[];
  overallTemperature: string;
  colorDiversityScore: number;
  clusterCountUsed: number;
  analyzedPixels: number;
  sampleResolution: string;
  warmthScoreWeightedMean?: number | null;
  warmSharePercent?: number;
  coolSharePercent?: number;
  transitionalSharePercent?: number;
  neutralSharePercent?: number;
  temperatureSummary?: string;
  temperatureModelVersion?: string;
  spatialTemperatureRelations?: SpatialTemperatureRelation[];
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
  warmthScoreWeightedMean?: number | null;
  warmSharePercent?: number;
  coolSharePercent?: number;
  transitionalSharePercent?: number;
  neutralSharePercent?: number;
  temperatureSummary?: string;
  temperatureModelVersion?: string;
  spatialTemperatureRelations?: SpatialTemperatureRelation[];
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

export interface ArchiveColorIndexEntry {
  objectId: number;
  dominantColors: DominantColor[];
  overallTemperature: string;
  clusterCountUsed: number;
  analysisDate: string;
  algorithmVersion: string;
  colorDiversityScore?: number;
  warmthScoreWeightedMean?: number | null;
  warmSharePercent?: number;
  coolSharePercent?: number;
  transitionalSharePercent?: number;
  neutralSharePercent?: number;
  temperatureSummary?: string;
  temperatureModelVersion?: string;
}

export interface ArtworkColorMatchResult {
  artwork: ArtworkMetadata;
  closestColor: DominantColor;
  deltaE: number;
  similarityLabel: string;
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
  transitionalCount?: number;
  transitionalPercent?: number;
  analyzedArtworkCount?: number;
  avgWarmthScore?: number | null;
  weightedWarmSharePercent?: number;
  weightedCoolSharePercent?: number;
  weightedTransitionalSharePercent?: number;
  weightedNeutralSharePercent?: number;
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

export interface HistoricalPigmentSample {
  name: string;
  materials: string;
  period: string;
  region: string;
  note?: string;
  sourceIds: string[];
}

export interface MeaningShiftItem {
  period: string;
  region: string;
  shift: string;
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
  regionsAndCultures?: string[];
  artHistoryUsage?: string;
  historicalContext: HistoricalContextItem[];
  historicalPigments?: HistoricalPigmentSample[];
  meaningShifts?: MeaningShiftItem[];
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

export type ColorDictionaryFamily =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'beige'
  | 'gray'
  | 'black'
  | 'white';

export interface RgbObject {
  r: number;
  g: number;
  b: number;
}

export interface HslObject {
  h: number;
  s: number;
  l: number;
}

export interface CielabColor {
  L: number;
  a: number;
  b: number;
}

export interface NamedColorEntry {
  id: string;
  name: string;
  hex: string;
  rgb: RgbObject;
  hsl: HslObject;
  family: ColorDictionaryFamily;
  tags: string[];
  source: string;
}

export interface ColorDictionarySourceInfo {
  name: string;
  url: string;
  license: string;
  attribution?: string;
}

export interface ColorsDataset {
  schemaVersion: string;
  dataset: {
    id: string;
    name: string;
    totalColors: number;
    generatedAt: string;
    analysisMethodNote?: string;
    excludedSourcesNote?: string;
    sources: ColorDictionarySourceInfo[];
  };
  colors: NamedColorEntry[];
}

export interface ColorSearchResult {
  color: NamedColorEntry;
  lab: CielabColor;
  deltaE: number;
  similarityLabel: string;
}

export interface ColorHistoricalInsight {
  dominantColor: DominantColor;
  validatedHex: string;
  validatedRgb: RgbObject;
  nearestDictionaryMatch: ColorSearchResult | null;
  topDictionaryMatches: ColorSearchResult[];
  matchedMeaningId: string;
  meaningEntry: ColorMeaningEntry | null;
  sources: ColorMeaningSource[];
  approximationNote: string;
}

export interface HistoricalPigmentSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  type: string;
  access: string;
}

export interface HistoricalPigmentContextItem {
  period: string;
  region: string;
  detail: string;
  sourceIds: string[];
}

export interface HistoricalPigmentEntry {
  id: string;
  name: {
    tr: string;
    en: string;
  };
  aliases?: string[];
  family: ColorDictionaryFamily | string;
  displayHex: string;
  displayRgb: RgbObject;
  displayHexNote: string;
  composition: string;
  historicalBackground: HistoricalPigmentContextItem[];
  documentedArtisticUses: string[];
  conservationAndSafetyNotes: string;
  evidenceLevel: string;
  sourceIds: string[];
  analysisCaution: string;
}

export interface HistoricalColorFamilyOverview {
  id: ColorDictionaryFamily | string;
  name: {
    tr: string;
    en: string;
  };
  historicalOverview: string;
  pigmentIds: string[];
}

export interface HistoricalPigmentsDataset {
  schemaVersion: string;
  dataset: {
    id: string;
    name: string;
    language: string;
    created: string;
    totalPigments: number;
    totalColorFamilies: number;
    description: string;
    licenseNote: string;
    displayHexPolicy: string;
    editorialPolicy: string[];
    totalSources: number;
    methodNote: string;
  };
  sources: HistoricalPigmentSource[];
  colorFamilies: HistoricalColorFamilyOverview[];
  pigments: HistoricalPigmentEntry[];
}

export interface HistoricalPigmentMatch {
  pigment: HistoricalPigmentEntry;
  deltaE: number;
  similarityLabel: string;
  explanation: string;
  colorFamilyOverview: HistoricalColorFamilyOverview | null;
}

export interface FamilyRelativeUndertoneRule {
  familyId: ColorFamily | string;
  warmDirectionTr: string;
  coolDirectionTr: string;
  note?: string;
}

export interface TemperatureRuleSource {
  id: string;
  title: string;
  publisher?: string;
  authors?: string;
  publication?: string;
  doi?: string;
  url: string;
  license?: string;
  licenseNote?: string;
  limitation?: string;
  supports: string[];
}

export interface ColorTemperatureRulesDataset {
  schemaVersion: string;
  dataset: {
    id: string;
    name: string;
    language: string;
    created: string;
    purpose: string;
    modelType: string;
    runtimeNetworkRequired: boolean;
    licenseNote: string;
  };
  importantDefinitions: {
    visualTemperature: string;
    absoluteVsRelative: string;
    hexLimitation: string;
    contextLimitation: string;
  };
  classificationModel: {
    id: string;
    description: string;
    coordinateSystem: string;
    anchors: {
      warmPoleHueDeg: number;
      warmPoleLabel: string;
      coolPoleHueDeg: number;
      coolPoleLabel: string;
      anchorNote: string;
    };
    warmthScore: {
      range: number[];
      meaning: string;
      formula: string;
      implementationNotes: string[];
    };
    categories: {
      warm: { minInclusive: number; labelTr: string };
      transitional: { minInclusive: number; maxExclusive: number; labelTr: string };
      cool: { maxExclusive: number; labelTr: string };
      neutral: { condition: string; labelTr: string };
    };
    neutralGate: {
      hslSaturationBelow: number;
      hsvSaturationBelow?: number;
      cielabChromaBelow: number;
      extremeLightnessLow?: number;
      extremeLightnessHigh?: number;
      extremeLightnessMaxChroma?: number;
      combineWith: 'OR' | 'AND' | string;
      note: string;
    };
    multiFactorWeighting?: {
      chromaFloor: number;
      chromaFullRange: number;
      effectiveSatWeights: { hsl: number; hsv: number };
      satFloor: number;
      satFullRange: number;
      strengthBlend: { chroma: number; saturation: number };
      lightnessPeakRange: number[];
      lightnessFloorEnvelope: number;
      earthBeigeModeration: {
        hueRangeDeg: number[];
        mutedChromaThreshold: number;
        mutedEffectiveSatThreshold: number;
        lightBeigeThreshold: number;
        darkEarthThreshold: number;
        minRednessRatioForFullWarmth: number;
        yellowishBrownFactor: number;
        paleBeigeFactor: number;
        mutedUmberFactor: number;
        orangishEarthFactor: number;
        neutralFamilyFactor: number;
      };
    };
    confidence: {
      formula: string;
      levels: Array<{
        id: TemperatureConfidenceLevel;
        minInclusive?: number;
        maxExclusive?: number;
        labelTr: string;
      }>;
      neutralConfidence: string;
    };
  };
  familyRelativeUndertones: FamilyRelativeUndertoneRule[];
  paletteAggregation: {
    weightBy: string;
    ignoreNeutralForChromaticMean: boolean;
    calculate: string[];
    overallLabels: Array<{
      condition: string;
      labelTr: string;
    }>;
    relativeToPalette: {
      deltaThreshold: number;
      labels: {
        above: string;
        below: string;
        within: string;
      };
      formula: string;
    };
  };
  spatialContext: {
    enabled: boolean;
    purpose: string;
    recommendedSampling: {
      gridSampling: boolean;
      maxCanvasDimensionPx: number;
      sampleStepPx: number;
      adjacency: string;
      minSharedBoundarySamples: number;
    };
    analysisRules: string[];
  };
  guardrails: string[];
  sources: TemperatureRuleSource[];
}

export interface WarmCoolResearchReferenceDataset {
  schemaVersion: string;
  dataset: {
    id: string;
    title: string;
    primaryPublication: {
      authors: string;
      year: number;
      title: string;
      journal: string;
      volume: string;
      issue: string;
      article: string;
      doi: string;
      url: string;
      license: string;
    };
    curatedExport: {
      repository: string;
      maintainer: string;
      canonicalCsvUrl: string;
      metadataUrl: string;
      datasetPage: string;
      license: string;
      note: string;
    };
    recordCount: number;
    includedParticipants: number;
    totalParticipants: number;
    hueAnglesTested: number;
    luminanceLevelsCdM2: number[];
    coordinateSystem: {
      name: string;
      axes: string;
      unit: string;
      warning: string;
    };
    caveats: string[];
    attribution: string;
  };
  keyFindings: {
    warmPeakMeanConeOpponentDegAt20cd: number;
    coolPeakMeanConeOpponentDegAt20cd: number;
    boundary1MeanConeOpponentDegAt20cd: number;
    boundary2MeanConeOpponentDegAt20cd: number;
    interpretation: string;
  };
}

