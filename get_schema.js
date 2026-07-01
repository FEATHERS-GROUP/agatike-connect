const { execSync } = require('child_process');
const query = `
  query {
    __type(name: "events") {
      fields {
        name
        type {
          name
          kind
        }
      }
    }
  }
`;
const result = execSync(`curl -s -X POST -H "Content-Type: application/json" -d '{"query":"${query.replace(/\n/g, ' ')}"}' http://localhost:8080/v1/graphql`);
console.log(JSON.parse(result.toString()).data.__type.fields.map(f => f.name));
