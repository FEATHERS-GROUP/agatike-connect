const https = require("https");

const data = JSON.stringify({
  query: `
    query GetEvents {
      events(limit: 3, order_by: { created_at: desc }) {
        id
        title
        tour_stops
      }
    }
  `
});

const options = {
  hostname: 'open-languages.hasura.app',
  path: '/v1/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-hasura-admin-secret': 'tbK6HLeobyLxHpgiwuMNUlKNSl4r7yrF3XOnSYWza9ocZQ57NKghx5xFFq7YNn9e'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(JSON.stringify(JSON.parse(body), null, 2)));
});
req.write(data);
req.end();
