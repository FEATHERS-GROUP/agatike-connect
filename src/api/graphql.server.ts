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

    const slackUrl = process.env.SLACK_ERROR_WEBHOOK_URL;
    if (slackUrl) {
      try {
        const errorMessages = json.errors.map((e: any) => e.message || "Unknown error").join("\n");
        await fetch(slackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `🚨 *Agatike API GraphQL Error*\n*Errors:*\n${errorMessages}\n\n*Variables:*\n\`\`\`json\n${JSON.stringify(variables, null, 2)}\n\`\`\`\n\n*Failing Query:*\n\`\`\`graphql\n${query}\n\`\`\``,
          }),
        });
      } catch (err) {
        console.error("Failed to send GraphQL error to Slack:", err);
      }
    }

    throw new Error(json.errors[0]?.message || "Failed to execute GraphQL query/mutation");
  }

  return json.data as T;
}
