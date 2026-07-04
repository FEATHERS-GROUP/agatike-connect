const { hasuraRequest } = require("./src/api/graphql.server.ts");
hasuraRequest(
  `mutation CreateAdminGroup($name: String!, $permissions: jsonb!) {
  insert_admin_groups_one(object: { name: $name, permissions: $permissions }) {
    id
  }
}`,
  { name: "Test Group", permissions: ["/test"] },
)
  .then(console.log)
  .catch(console.error);
