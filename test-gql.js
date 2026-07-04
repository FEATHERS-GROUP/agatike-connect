const { hasuraRequest } = require("./src/api/graphql.server");

const query = `
  query GetStats {
    custom_forms_aggregate { aggregate { count } }
  }
`;
hasuraRequest(query).then(console.log).catch(console.error);
