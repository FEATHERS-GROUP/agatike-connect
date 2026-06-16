import dotenv from "dotenv";
dotenv.config();

fetch(process.env.HASURA_ADMIN_API, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
  },
  body: JSON.stringify({
    query: `
      query {
        __schema {
          types {
            name
            kind
          }
        }
      }
    `,
  }),
})
  .then((res) => res.json())
  .then((data) => {
    const tables = data.data.__schema.types.filter(
      (t) => t.kind === "OBJECT" && !t.name.startsWith("_"),
    );
    console.log(tables.map((t) => t.name).join(", "));
  })
  .catch(console.error);
