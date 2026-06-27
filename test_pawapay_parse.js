import dotenv from "dotenv";
dotenv.config();

async function test() {
  const baseUrl = process.env.PAWAPAY_API_URL || "https://api.sandbox.pawapay.cloud";
  const response = await fetch(`${baseUrl}/v1/active-conf`, {
    headers: { Authorization: `Bearer ${process.env.PAWAPAY_API_KEY}` },
  });
  const data = await response.json();
  console.log(data);
}

test();
