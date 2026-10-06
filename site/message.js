const englishCountries = new Intl.DisplayNames(['en'], { type: 'region' });
const formatEuro = cents => `EUR ${(cents / 100).toFixed(2)}`;

export function createBggMessage(result, countryCode) {
  const country = englishCountries.of(countryCode);
  return [
    'Hi!',
    '',
    `Game: ${formatEuro(result.itemCents)}`,
    `DHL shipping to ${country} (tracking number included, insured up to EUR 500): ${formatEuro(result.shippingCents)}`,
    `PayPal fee: ${formatEuro(result.feeCents)}`,
    '',
    `Total: ${formatEuro(result.itemCents)} + ${formatEuro(result.shippingCents)} + ${formatEuro(result.feeCents)} = ${formatEuro(result.totalCents)}`
  ].join('\n');
}
