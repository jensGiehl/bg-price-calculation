import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseEuPrices, parseDomesticPrices } from '../scripts/price-parser.mjs';

const eu = await readFile(new URL('./fixtures/eu.html', import.meta.url), 'utf8');
const domestic = await readFile(new URL('./fixtures/domestic.html', import.meta.url), 'utf8');

test('extracts online EU Paket prices rather than Päckchen or retail prices', () => {
  assert.deepEqual(parseEuPrices(eu), { 2: 1449, 5: 1749, 10: 2249 });
  assert.deepEqual(parseEuPrices(eu + eu), { 2: 1449, 5: 1749, 10: 2249 });
});

test('extracts domestic Paket prices from desktop and mobile tables', () => {
  assert.deepEqual(parseDomesticPrices(domestic + domestic), { 2: 619, 5: 769, 10: 1049 });
});

test('fails closed for missing zones, countries, products, or prices', () => {
  assert.throws(() => parseEuPrices('<h4>Zone 1 - EU</h4>'));
  assert.throws(() => parseEuPrices(eu.replaceAll('Belgien', 'Norwegen')));
  assert.throws(() => parseEuPrices(eu.replaceAll('Paket 10 kg', 'Paket 11 kg')));
  assert.throws(() => parseEuPrices(eu.replaceAll('14,49 EUR', 'Preis auf Anfrage')));
  assert.throws(() => parseDomesticPrices('<html>Wartungsarbeiten</html>'));
});

test('rejects conflicting duplicated tables and non-increasing prices', () => {
  assert.throws(() => parseEuPrices(eu + eu.replaceAll('14,49 EUR', '15,49 EUR')));
  assert.throws(() => parseDomesticPrices(domestic + domestic.replaceAll('6,19 EUR', '6,29 EUR')));
  assert.throws(() => parseEuPrices(eu.replaceAll('14,49 EUR', '19,49 EUR')));
});
