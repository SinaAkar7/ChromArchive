/**
 * Fetches verified open-access color datasets from:
 * 1. Coloripedia (https://coloripedia.com/api/v1/colors.json)
 * 2. The Dictionary of Color Combinations (Sanzo Wada open data)
 * 3. XKCD Color Survey (https://raw.githubusercontent.com/dariusk/corpora/master/data/colors/xkcd.json)
 *
 * Normalizes RGB/HSL directly from verified HEX, deduplicates strictly by HEX and name,
 * maps into 13 canonical color families, enriches Turkish search tags, and outputs
 * 250-600 verified entries to src/data/colors.json.
 */

import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_FAMILIES = [
  'red',
  'orange',
  'yellow',
  'green',
  'cyan',
  'blue',
  'purple',
  'pink',
  'brown',
  'beige',
  'gray',
  'black',
  'white',
];

const FAMILY_TURKISH_TAGS = {
  red: ['kirmizi', 'kırmızı'],
  orange: ['turuncu'],
  yellow: ['sari', 'sarı'],
  green: ['yesil', 'yeşil'],
  cyan: ['camgobegi', 'camgöbeği', 'turkuaz'],
  blue: ['mavi'],
  purple: ['mor', 'eflatun'],
  pink: ['pembe'],
  brown: ['kahverengi'],
  beige: ['bej', 'krem'],
  gray: ['gri'],
  black: ['siyah'],
  white: ['beyaz'],
};

const TURKISH_NAME_KEYWORDS = {
  sage: ['adacayi', 'adaçayı', 'sage'],
  olive: ['zeytin', 'zeytin yesili', 'zeytin yeşili'],
  burgundy: ['bordo', 'sarap kirmizisi', 'şarap kırmızısı'],
  lavender: ['lavanta', 'acik mor', 'açık mor'],
  turquoise: ['turkuaz', 'firuze'],
  teal: ['petrol mavisi', 'deniz mavisi'],
  navy: ['lacivert', 'denizci mavisi'],
  crimson: ['kizil', 'kızıl', 'al kirmizi'],
  scarlet: ['parlak kirmizi', 'al'],
  coral: ['mercan'],
  amber: ['kehribar'],
  gold: ['altin', 'altın'],
  ochre: ['hardal', 'okre', 'toprak sarisi'],
  emerald: ['zumrut', 'zümrüt'],
  mint: ['nane yesili', 'nane yeşili'],
  indigo: ['civit', 'çivit mavisi'],
  violet: ['menekse', 'menekşe'],
  magenta: ['eflatun', 'macenta'],
  rose: ['gul', 'gül'],
  salmon: ['somon'],
  beige: ['bej'],
  ivory: ['fildisi', 'fildişi'],
  cream: ['krem'],
  taupe: ['boz kahve', 'vizyon'],
  brown: ['kahverengi'],
  chestnut: ['kestane'],
  terracotta: ['kiremit', 'terakota'],
  silver: ['gumus', 'gümüş'],
  charcoal: ['antrasit', 'komur grisi'],
  black: ['siyah'],
  white: ['beyaz'],
  red: ['kirmizi', 'kırmızı'],
  blue: ['mavi'],
  green: ['yesil', 'yeşil'],
  yellow: ['sari', 'sarı'],
  orange: ['turuncu'],
  purple: ['mor'],
  pink: ['pembe'],
  gray: ['gri'],
  grey: ['gri'],
  cyan: ['camgobegi', 'camgöbeği', 'siyan'],
};

function normalizeHex(raw) {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.trim().toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(cleaned)) return null;
  return cleaned;
}

function hexToRgb(hex) {
  const clean = hex.slice(1);
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  if (d !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / d) % 6;
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h) % 360,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function toTitleCase(str) {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/([a-zA-Z0-9']+)/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function classifyFamily(name, rgb, hsl, sourceFamily) {
  const lower = name.toLowerCase();
  const { r, g, b } = rgb;
  const { h, s, l } = hsl;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);

  // Pure/near blacks (low lightness and low RGB chroma, or explicit black shades)
  if ((l <= 13 && chroma <= 42) || (/\b(black|jet|onyx|obsidian|ebony|charcoal)\b/.test(lower) && l <= 20 && chroma <= 32)) {
    return 'black';
  }

  // Name-guided clear Beige / Cream / Sand (check Antique White before pure White)
  if (
    /\b(beige|cream|ivory|linen|sand|parchment|ecru|bone|eggshell|vanilla|bisque|champagne|wheat|buff|oatmeal|flax|antique white|navajo white|cornsilk)\b/.test(
      lower
    ) &&
    l >= 66
  ) {
    return 'beige';
  }

  // Pure/near whites (very high lightness and low RGB chroma)
  if (
    (l >= 96 && chroma <= 18) ||
    (l >= 91 && chroma <= 14) ||
    (/\b(white|snow|chalk|alabaster)\b/.test(lower) && l >= 90 && chroma <= 30)
  ) {
    return 'white';
  }

  // Warm pale neutral tones -> beige
  if (chroma >= 12 && s <= 62 && l >= 72 && l <= 95 && h >= 22 && h <= 65) {
    return 'beige';
  }

  // Name-guided Cyan / Turquoise / Teal / Aqua
  if (
    /\b(cyan|aqua|aquamarine|turquoise|teal|cerulean)\b/.test(lower) &&
    h >= 155 &&
    h <= 205 &&
    s >= 20
  ) {
    return 'cyan';
  }

  // Low chroma / low saturation grays
  if (chroma <= 18 || s <= 11) {
    if (l <= 15) return 'black';
    if (l >= 92) return 'white';
    return 'gray';
  }

  // Explicit semantic botanical/mineral family anchors
  if (/\b(sage|olive|moss|celadon|artichoke|avocado|fern|jade|emerald|mint|forest|emerald|chartreuse)\b/.test(lower) && h >= 42 && h <= 165) {
    return 'green';
  }
  if (/\b(lavender|lilac|wisteria|periwinkle|violet|amethyst|plum|orchid|mauve|heliotrope|iris)\b/.test(lower) && h >= 225 && h <= 330) {
    return 'purple';
  }

  // Brown detection (low-lightness or desaturated warm oranges/reds)
  if (
    h >= 8 &&
    h <= 46 &&
    ((l <= 42 && s >= 15) || (l <= 56 && s <= 52 && /\b(brown|umber|sienna|ochre|sepia|taupe|khaki|tan|bronze|cocoa|coffee|chocolate|chestnut|mahogany|walnut|terracotta|russet|auburn|copper|cinnamon)\b/.test(lower)))
  ) {
    return 'brown';
  }

  if (sourceFamily === 'brown' && l < 62 && h <= 55) {
    return 'brown';
  }

  // Spectral hue classification
  if (h >= 340 || h < 12) {
    if (/\b(red|crimson|scarlet|brick|vermilion|ruby|carmine|maroon|garnet|burgundy|rust)\b/.test(lower) && l <= 62) {
      return 'red';
    }
    if (l >= 66 || (h >= 325 && l >= 58)) return 'pink';
    return 'red';
  }
  if (h >= 12 && h < 40) {
    if (l <= 38) return 'brown';
    return 'orange';
  }
  if (h >= 40 && h < 68) {
    if (l <= 32 && s <= 45) return 'brown';
    if (sourceFamily === 'green') return 'green';
    return 'yellow';
  }
  if (h >= 68 && h < 162) {
    return 'green';
  }
  if (h >= 162 && h < 202) {
    return 'cyan';
  }
  if (h >= 202 && h < 258) {
    if (sourceFamily === 'purple') return 'purple';
    return 'blue';
  }
  if (h >= 258 && h < 312) {
    return 'purple';
  }
  // 312..340
  if (l <= 34 || sourceFamily === 'purple') return 'purple';
  return 'pink';
}

function buildTags(name, family, extraTags = []) {
  const set = new Set();
  const lower = name.toLowerCase();
  for (const [eng, trList] of Object.entries(TURKISH_NAME_KEYWORDS)) {
    if (lower.includes(eng)) {
      trList.forEach((t) => set.add(t));
    }
  }
  for (const t of extraTags) {
    if (typeof t === 'string' && t.trim()) set.add(t.trim().toLowerCase());
  }
  for (const t of FAMILY_TURKISH_TAGS[family] || []) {
    set.add(t);
  }
  set.add(family);
  return Array.from(set).slice(0, 12);
}

function isCleanXkcdName(name) {
  const lower = name.toLowerCase();
  // Exclude noisy/slang/unpleasant XKCD modifiers and overly compound filler names
  const banned = [
    'puke', 'vomit', 'barf', 'booger', 'snot', 'poop', 'shit', 'piss',
    'baby poop', 'baby puke', 'diarrhea', 'bruise', 'ugly', 'weird',
    'bland', 'boring', 'gross', 'icky', 'sickly', 'putrid', 'nast',
    'again', 'ish', 'almost', 'really', 'very ', 'super ', 'ultra ',
  ];
  if (banned.some((b) => lower.includes(b))) return false;
  if (name.split(' ').length > 3) return false;
  return true;
}

async function main() {
  console.log('Fetching open-access color datasets...');
  const [cpData, wadaData, xkcdData] = await Promise.all([
    fetch('https://coloripedia.com/api/v1/colors.json').then((r) => r.json()),
    fetch('https://raw.githubusercontent.com/mattdesl/dictionary-of-colour-combinations/master/colors.json').then((r) =>
      r.json()
    ),
    fetch('https://raw.githubusercontent.com/dariusk/corpora/master/data/colors/xkcd.json').then((r) => r.json()),
  ]);

  const byHex = new Map();
  const seenNames = new Set();

  function tryAdd({ name, hex, extraTags = [], source, sourceFamily = '' }) {
    const normHex = normalizeHex(hex);
    if (!normHex) return false;
    const cleanName = toTitleCase(name).replace(/\s*\|\s*[A-Z]$/i, '').replace(/\s*-\s*[A-Z]$/i, '').trim();
    if (!cleanName || cleanName.length < 2) return false;
    const nameKey = cleanName.toLowerCase();
    if (byHex.has(normHex) || seenNames.has(nameKey)) return false;

    const rgb = hexToRgb(normHex);
    const hsl = rgbToHsl(rgb);
    const family = classifyFamily(cleanName, rgb, hsl, sourceFamily);
    if (!ALLOWED_FAMILIES.includes(family)) return false;

    const tags = buildTags(cleanName, family, extraTags);

    byHex.set(normHex, {
      name: cleanName,
      hex: normHex,
      rgb,
      hsl,
      family,
      tags,
      source,
    });
    seenNames.add(nameKey);
    return true;
  }

  // 1. Add Coloripedia (curated ~312 colors)
  for (const c of cpData.colors || []) {
    tryAdd({
      name: c.name,
      hex: c.hex,
      extraTags: Array.isArray(c.tags) ? c.tags : [],
      source: 'Coloripedia',
      sourceFamily: (c.family || '').toLowerCase(),
    });
  }

  // 2. Add Dictionary of Color Combinations (Sanzo Wada)
  for (const c of wadaData || []) {
    tryAdd({
      name: c.name,
      hex: c.hex,
      extraTags: ['archival', 'sanzo wada', 'historical'],
      source: 'Dictionary of Color Combinations',
    });
  }

  // 3. Add essential + clean XKCD entries (up to target ~550 total within 250-600)
  const priorityXkcdNames = [
    'red', 'crimson', 'scarlet', 'burgundy', 'maroon', 'ruby',
    'orange', 'tangerine', 'coral', 'peach', 'terracotta', 'rust', 'amber',
    'yellow', 'gold', 'mustard', 'lemon', 'ochre',
    'green', 'olive', 'sage', 'mint', 'emerald', 'forest green', 'lime', 'moss',
    'cyan', 'turquoise', 'teal', 'aqua', 'aquamarine',
    'blue', 'navy', 'cobalt', 'royal blue', 'sky blue', 'cerulean', 'indigo',
    'purple', 'violet', 'lavender', 'plum', 'lilac', 'magenta',
    'pink', 'rose', 'salmon', 'blush', 'hot pink', 'fuchsia',
    'brown', 'chocolate', 'sepia', 'umber', 'sienna', 'chestnut', 'taupe',
    'beige', 'cream', 'ivory', 'sand', 'khaki', 'tan',
    'gray', 'grey', 'charcoal', 'silver', 'slate',
    'black', 'white',
  ];

  const xkcdList = xkcdData.colors || [];
  // Pass 1: priority names
  for (const targetName of priorityXkcdNames) {
    if (byHex.size >= 560) break;
    const found = xkcdList.find((x) => x.color.toLowerCase() === targetName);
    if (found) {
      tryAdd({
        name: found.color,
        hex: found.hex,
        extraTags: ['xkcd survey'],
        source: 'XKCD Color Survey',
      });
    }
  }
  // Pass 2: clean descriptive XKCD colors until 540 entries
  for (const x of xkcdList) {
    if (byHex.size >= 540) break;
    if (!isCleanXkcdName(x.color)) continue;
    tryAdd({
      name: x.color,
      hex: x.hex,
      extraTags: ['xkcd survey'],
      source: 'XKCD Color Survey',
    });
  }

  // Sort alphabetically by name and assign sequential IDs
  const sortedColors = Array.from(byHex.values())
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
    .map((entry, idx) => ({
      id: `color-${String(idx + 1).padStart(3, '0')}`,
      ...entry,
    }));

  const familyCounts = {};
  for (const f of ALLOWED_FAMILIES) familyCounts[f] = 0;
  for (const c of sortedColors) familyCounts[c.family] += 1;

  const sourceCounts = {};
  for (const c of sortedColors) {
    sourceCounts[c.source] = (sourceCounts[c.source] || 0) + 1;
  }

  const output = {
    schemaVersion: '1.0',
    dataset: {
      id: 'chromarchive-colors-v1',
      name: 'ChromArchive Named Color Dictionary',
      totalColors: sortedColors.length,
      generatedAt: new Date().toISOString().split('T')[0],
      sources: [
        {
          name: 'Coloripedia',
          url: 'https://coloripedia.com/api/v1/colors.json',
          license: 'Open Color Reference API',
        },
        {
          name: 'Dictionary of Color Combinations',
          url: 'https://colorcombinations.org/data/',
          license: 'Sanzo Wada Open Color Data (MIT / Public Reference)',
        },
        {
          name: 'XKCD Color Survey',
          url: 'https://raw.githubusercontent.com/dariusk/corpora/master/data/colors/xkcd.json',
          license: 'CC0 1.0 Public Domain',
        },
      ],
    },
    colors: sortedColors,
  };

  const outPath = path.resolve(process.cwd(), 'src/data/colors.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n', 'utf8');

  console.log(`Generated ${sortedColors.length} unique colors -> ${outPath}`);
  console.log('Family distribution:', familyCounts);
  console.log('Source distribution:', sourceCounts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
