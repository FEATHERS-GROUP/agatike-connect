import { getServerConfig } from "../lib/config.server";

export async function hasuraRequest<T = any>(
  query: string,
  variables: Record<string, any> = {},
): Promise<T> {
  const config = getServerConfig();

  if (!config.hasuraAdminApi || !config.hasuraAdminSecret) {
    throw new Error("Hasura environment variables are not set");
  }

  const response = await fetch(config.hasuraAdminApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": config.hasuraAdminSecret,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await response.json();

  if (json.errors) {
    console.error("GraphQL Errors:", json.errors);
    console.error("Failing Query:", query);
    console.error("Variables:", variables);
    throw new Error(json.errors[0]?.message || "Failed to execute GraphQL query/mutation");
  }

  return json.data as T;
}
