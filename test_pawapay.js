import dotenv from "dotenv";
dotenv.config();

async function test() {
  const baseUrl = process.env.PAWAPAY_API_URL;
  const key = process.env.PAWAPAY_API_KEY;
  console.log("Testing PAWAPAY active-conf");
  const res = await fetch(`${baseUrl}/v1/active-conf`, {
    headers: { Authorization: `Bearer ${key}` }
  });
  if (!res.ok) {
    console.error("Error:", res.status, await res.text());
    return;
  }
  const data = await res.json();
  console.log("Success:", JSON.stringify(data, null, 2));
}

test();
