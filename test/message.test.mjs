import test from 'node:test';
import assert from 'node:assert/strict';
import { createBggMessage } from '../site/message.js';
import { calculateTotal } from '../site/calculator.js';
import { countries } from '../scripts/countries.mjs';

test('BGG message provides an English shipping quote and correct breakdown without percentage or weight', () => {
  const message = createBggMessage(calculateTotal(5000, 1749), 'AT');
  assert.equal(message, [
    'Hi!', '',
    'Game: EUR 50.00',
    'DHL shipping to Austria (tracking number included, insured up to EUR 500): EUR 17.49',
    'PayPal fee: EUR 2.70', '',
    'Total: EUR 50.00 + EUR 17.49 + EUR 2.70 = EUR 70.19'
  ].join('\n'));
  assert.doesNotMatch(message, /%|\bkg\b/u);
});

test('country names are English and all EU destinations can be quoted', () => {
  const result = calculateTotal(1, 619);
  assert.match(createBggMessage(result, 'DE'), /to Germany/u);
  assert.match(createBggMessage(result, 'NL'), /to Netherlands/u);
  for (const country of countries) {
    assert.doesNotMatch(createBggMessage(result, country.code), /undefined|NaN/u);
  }
});
