const englishCountries = new Intl.DisplayNames(['en'], { type: 'region' });
const formatEuro = cents => `EUR ${(cents / 100).toFixed(2)}`;

export function createBggMessage(result, countryCode) {
  const country = englishCountries.of(countryCode);
  return [
    `[b]Game:[/b] ${formatEuro(result.itemCents)}`,
    `[b]DHL shipping to ${country}[/b] (tracking number included, insured up to EUR 500): ${formatEuro(result.shippingCents)}`,
    `[b]PayPal fee:[/b] ${formatEuro(result.feeCents)}`,
    '',
    `[b]Total: ${formatEuro(result.itemCents)} + ${formatEuro(result.shippingCents)} + ${formatEuro(result.feeCents)} = ${formatEuro(result.totalCents)}[/b]`,
    '',
    '[b]PayPal payment link:[/b] [url=https://paypal.me/jensgiehl]paypal.me/jensgiehl[/url]',
    'PayPal.Me is an official PayPal website. This is my payment link, not my PayPal username; please open the link to make your payment.',
    '',
    'Once I have received your payment, I will send you the DHL tracking number promptly.'
  ].join('\n');
}
