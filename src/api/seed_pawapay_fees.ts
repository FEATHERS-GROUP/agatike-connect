const url = "https://open-languages.hasura.app/v1/graphql";
const secret = "tbK6HLeobyLxHpgiwuMNUlKNSl4r7yrF3XOnSYWza9ocZQ57NKghx5xFFq7YNn9e";

const KEN_COLLECTION = [
  { max: 101, fixed: 0, pct: 1 },
  { max: 501, fixed: 5, pct: 1 },
  { max: 1001, fixed: 10, pct: 1 },
  { max: 1501, fixed: 15, pct: 1 },
  { max: 2501, fixed: 20, pct: 1 },
  { max: 3501, fixed: 25, pct: 1 },
  { max: 5001, fixed: 34, pct: 1 },
  { max: 7501, fixed: 42, pct: 1 },
  { max: 10001, fixed: 48, pct: 1 },
  { max: 15001, fixed: 57, pct: 1 },
  { max: 20001, fixed: 62, pct: 1 },
  { max: 25001, fixed: 67, pct: 1 },
  { max: 30001, fixed: 72, pct: 1 },
  { max: 35001, fixed: 83, pct: 1 },
  { max: 40001, fixed: 99, pct: 1 },
  { max: 45001, fixed: 103, pct: 1 },
  { max: 99999999, fixed: 108, pct: 1 },
];

const UGA_MTN_DISB = [
  { max: 500, fixed: 0, pct: 1 },
  { max: 60000, fixed: 300, pct: 1 },
  { max: 500000, fixed: 600, pct: 1 },
  { max: 1000000, fixed: 1000, pct: 1 },
  { max: 999999999, fixed: 1200, pct: 1 }
];

const UGA_AIRTEL_DISB = [
  { max: 499, fixed: 0, pct: 1 },
  { max: 60000, fixed: 300, pct: 1 },
  { max: 500000, fixed: 600, pct: 1 },
  { max: 999999999, fixed: 1000, pct: 1 }
];

const ZMB_MTN_COL = [
  { max: 150.01, fixed: 0.42, pct: 1 },
  { max: 300.01, fixed: 0.9, pct: 1 },
  { max: 500.01, fixed: 0.8, pct: 1 },
  { max: 1000.01, fixed: 1, pct: 1 },
  { max: 3000.01, fixed: 2.2, pct: 1 },
  { max: 5000.01, fixed: 3, pct: 1 },
  { max: 99999999, fixed: 4, pct: 1 }
];

const ZMB_MTN_DISB = [
  { max: 150.01, fixed: 0.32, pct: 2 },
  { max: 300.01, fixed: 0.40, pct: 2 },
  { max: 500.01, fixed: 0.80, pct: 2 },
  { max: 1000.01, fixed: 2.00, pct: 2 },
  { max: 3000.01, fixed: 4.00, pct: 2 },
  { max: 5000.01, fixed: 7.50, pct: 2 },
  { max: 99999999, fixed: 8.00, pct: 2 }
];

const ZMB_AIRTEL_COL = [
  { max: 150.01, fixed: 0.5, pct: 1 },
  { max: 500.01, fixed: 1.0, pct: 1 },
  { max: 1000.01, fixed: 1.5, pct: 1 },
  { max: 3000.01, fixed: 2.8, pct: 1 },
  { max: 5000.01, fixed: 4, pct: 1 },
  { max: 99999999, fixed: 5.5, pct: 1 }
];

const rates = [
  { network: "MTN_MOMO_BEN", colPct: 2.2, disbPct: 1.5 },
  { network: "MOOV_BEN", colPct: 2.2, disbPct: 1.0 },
  { network: "MOOV_BFA", colPct: 3.0, disbPct: 2.0 },
  { network: "ORANGE_BFA", colPct: 3.3, disbPct: 0.0 },
  { network: "MTN_MOMO_CMR", colPct: 1.75, disbPct: 1.3 },
  { network: "ORANGE_CMR", colPct: 1.77, disbPct: 1.0 },
  { network: "AIRTEL_OAPI_COG", colPct: 4.0, disbPct: 1.0 },
  { network: "MTN_MOMO_COG", colPct: 4.0, disbPct: 1.0 },
  { network: "AIRTEL_OAPI_COD", colPct: 3.0, disbPct: 2.0 },
  { network: "ORANGE_COD", colPct: 3.0, disbPct: 1.0 },
  { network: "VODACOM_MPESA_COD", colPct: 2.5, disbPct: 2.0 },
  { network: "SAFARICOM_ETH", colPct: 1.5, disbPct: 1.5 },
  { network: "ETHIO_TELECOM_ETH", colPct: 2.5, disbPct: 2.5 },
  { network: "AIRTEL_OAPI_GAB", colPct: 2.0, disbPct: 1.0 },
  { network: "AT_GHA", colPct: 2.0, disbPct: 1.0 },
  { network: "MTN_MOMO_GHA", colPct: 2.0, disbPct: 1.0 },
  { network: "TELECEL_GHA", colPct: 2.0, disbPct: 1.0 },
  { network: "MTN_MOMO_CIV", colPct: 1.8, disbPct: 1.3 },
  { network: "ORANGE_CIV", colPct: 2.5, disbPct: 2.0 },
  { network: "WAVE_CIV", colPct: 2.0, disbPct: 2.0 },
  { network: "M-PESA", colPct: 0, disbPct: 0, tiered: true, tiered_rules: { collection: KEN_COLLECTION } },
  { network: "VODACOM_MPESA_LSO", colPct: 2.0, disbPct: 2.0 },
  { network: "AIRTEL_OAPI_MWI", colPct: 3.33, disbPct: 2.7625 },
  { network: "TNM_MWI", colPct: 3.33, disbPct: 2.75 },
  { network: "AIRTEL_OAPI_NGA", colPct: 3.0, disbPct: 1.0 },
  { network: "MTN_MOMO_NGA", colPct: 3.0, disbPct: 1.0, disbFixed: 10 },
  { network: "MTN_MOMO_RWA", colPct: 3.1, disbPct: 1.0, disbFixed: 60 },
  { network: "AIRTEL_OAPI_RWA", colPct: 2.5, disbPct: 1.0 },
  { network: "FREE_SEN", colPct: 2.0, disbPct: 1.5 },
  { network: "ORANGE_SEN", colPct: 2.0, disbPct: 1.8 },
  { network: "WAVE_SEN", colPct: 2.0, disbPct: 2.0 },
  { network: "ORANGE_SLE", colPct: 3.3, disbPct: 2.15 },
  { network: "TIGO_TZA", colPct: 1.0, disbPct: 1.0 },
  { network: "AIRTEL_OAPI_TZA", colPct: 2.18, disbPct: 1.0, disbFixed: 200 },
  { network: "HALOTEL_TZA", colPct: 2.0, disbPct: 1.0, disbFixed: 300 },
  { network: "VODACOM_MPESA_TZA", colPct: 1.0, disbPct: 0, tiered: true },
  { network: "MTN_MOMO_UGA", colPct: 3.0, disbPct: 0, tiered: true, tiered_rules: { disbursement: UGA_MTN_DISB } },
  { network: "AIRTEL_OAPI_UGA", colPct: 2.5, disbPct: 0, tiered: true, tiered_rules: { disbursement: UGA_AIRTEL_DISB } },
  { network: "AIRTEL_OAPI_ZMB", colPct: 0, disbPct: 0, tiered: true, tiered_rules: { collection: ZMB_AIRTEL_COL } },
  { network: "MTN_MOMO_ZMB", colPct: 0, disbPct: 0, tiered: true, tiered_rules: { collection: ZMB_MTN_COL, disbursement: ZMB_MTN_DISB } },
  { network: "ZAMTEL_ZMB", colPct: 0, disbPct: 0, tiered: true },
];

async function updateAll() {
  for (const rate of rates) {
    const tieredRulesJson = rate.tiered_rules ? JSON.stringify(rate.tiered_rules).replace(/"/g, '\\"') : "{}";
    const mutation = `
      mutation {
        update_payment_provider_fees(
          where: { network: { _eq: "${rate.network}" } },
          _set: {
            collection_percentage: ${rate.colPct},
            disbursement_percentage: ${rate.disbPct},
            collection_fixed_fee: 0,
            disbursement_fixed_fee: ${rate.disbFixed || 0},
            is_tiered: ${rate.tiered ? "true" : "false"},
            tiered_rules: "${tieredRulesJson}"
          }
        ) {
          affected_rows
        }
      }
    `;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": secret
        },
        body: JSON.stringify({ query: mutation })
      });
      const data = await res.json();
      console.log(`Updated ${rate.network}:`, data.data?.update_payment_provider_fees?.affected_rows || data.errors);
    } catch (e) {
      console.error(`Failed ${rate.network}`, e);
    }
  }
}

updateAll();
