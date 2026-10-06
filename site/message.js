const englishCountries = new Intl.DisplayNames(['en'], { type: 'region' });
const formatEuro = cents => `EUR ${(cents / 100).toFixed(2)}`;

export function createBggMessage(result, countryCode) {
  const country = englishCountries.of(countryCode);
  return [
    `[b]Game:[/b] ${formatEuro(result.itemCents)}`,
    `[b]DHL shipping to ${country}[/b] (tracking number included, insured up to EUR 500): ${formatEuro(result.shippingCents)}`,
    `[b]PayPal fee:[/b] ${formatEuro(result.feeCents)}`,
    '',
    `[b]Total: ${formatEuro(result.itemCents)} + ${formatEuro(result.shippingCents)} + ${formatEuro(result.feeCents)} = ${formatEuro(result.totalCents)}[/b]`
  ].join('\n');
}
