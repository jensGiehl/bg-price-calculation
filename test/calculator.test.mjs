import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseEuro, calculateTotal, validatePriceData } from '../site/calculator.js';

test('German and decimal point input is parsed exactly in cents', () => {
  for (const [input, cents] of [['50,00', 5000], [' 50.5 ', 5050], ['0', 0], ['0,01', 1], ['9999999,99', 999999999]]) {
    assert.equal(parseEuro(input), cents);
  }
});

test('invalid or ambiguous monetary input is rejected', () => {
  for (const input of ['', '-1', '1,001', '1.000,00', '1e3', 'NaN', 'Infinity', '10000000', '12abc', '1,', ',5']) {
    assert.equal(parseEuro(input), null, input);
  }
});

test('PayPal surcharge applies to item plus shipping', () => {
  assert.deepEqual(calculateTotal(5000, 1749), {
    itemCents: 5000, shippingCents: 1749, subtotalCents: 6749, feeCents: 270, totalCents: 7019
  });
  assert.equal(calculateTotal(0, 1449).totalCents, 1507);
  assert.equal(calculateTotal(1, 619).feeCents, 25);
});

test('every EU country and package size yields a valid total from shipped data', async () => {
  const data = validatePriceData(JSON.parse(await readFile(new URL('../site/data/dhl-prices.json', import.meta.url), 'utf8')));
  for (const country of data.countries) {
    for (const weight of [2, 5, 10]) {
      const shipping = data.prices[country.zone][weight];
      const total = calculateTotal(12345, shipping);
      assert.equal(total.totalCents, 12345 + shipping + Math.round((12345 + shipping) * 0.04));
    }
  }
  assert.equal(data.countries.find(country => country.code === 'DE').zone, 'domestic');
});

test('corrupt shipping data and invalid monetary values are rejected', () => {
  assert.throws(() => validatePriceData({}));
  assert.throws(() => calculateTotal(-1, 100));
  assert.throws(() => calculateTotal(0.5, 100));
});
