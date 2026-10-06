export function parseEuro(value) {
  const normalized = value.trim();
  if (!/^\d{1,7}(?:[.,]\d{1,2})?$/u.test(normalized)) return null;
  const [euros, fraction = ''] = normalized.split(/[.,]/u);
  return Number(euros) * 100 + Number(fraction.padEnd(2, '0'));
}

export function calculateTotal(itemCents, shippingCents) {
  if (![itemCents, shippingCents].every(value => Number.isSafeInteger(value) && value >= 0)) {
    throw new Error('Prices must be non-negative integer cents.');
  }
  const subtotalCents = itemCents + shippingCents;
  const feeCents = Math.floor((subtotalCents * 4 + 50) / 100);
  return { itemCents, shippingCents, subtotalCents, feeCents, totalCents: subtotalCents + feeCents };
}

export function validatePriceData(data) {
  if (data?.schemaVersion !== 1 || data.currency !== 'EUR' || data.origin !== 'DE' || data.pricing !== 'online') {
    throw new Error('Unsupported DHL price data.');
  }
  if (!Number.isFinite(Date.parse(data.checkedAt))) throw new Error('Invalid price check date.');
  for (const zone of ['eu', 'domestic']) {
    for (const weight of [2, 5, 10]) {
      const cents = data.prices?.[zone]?.[weight];
      if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error('Missing shipping price.');
    }
  }
  if (!Array.isArray(data.countries) || data.countries.length !== 27 || new Set(data.countries.map(country => country.code)).size !== 27) {
    throw new Error('Incomplete country list.');
  }
  if (!data.countries.every(country => /^[A-Z]{2}$/u.test(country.code) && typeof country.name === 'string'
    && typeof country.flag === 'string' && typeof country.note === 'string' && ['eu', 'domestic'].includes(country.zone))) {
    throw new Error('Invalid country data.');
  }
  return data;
}
