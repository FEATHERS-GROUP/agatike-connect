export const GLOBAL_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "RWF", name: "Rwandan Franc", symbol: "RWF" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KES" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "UGX" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TZS" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
];

export function getCurrencySymbol(currencyCode?: string): string {
  if (!currencyCode) return "$";
  const upperCode = currencyCode.toUpperCase();
  const found = GLOBAL_CURRENCIES.find((c) => c.code === upperCode);
  if (found) return found.symbol;

  // Fallback if not strictly mapped but passed natively
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: upperCode,
      currencyDisplay: "narrowSymbol",
    });
    // This extracts just the symbol from formatting 0
    return formatter.formatToParts(0).find((x) => x.type === "currency")?.value || upperCode;
  } catch (e) {
    return upperCode;
  }
}

export function formatCurrency(
  amount: number | string,
  currencyCode: string = "USD",
  compact: boolean = false,
): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return String(amount);

  const upperCode = currencyCode.toUpperCase();

  // Custom formatting for specific currencies where Intl produces undesirable symbols
  if (["RWF", "KES", "UGX", "TZS", "EUR", "USD", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "ZAR", "NGN", "GHS", "AED", "SAR", "SGD", "HKD", "BRL", "MXN"].includes(upperCode)) {
    const formattedNum = compact
      ? Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
        numAmount,
      )
      : numAmount.toLocaleString("en-US");
    return `${upperCode} ${formattedNum}`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: upperCode,
      maximumFractionDigits: compact ? 1 : 2,
      currencyDisplay: "narrowSymbol",
      notation: compact ? "compact" : "standard",
    }).format(numAmount);
  } catch (e) {
    const symbol = getCurrencySymbol(upperCode);
    const formattedNum = compact
      ? Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
        numAmount,
      )
      : numAmount.toLocaleString("en-US");
    return `${symbol} ${formattedNum}`;
  }
}
