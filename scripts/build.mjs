import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import AdmZip from 'adm-zip';
import { validatePriceData } from '../site/calculator.js';
import { countries } from './countries.mjs';

validatePriceData(JSON.parse(await readFile(new URL('../site/data/dhl-prices.json', import.meta.url), 'utf8')));
const version = '5.3.8';
const checksum = '8d3dbf15d315cf9a32656cc17b5ec42e7c77479550e6a1afcd1ea0c18c7846df';
const cache = new URL(`../.cache/bootstrap-${version}.jar`, import.meta.url);
let bytes;
try {
  bytes = await readFile(cache);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  const response = await fetch(`https://repo.maven.apache.org/maven2/org/webjars/bootstrap/${version}/bootstrap-${version}.jar`, {
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`Bootstrap WebJar download failed: HTTP ${response.status}.`);
  bytes = Buffer.from(await response.arrayBuffer());
}
if (createHash('sha256').update(bytes).digest('hex') !== checksum) throw new Error('Bootstrap WebJar checksum mismatch.');
await mkdir(new URL('../.cache/', import.meta.url), { recursive: true });
await writeFile(cache, bytes);
const jar = new AdmZip(bytes);
const asset = jar.getEntry(`META-INF/resources/webjars/bootstrap/${version}/css/bootstrap.min.css`);
if (!asset) throw new Error('Bootstrap CSS is missing from the WebJar.');
await cp(new URL('../site/', import.meta.url), new URL('../dist/', import.meta.url), { recursive: true });
await mkdir(new URL('../dist/vendor/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/vendor/bootstrap.min.css', import.meta.url), jar.readFile(asset));
await mkdir(new URL('../dist/flags/', import.meta.url), { recursive: true });
await Promise.all(countries.map(country => {
  const filename = `${country.code.toLowerCase()}.svg`;
  return cp(new URL(`../node_modules/flag-icons/flags/4x3/${filename}`, import.meta.url), new URL(`../dist/flags/${filename}`, import.meta.url));
}));
await cp(new URL('../node_modules/flag-icons/LICENSE', import.meta.url), new URL('../dist/vendor/flag-icons-LICENSE.txt', import.meta.url));
await writeFile(new URL('../dist/.nojekyll', import.meta.url), '');
console.log('Built dist/ with Bootstrap 5.3.8 from its verified WebJar and 27 local SVG flags.');
