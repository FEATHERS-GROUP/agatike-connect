import dotenv from "dotenv";
dotenv.config();

async function run() {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Agatike Connect <hello@agatike.rw>",
      to: ["test@example.com"],
      subject: "Test",
      html: "<p>Test</p>",
    }),
  });
  
  const data = await res.json();
  console.log("Resend Status:", res.status);
  console.log("Resend Response:", data);
}
run();
