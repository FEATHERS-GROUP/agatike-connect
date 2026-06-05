async function fetchTable(name) {
  const query = `
    query {
      __type(name: "${name}") {
        name
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  `;

  const res = await fetch(process.env.HASURA_ADMIN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  return data.data?.__type;
}

async function run() {
  const events = await fetchTable("events");
  const tickets = await fetchTable("event_tickets");
  const sections = await fetchTable("sections");
  const venueProjects = await fetchTable("venue_projects");
  const venueProjectSections = await fetchTable("venue_project_sections");

  console.log(
    JSON.stringify({ events, tickets, sections, venueProjects, venueProjectSections }, null, 2),
  );
}

run();
