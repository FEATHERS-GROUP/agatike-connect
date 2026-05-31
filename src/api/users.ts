import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export interface UserLookupResponse {
  id: string;
  handle: string;
  username: string;
  email: string;
}

export const getUserByHandle = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const data = ctx.data as unknown as { handle: string };
  if (!data.handle) return null;

  const query = `
      query GetUserByHandle($handle: String!) {
        users(where: {handle: {_eq: $handle}}) {
          id
          handle
          username
          email
        }
      }
    `;

  const result = await hasuraRequest<{ users: UserLookupResponse[] }>(query, {
    handle: data.handle,
  });
  return result.users[0] || null;
});
