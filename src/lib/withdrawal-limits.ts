/**
 * Minimum withdrawal amounts per currency.
 *
 * All values are calibrated to be roughly equivalent in value
 * so that organizers on any currency have a fair, consistent floor.
 *
 * Approximate equivalence: ~$15–20 USD
 */
export const MIN_WITHDRAWAL_BY_CURRENCY: Record<string, number> = {
  // East Africa
  RWF: 20000, // Rwandan Franc  (~$15)
  KES: 2000, // Kenyan Shilling (~$15)
  UGX: 70000, // Ugandan Shilling (~$18)
  TZS: 50000, // Tanzanian Shilling (~$19)
  ETB: 1000, // Ethiopian Birr (~$18)

  // West Africa
  NGN: 25000, // Nigerian Naira (~$15)
  GHS: 200, // Ghanaian Cedi (~$15)
  XOF: 12000, // West African CFA Franc (~$20)
  XAF: 12000, // Central African CFA Franc (~$20)

  // Southern Africa
  ZAR: 350, // South African Rand (~$19)
  MWK: 35000, // Malawian Kwacha (~$20)
  ZMW: 500, // Zambian Kwacha (~$18)
  BWP: 270, // Botswana Pula (~$20)
  MZN: 1000, // Mozambican Metical (~$15)

  // Hard currencies
  USD: 20,
  EUR: 20,
  GBP: 15,
  CAD: 25,
  AUD: 30,

  // Default fallback
  DEFAULT: 20000,
};

/**
 * Returns the minimum withdrawal amount for a given currency code.
 * Falls back to the DEFAULT value if the currency is not in the map.
 */
export function getMinWithdrawal(currency: string): number {
  const code = (currency || "").toUpperCase();
  return MIN_WITHDRAWAL_BY_CURRENCY[code] ?? MIN_WITHDRAWAL_BY_CURRENCY.DEFAULT;
}
