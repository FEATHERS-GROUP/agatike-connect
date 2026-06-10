import { request, gql } from 'graphql-request';
const url = 'http://localhost:8080/v1/graphql';
const query = gql`
  query {
    organizer_followers {
      organizer_id
      user_id
    }
  }
`;
request(url, query, {}, { 'x-hasura-admin-secret': 'myadminsecretkey' })
  .then(console.log)
  .catch(console.error);
