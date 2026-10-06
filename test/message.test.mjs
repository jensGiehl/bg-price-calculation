import test from 'node:test';
import assert from 'node:assert/strict';
import { createBggMessage } from '../site/message.js';
import { calculateTotal } from '../site/calculator.js';
import { countries } from '../scripts/countries.mjs';

test('BGG message uses BBCode bold formatting and a correct breakdown without greeting, percentage or weight', () => {
  const message = createBggMessage(calculateTotal(5000, 1749), 'AT');
  assert.equal(message, [
    '[b]Game:[/b] EUR 50.00',
    '[b]DHL shipping to Austria[/b] (tracking number included, insured up to EUR 500): EUR 17.49',
    '[b]PayPal fee:[/b] EUR 2.70', '',
    '[b]Total: EUR 50.00 + EUR 17.49 + EUR 2.70 = EUR 70.19[/b]'
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
