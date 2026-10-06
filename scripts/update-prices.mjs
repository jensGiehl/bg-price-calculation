import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import { parseEuPrices, parseDomesticPrices } from './price-parser.mjs';
import { countries } from './countries.mjs';

const sources = {
  eu: 'https://www.dhl.de/de/privatkunden/pakete-versenden/weltweit-versenden/preise-international.html',
  domestic: 'https://www.dhl.de/de/privatkunden/pakete-versenden/deutschlandweit-versenden/preise-national.html'
};

async function fetchHtml(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'bg-price-calc/1.0 (DHL public price checker)', 'Accept-Language': 'de-DE' },
        signal: AbortSignal.timeout(30000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} from DHL.`);
      if (!response.headers.get('content-type')?.includes('text/html')) throw new Error('DHL did not return HTML.');
      return await response.text();
    } catch (error) {
      if (attempt === 3) throw error;
      await setTimeout(attempt * 1500);
    }
  }
}

const [euHtml, domesticHtml] = await Promise.all([fetchHtml(sources.eu), fetchHtml(sources.domestic)]);
const prices = { eu: parseEuPrices(euHtml), domestic: parseDomesticPrices(domesticHtml) };
const destination = new URL('../site/data/dhl-prices.json', import.meta.url);
let previous;
try {
  previous = JSON.parse(await readFile(destination, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const checkedAt = new Date().toISOString();
const changed = JSON.stringify(previous?.prices) !== JSON.stringify(prices);
const data = {
  schemaVersion: 1,
  currency: 'EUR',
  origin: 'DE',
  product: 'DHL Paket',
  pricing: 'online',
  checkedAt,
  pricesChangedAt: changed ? checkedAt : previous.pricesChangedAt,
  sources,
  prices,
  countries
};
await mkdir(new URL('../site/data/', import.meta.url), { recursive: true });
const temporary = new URL(`${destination.href}.tmp`);
await writeFile(temporary, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
await rename(temporary, destination);
console.log(`Verified DHL prices: EU ${JSON.stringify(prices.eu)}, DE ${JSON.stringify(prices.domestic)}. ${changed ? 'Prices changed.' : 'Prices unchanged.'}`);
