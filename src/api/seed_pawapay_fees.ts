const url = "https://open-languages.hasura.app/v1/graphql";
const secret = "tbK6HLeobyLxHpgiwuMNUlKNSl4r7yrF3XOnSYWza9ocZQ57NKghx5xFFq7YNn9e";

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
  { network: "M-PESA", colPct: 2.0, disbPct: 2.0, tiered: true },
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
  { network: "MTN_MOMO_UGA", colPct: 3.0, disbPct: 3.0, tiered: true },
  { network: "AIRTEL_OAPI_UGA", colPct: 2.5, disbPct: 3.0, tiered: true },
  { network: "AIRTEL_OAPI_ZMB", colPct: 3.0, disbPct: 3.0, tiered: true },
  { network: "MTN_MOMO_ZMB", colPct: 3.0, disbPct: 3.0, tiered: true },
  { network: "ZAMTEL_ZMB", colPct: 3.0, disbPct: 3.0, tiered: true },
];

async function updateAll() {
  for (const rate of rates) {
    const mutation = `
      mutation {
        update_payment_provider_fees(
          where: { network: { _eq: "${rate.network}" } },
          _set: {
            collection_percentage: ${rate.colPct},
            disbursement_percentage: ${rate.disbPct},
            collection_fixed_fee: 0,
            disbursement_fixed_fee: ${rate.disbFixed || 0},
            is_tiered: ${rate.tiered ? "true" : "false"}
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
      console.log(`Updated ${rate.network}:`, data.data.update_payment_provider_fees.affected_rows);
    } catch (e) {
      console.error(`Failed ${rate.network}`, e);
    }
  }
}

updateAll();
