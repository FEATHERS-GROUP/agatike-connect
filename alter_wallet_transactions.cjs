require('dotenv').config();

async function run() {
  const query = {
    type: 'run_sql',
    args: {
      sql: `
        ALTER TABLE wallet_transactions 
        ADD COLUMN IF NOT EXISTS raw_callback_data JSONB;
      `
    }
  };

  const response = await fetch(process.env.HASURA_ADMIN_API.replace('/v1/graphql', '/v2/query'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRETE
    },
    body: JSON.stringify(query)
  });

  const data = await response.json();
  console.log('Response:', data);

  // Reload metadata just in case
  await fetch(process.env.HASURA_ADMIN_API.replace('/v1/graphql', '/v1/metadata'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRETE
    },
    body: JSON.stringify({ type: 'reload_metadata', args: { reload_remote_schemas: true, reload_sources: false } })
  });
}

run();
