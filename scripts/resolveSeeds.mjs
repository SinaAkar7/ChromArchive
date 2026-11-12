import fs from 'node:fs';
import path from 'node:path';

const SEED_FILE = path.resolve('public/assets/aistudio/archiveData_fbab8d55.json');
const OUTPUT_FILE = path.resolve('src/data/archiveData.json');
const REPORT_FILE = path.resolve('scripts/verificationReport.json');

const MET_SEARCH_API = 'https://collectionapi.metmuseum.org/public/collection/v1.1/search';
const MET_OBJECT_API = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, retries = 3, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'ChromArchive/1.0 (Digital Humanities & Open Access Color Research; contact: dev@chromarchive.org)'
        }
      });
      if (res.status === 429) {
        console.warn(`[Rate limit 429] Waiting ${delay * 2}ms on ${url}...`);
        await sleep(delay * 2);
        continue;
      }
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`HTTP ${res.status} on ${url}`);
      }
      return await res.json();
    } catch (err) {
      if (i === retries - 1) {
        console.error(`Failed to fetch ${url} after ${retries} attempts:`, err.message);
        return null;
      }
      await sleep(delay);
    }
  }
  return null;
}

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchArtist(candidateArtist, queryArtist) {
  if (!queryArtist) return true;
  if (!candidateArtist) return false;
  const cNorm = normalize(candidateArtist);
  const qNorm = normalize(queryArtist);
  
  // Direct inclusion
  if (cNorm.includes(qNorm) || qNorm.includes(cNorm)) return true;
  
  // Check surname / key parts
  const queryParts = qNorm.split(' ').filter((w) => w.length > 2);
  const matchCount = queryParts.filter((p) => cNorm.includes(p)).length;
  return matchCount > 0 && matchCount >= Math.min(queryParts.length, 1);
}

function matchTitle(candTitle, queryTitle) {
  if (!candTitle || !queryTitle) return false;
  const cNorm = normalize(candTitle);
  const qNorm = normalize(queryTitle);
  if (cNorm === qNorm) return true;
  if (cNorm.includes(qNorm) || qNorm.includes(cNorm)) return true;
  
  // Word overlap
  const qWords = qNorm.split(' ').filter((w) => w.length > 2);
  const cWords = cNorm.split(' ').filter((w) => w.length > 2);
  if (qWords.length === 0) return false;
  const overlap = qWords.filter((w) => cWords.includes(w)).length;
  return overlap / qWords.length >= 0.6;
}

async function resolveSeeds() {
  console.log('Reading seed file:', SEED_FILE);
  const rawSeeds = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
  const seeds = rawSeeds.artworks || [];
  console.log(`Loaded ${seeds.length} candidate seeds.`);

  const verifiedArtworks = [];
  const verifiedIds = new Set();
  const skippedReport = [];

  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];
    console.log(`\n[${i + 1}/${seeds.length}] Resolving seed: "${seed.titleQuery}" by "${seed.artistQuery || 'N/A'}"`);
    
    // Search with title and artist
    const searchQuery = seed.artistQuery ? `${seed.titleQuery} ${seed.artistQuery}` : seed.titleQuery;
    const searchUrl = `${MET_SEARCH_API}?q=${encodeURIComponent(searchQuery)}&hasImages=true`;
    
    await sleep(90);
    const searchRes = await fetchWithRetry(searchUrl);
    
    let objectIDs = searchRes?.objectIDs || [];
    
    // Fallback search with title only if combined search returned nothing
    if (objectIDs.length === 0) {
      await sleep(90);
      const titleOnlyRes = await fetchWithRetry(`${MET_SEARCH_API}?q=${encodeURIComponent(seed.titleQuery)}&hasImages=true`);
      objectIDs = titleOnlyRes?.objectIDs || [];
    }

    if (objectIDs.length === 0) {
      console.log(` -> No candidate objectIDs found at The Met.`);
      skippedReport.push({
        seedId: seed.seedId,
        titleQuery: seed.titleQuery,
        artistQuery: seed.artistQuery,
        reason: 'Eser The Met arama endpointinde bulunamadı (muhtemelen başka bir müzede veya arşive dahil değil).'
      });
      continue;
    }

    // Inspect candidates (up to 8 candidate IDs)
    let matchedObj = null;
    const candidatesToCheck = objectIDs.slice(0, 8);

    for (const objId of candidatesToCheck) {
      if (verifiedIds.has(objId)) continue; // avoid duplicates

      await sleep(75);
      const obj = await fetchWithRetry(`${MET_OBJECT_API}${objId}`);
      if (!obj) continue;

      // Verification checks:
      // 1. isPublicDomain must be true
      if (!obj.isPublicDomain) {
        continue;
      }

      // 2. primaryImage must exist
      if (!obj.primaryImage || typeof obj.primaryImage !== 'string' || !obj.primaryImage.startsWith('http')) {
        continue;
      }

      // 3. Title & Artist verification
      const titleOk = matchTitle(obj.title, seed.titleQuery);
      const artistOk = matchArtist(obj.artistDisplayName, seed.artistQuery);

      if (titleOk && artistOk) {
        matchedObj = obj;
        break;
      }
    }

    if (matchedObj) {
      verifiedIds.add(matchedObj.objectID);
      const artwork = {
        objectId: matchedObj.objectID,
        title: matchedObj.title || seed.titleQuery,
        artist: matchedObj.artistDisplayName || seed.artistQuery || 'Unknown Artist',
        date: matchedObj.objectDate || seed.suggestedDate || 'Unknown',
        medium: matchedObj.medium || 'Oil on canvas',
        culture: matchedObj.culture || '',
        period: matchedObj.period || '',
        department: matchedObj.department || 'European Paintings',
        isPublicDomain: true,
        imageUrl: matchedObj.primaryImage,
        thumbnailUrl: matchedObj.primaryImageSmall || matchedObj.primaryImage,
        museumRecordUrl: matchedObj.objectURL || `https://www.metmuseum.org/art/collection/search/${matchedObj.objectID}`,
        source: 'The Metropolitan Museum of Art'
      };

      verifiedArtworks.push(artwork);
      console.log(` -> VERIFIED [ID: ${matchedObj.objectID}]: "${artwork.title}" by ${artwork.artist} (${artwork.date})`);
    } else {
      console.log(` -> Candidates did not meet verification criteria (isPublicDomain, primaryImage, or title/artist match).`);
      skippedReport.push({
        seedId: seed.seedId,
        titleQuery: seed.titleQuery,
        artistQuery: seed.artistQuery,
        reason: 'Doğrulama kriterlerini karşılamadı (Public domain değil, görseli eksik ya da sanatçı/başlık eşleşmedi).'
      });
    }
  }

  console.log(`\n========================================`);
  console.log(`Directly verified from 105 seeds: ${verifiedArtworks.length}`);
  console.log(`Skipped seeds: ${skippedReport.length}`);

  // If fewer than 105, supplement from The Met with verified Open Access masterworks
  // from matching art movements, artists, and departments
  const TARGET_COUNT = 105;
  if (verifiedArtworks.length < TARGET_COUNT) {
    console.log(`\nSupplementing remaining ${TARGET_COUNT - verifiedArtworks.length} artworks from The Met Open Access collection...`);
    
    const supplementSearches = [
      { q: 'Vincent van Gogh', artist: 'Vincent van Gogh', dept: 'European Paintings' },
      { q: 'Claude Monet', artist: 'Claude Monet', dept: 'European Paintings' },
      { q: 'Paul Cezanne', artist: 'Paul Cézanne', dept: 'European Paintings' },
      { q: 'Edgar Degas', artist: 'Edgar Degas', dept: 'European Paintings' },
      { q: 'Rembrandt van Rijn', artist: 'Rembrandt', dept: 'European Paintings' },
      { q: 'Johannes Vermeer', artist: 'Johannes Vermeer', dept: 'European Paintings' },
      { q: 'Auguste Renoir', artist: 'Auguste Renoir', dept: 'European Paintings' },
      { q: 'Camille Pissarro', artist: 'Camille Pissarro', dept: 'European Paintings' },
      { q: 'John Singer Sargent', artist: 'John Singer Sargent', dept: 'The American Wing' },
      { q: 'Winslow Homer', artist: 'Winslow Homer', dept: 'The American Wing' },
      { q: 'Mary Cassatt', artist: 'Mary Cassatt', dept: 'The American Wing' },
      { q: 'Katsushika Hokusai', artist: 'Katsushika Hokusai', dept: 'Asian Art' },
      { q: 'Utagawa Hiroshige', artist: 'Utagawa Hiroshige', dept: 'Asian Art' },
      { q: 'Gustave Courbet', artist: 'Gustave Courbet', dept: 'European Paintings' },
      { q: 'Edouard Manet', artist: 'Édouard Manet', dept: 'European Paintings' },
      { q: 'Georges Seurat', artist: 'Georges Seurat', dept: 'European Paintings' },
      { q: 'Paul Gauguin', artist: 'Paul Gauguin', dept: 'European Paintings' },
      { q: 'El Greco', artist: 'El Greco', dept: 'European Paintings' },
      { q: 'Caravaggio', artist: 'Caravaggio', dept: 'European Paintings' },
      { q: 'Peter Paul Rubens', artist: 'Peter Paul Rubens', dept: 'European Paintings' }
    ];

    for (const item of supplementSearches) {
      if (verifiedArtworks.length >= TARGET_COUNT) break;
      console.log(`Searching supplement for: ${item.q}`);
      await sleep(100);
      const sRes = await fetchWithRetry(`${MET_SEARCH_API}?q=${encodeURIComponent(item.q)}&hasImages=true`);
      const objIds = sRes?.objectIDs || [];

      for (const id of objIds) {
        if (verifiedArtworks.length >= TARGET_COUNT) break;
        if (verifiedIds.has(id)) continue;

        await sleep(75);
        const obj = await fetchWithRetry(`${MET_OBJECT_API}${id}`);
        if (!obj) continue;

        if (!obj.isPublicDomain) continue;
        if (!obj.primaryImage || !obj.primaryImage.startsWith('http')) continue;
        if (!obj.title || obj.title.length < 2) continue;
        if (!matchArtist(obj.artistDisplayName, item.artist)) continue;

        verifiedIds.add(obj.objectID);
        const artwork = {
          objectId: obj.objectID,
          title: obj.title,
          artist: obj.artistDisplayName || item.artist,
          date: obj.objectDate || 'Unknown',
          medium: obj.medium || 'Oil on canvas',
          culture: obj.culture || '',
          period: obj.period || '',
          department: obj.department || item.dept,
          isPublicDomain: true,
          imageUrl: obj.primaryImage,
          thumbnailUrl: obj.primaryImageSmall || obj.primaryImage,
          museumRecordUrl: obj.objectURL || `https://www.metmuseum.org/art/collection/search/${obj.objectID}`,
          source: 'The Metropolitan Museum of Art'
        };

        verifiedArtworks.push(artwork);
        console.log(` -> SUPPLEMENTED [ID: ${obj.objectID}]: "${artwork.title}" by ${artwork.artist} (${artwork.date})`);
      }
    }
  }

  console.log(`\nFinal verified catalogue count: ${verifiedArtworks.length} artworks.`);

  // Write verified archiveData.json
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(verifiedArtworks, null, 2), 'utf-8');
  console.log(`Saved catalogue to ${OUTPUT_FILE}`);

  // Write verification report
  const report = {
    verifiedCount: verifiedArtworks.length,
    skippedSeedCount: skippedReport.length,
    skippedSeeds: skippedReport,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`Saved report to ${REPORT_FILE}`);
}

resolveSeeds().catch((err) => {
  console.error('Fatal resolution error:', err);
  process.exit(1);
});
