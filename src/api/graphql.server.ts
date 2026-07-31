import { getServerConfig } from "../lib/config.server";

// Simple in-memory cache to prevent hitting Hasura API rate limits
const queryCache = new Map<string, { data: any; expiry: number; promise?: Promise<any> }>();
const CACHE_TTL = 15000; // 15 seconds

export async function hasuraRequest<T = any>(
  query: string,
  variables: Record<string, any> = {},
): Promise<T> {
  const config = getServerConfig();

  if (!config.hasuraAdminApi || !config.hasuraAdminSecret) {
    throw new Error("Hasura environment variables are not set");
  }

  // Only cache queries, not mutations
  const isQuery = query.trim().toLowerCase().startsWith("query");
  const cacheKey = isQuery ? JSON.stringify({ query, variables }) : null;

  if (cacheKey) {
    const cached = queryCache.get(cacheKey);
    if (cached) {
      if (cached.expiry > Date.now()) {
        if (cached.promise) return cached.promise;
        return cached.data as T;
      } else {
        queryCache.delete(cacheKey);
      }
    }
  }

  const fetchPromise = fetch(config.hasuraAdminApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": config.hasuraAdminSecret,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  }).then(async (response) => {
    const json = await response.json();

    if (json.errors) {
      console.error("GraphQL Errors:", json.errors);
      console.error("Failing Query:", query);
      console.error("Variables:", variables);

      const slackUrl = process.env.SLACK_ERROR_WEBHOOK_URL;
      if (slackUrl) {
        try {
          const errorMessages = json.errors.map((e: any) => e.message || "Unknown error").join("\n");
          const envLabel = process.env.NODE_ENV === "production" ? "[PROD]" : "[DEV]";
          await fetch(slackUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: `🚨 *Agatike API GraphQL Error ${envLabel}*\n*Errors:*\n${errorMessages}\n\n*Variables:*\n\`\`\`json\n${JSON.stringify(variables, null, 2)}\n\`\`\`\n\n*Failing Query:*\n\`\`\`graphql\n${query}\n\`\`\``,
            }),
          });
        } catch (err) {
          console.error("Failed to send GraphQL error to Slack:", err);
        }
      }

      throw new Error(json.errors[0]?.message || "Failed to execute GraphQL query/mutation");
    }

    if (cacheKey) {
      queryCache.set(cacheKey, {
        data: json.data,
        expiry: Date.now() + CACHE_TTL,
      });
    }

    return json.data as T;
  }).catch((err) => {
    if (cacheKey) queryCache.delete(cacheKey);
    throw err;
  });

  if (cacheKey) {
    queryCache.set(cacheKey, {
      data: null,
      expiry: Date.now() + CACHE_TTL,
      promise: fetchPromise,
    });
  }

  return fetchPromise;
}
