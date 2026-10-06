import { load } from 'cheerio';
import { countries } from './countries.mjs';

const weights = [2, 5, 10];
const normalize = value => value.replace(/\s+/gu, ' ').trim();

function readTable($, table) {
  const found = new Map();
  $(table).find('tr').each((_, row) => {
    const cells = $(row).children('td');
    const product = cells.first();
    const label = normalize(product.find('p').first().text() || product.text());
    const match = label.match(/^(?:DHL )?Paket\s+(?:bis\s+)?(2|5|10)\s*kg\b/u);
    if (!match) return;
    const weight = Number(match[1]);
    const priceCell = cells.last();
    const priceMatch = normalize(priceCell.find('a').first().text()).match(/^(\d{1,3}),([0-9]{2})\s*EUR$/u);
    if (!priceMatch) throw new Error(`Online price for ${weight} kg is missing or ambiguous.`);
    const cents = Number(priceMatch[1]) * 100 + Number(priceMatch[2]);
    if (found.has(weight)) throw new Error(`Duplicate ${weight} kg product in price table.`);
    if (cents < 100 || cents > 20000) throw new Error(`Implausible price for ${weight} kg.`);
    found.set(weight, cents);
  });
  if (!weights.every(weight => found.has(weight))) throw new Error('Incomplete DHL Paket price table.');
  if (!(found.get(2) < found.get(5) && found.get(5) < found.get(10))) {
    throw new Error('DHL Paket prices are not increasing with weight.');
  }
  return Object.fromEntries(found);
}

export function parseEuPrices(html) {
  const $ = load(html);
  const headings = $('h4').filter((_, element) => normalize($(element).text()) === 'Zone 1 - Europäische Union');
  if (!headings.length) throw new Error('The EU Zone 1 heading is missing.');
  const prices = headings.toArray().map(heading => {
    const section = $(heading).closest('.accordion-item');
    const countryText = normalize(section.find('p').first().text());
    for (const country of countries.filter(country => country.zone === 'eu')) {
      const name = country.code === 'CZ' ? 'Tschechische Republik' : country.name;
      if (!countryText.includes(name)) throw new Error(`EU zone membership could not be verified for ${country.code}.`);
    }
    const tables = section.find('table');
    if (tables.length !== 1) throw new Error('EU zone price table is ambiguous.');
    return readTable($, tables.first());
  });
  if (prices.some(price => JSON.stringify(price) !== JSON.stringify(prices[0]))) {
    throw new Error('Conflicting EU DHL Paket prices.');
  }
  return prices[0];
}

export function parseDomesticPrices(html) {
  const $ = load(html);
  const tables = $('table').filter((_, table) => $(table).find('td').toArray()
    .some(cell => /^DHL Paket 2 kg\b/u.test(normalize($(cell).find('p').first().text() || $(cell).text()))));
  if (!tables.length) throw new Error('Domestic DHL Paket table is missing.');
  const prices = tables.toArray().map(table => readTable($, table));
  if (prices.some(price => JSON.stringify(price) !== JSON.stringify(prices[0]))) {
    throw new Error('Conflicting domestic DHL Paket prices.');
  }
  return prices[0];
}
