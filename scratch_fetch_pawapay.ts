import { config } from 'dotenv';
config();

async function check() {
  const depositId = "a2fdd3eb-14dc-44ce-80be-03ded353716d";
  const url = "https://api.sandbox.pawapay.cloud/v1/deposits";
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PAWAPAY_API_KEY}`,
    },
  });
  console.log(response.status);
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

check();
