require("dotenv").config();

async function reloadMetadata() {
  const HASURA_URL = process.env.HASURA_ADMIN_API;
  const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRETE;
  
  const metadataUrl = HASURA_URL.replace("/v1/graphql", "/v1/metadata");

  const res = await fetch(metadataUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      type: "reload_metadata",
      args: {}
    }),
  });

  const data = await res.json();
  console.log("Reload metadata result:", data);
}

reloadMetadata().catch(console.error);
