import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function updateCategory(label, newCategory) {
  const query = `
    mutation UpdateCategory($label: String!, $category: String!) {
      update_platformModules(
        where: { label: { _eq: $label } },
        _set: { category: $category }
      ) {
        affected_rows
      }
    }
  `;
  const res = await fetch(`${API_BASE}/v1/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": SECRET,
    },
    body: JSON.stringify({
      query,
      variables: { label, category: newCategory },
    }),
  });
  const json = await res.json();
  if (json.errors) {
    console.error(`Error updating ${label}:`, json.errors);
  } else {
    console.log(
      `Updated ${label} -> ${newCategory} (${json.data.update_platformModules.affected_rows} rows)`,
    );
  }
}

async function run() {
  const updates = [
    // SHARED
    { label: "Dashboard", category: "SHARED" },
    { label: "Users", category: "SHARED" },
    { label: "Withdrawals", category: "SHARED" },
    { label: "Settings", category: "SHARED" },
    { label: "Community", category: "SHARED" },
    { label: "Page Builder", category: "SHARED" },
    { label: "Badge Designer", category: "SHARED" },
    { label: "Ticket Designer", category: "SHARED" },
    { label: "Products & Add-ons", category: "SHARED" },
    { label: "RSVPs", category: "SHARED" },

    // EVENT
    { label: "Events", category: "EVENT" },
    { label: "Tickets", category: "EVENT" },
    { label: "Scanning", category: "EVENT" }, // If scanner has a different label

    // EXPERIENCE
    { label: "Experiences", category: "EXPERIENCE" },

    // VENUE
    { label: "Spaces", category: "VENUE" },
    { label: "Venue Listings", category: "VENUE" },
    { label: "Venue Designer", category: "VENUE" },
    { label: "Memberships", category: "VENUE" },

    // MOVIES
    { label: "Cinema / Theater", category: "MOVIES" },

    // SALES
    { label: "VIP Access", category: "SALES" },
  ];

  for (const { label, category } of updates) {
    await updateCategory(label, category);
  }
}

run();
