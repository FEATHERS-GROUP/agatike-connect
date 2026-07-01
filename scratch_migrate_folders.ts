import dotenv from "dotenv";
dotenv.config();

// For metadata operations, use /v1/metadata
const API_METADATA = process.env.HASURA_ADMIN_API!.replace("/v1/graphql", "/v1/metadata");
const SECRET = process.env.HASURA_ADMIN_SECRETE!;

const tablesToAlter = [
  "ticket_projects",
  "venue_projects",
  "badge_projects",
  "workspace_pages",
  "cinema_movies",
  "agatike_books",
  "custom_forms"
];

async function hasuraMetadata(payload: any) {
  const res = await fetch(API_METADATA, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.error || data.errors || data.internal) {
    console.error("Hasura Error:", JSON.stringify(data, null, 2));
    throw new Error("Hasura migration failed");
  }
  return data;
}

async function run() {
  console.log("2. Tracking workspace_folders table...");
  try {
    await hasuraMetadata({
      type: "pg_track_table",
      args: {
        source: "default",
        schema: "public",
        name: "workspace_folders"
      }
    });
    console.log("-> workspace_folders tracked successfully.");
  } catch(e) {
    console.log("-> workspace_folders already tracked or error");
  }

  console.log("3. Creating Relationships...");
  for (const table of tablesToAlter) {
    try {
      await hasuraMetadata({
        type: "pg_create_object_relationship",
        args: {
          table: { name: table, schema: "public" },
          source: "default",
          name: "folder",
          using: {
            foreign_key_constraint_on: "folder_id"
          }
        }
      });
      console.log(`-> Tracked relationship for ${table}`);
    } catch(e) {
      console.log(`-> Relationship already exists for ${table} or error`);
    }
  }

  console.log("Migration Complete.");
}

run().catch(console.error);
