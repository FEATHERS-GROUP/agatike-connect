const q = `
  query GetTicketProjectById($id: uuid!) {
    ticket_projects_by_pk(id: $id) {
      id
      name
      eventId
      template
      coverImage
      design_overrides
      font
      palette
      seat
      tier
      logoText
      logoScale
      logoImage
      logoColorMode
      logoOpacity
      workspaceId
    }
  }
`;

fetch("https://open-languages.hasura.app/v1/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-hasura-admin-secret": "tbK6HLeobyLxHpgiwuMNUlKNSl4r7yrF3XOnSYWza9ocZQ57NKghx5xFFq7YNn9e",
  },
  body: JSON.stringify({
    query: q,
    variables: { id: "6a942b8d-1664-42ff-b01f-d1edc73acaaf" },
  }),
})
  .then((res) => res.json())
  .then(console.log)
  .catch(console.error);
