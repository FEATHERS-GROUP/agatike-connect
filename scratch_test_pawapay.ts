import { config } from 'dotenv';
config();

async function check() {
  const depositId = crypto.randomUUID();
  const payload = {
    depositId,
    amount: "100",
    currency: "RWF",
    correspondent: "MTN",
    payer: {
      type: "MSISDN",
      address: { value: "250788123456" },
    },
    customerTimestamp: new Date().toISOString(),
    statementDescription: `Test Payment`,
  };

  const response = await fetch("https://api.sandbox.pawapay.cloud/v1/deposits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PAWAPAY_API_KEY}`,
    },
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  console.log("CREATE:", response.status, JSON.stringify(data, null, 2));

  // Now fetch it
  const fetchResponse = await fetch("https://api.sandbox.pawapay.cloud/v1/deposits/" + depositId, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PAWAPAY_API_KEY}`,
    },
  });
  const fetchData = await fetchResponse.json();
  console.log("FETCH:", fetchResponse.status, JSON.stringify(fetchData, null, 2));
}

check();
