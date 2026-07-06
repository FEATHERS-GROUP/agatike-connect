const { request } = require("graphql-request");
const endpoint = "http://localhost:8080/v1/graphql";
const query = `
  query {
    venue_bookings {
      id
      start_time
      end_time
      facility_id
      status
    }
  }
`;
request(endpoint, query, {}, { "x-hasura-admin-secret": "myadminsecretkey" })
  .then(console.log)
  .catch(console.error);
