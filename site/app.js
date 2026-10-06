import { parseEuro, calculateTotal, validatePriceData } from './calculator.js';
import { CountryPicker } from './country-picker.js';
import { createBggMessage } from './message.js';

const element = id => document.getElementById(id);
const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const format = cents => euro.format(cents / 100);
const countryPicker = new CountryPicker(element('country-picker'));
let data;
let result;

function update() {
  const itemCents = parseEuro(element('item-price').value);
  const invalid = itemCents === null && element('item-price').value.trim() !== '';
  element('item-price').setAttribute('aria-invalid', String(invalid));
  element('price-error').hidden = !invalid;
  const country = data.countries.find(country => country.code === element('country').value);
  const weight = document.querySelector('input[name="weight"]:checked').value;
  const shippingCents = data.prices[country.zone][weight];
  element('weight-description').textContent = `· ${weight} kg`;
  element('country-note').textContent = country.note || 'Versand ab Deutschland · DHL Online-Frankierung';
  element('shipping-result').textContent = format(shippingCents);
  element('copy-feedback').textContent = '';
  result = itemCents === null ? null : calculateTotal(itemCents, shippingCents);
  element('copy').disabled = result === null;
  element('copy-message').disabled = result === null;
  for (const [id, key] of [['item-result', 'itemCents'], ['fee-result', 'feeCents'], ['total-result', 'totalCents'], ['total', 'totalCents']]) {
    element(id).textContent = result ? format(result[key]) : '—';
  }
  element('total-description').textContent = result
    ? `Inklusive Versand nach ${country.name} und 4 % Aufschlag.`
    : invalid ? 'Prüfe bitte deinen Warenpreis.' : 'Gib deinen Warenpreis ein, um loszulegen.';
}

async function loadPrices() {
  element('load-error').hidden = true;
  element('fields').disabled = true;
  element('copy').disabled = true;
  element('copy-message').disabled = true;
  countryPicker.close();
  element('price-status').textContent = 'DHL-Preise werden geladen …';
  try {
    const response = await fetch('./data/dhl-prices.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = validatePriceData(await response.json());
    countryPicker.setCountries(data.countries);
    element('fields').disabled = false;
    const date = new Date(data.checkedAt);
    const stale = Date.now() - date.getTime() > 24 * 60 * 60 * 1000;
    element('status-dot').classList.toggle('stale', stale);
    element('price-status').textContent = `${stale ? 'Älterer Preisstand · ' : ''}DHL-Preise abgerufen am ${date.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' })} Uhr${stale ? ' · bitte bei DHL prüfen' : ''}`;
    update();
  } catch {
    element('load-error').hidden = false;
    element('price-status').textContent = 'Preisstand nicht verfügbar';
  }
}

element('calculator').addEventListener('submit', event => event.preventDefault());
element('calculator').addEventListener('input', () => data && update());
element('calculator').addEventListener('change', () => data && update());
element('retry').addEventListener('click', loadPrices);
async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    element('copy-feedback').textContent = successMessage;
  } catch {
    element('copy-feedback').textContent = 'Kopieren nicht möglich. Bitte die Zwischenablage für diese Seite erlauben und erneut versuchen.';
  }
}

element('copy').addEventListener('click', () => {
  if (!result) return;
  copyText(format(result.totalCents), 'Gesamtpreis kopiert.');
});
element('copy-message').addEventListener('click', () => {
  if (!result) return;
  copyText(createBggMessage(result, element('country').value), 'Englischer BGG-Text kopiert.');
});
await loadPrices();
