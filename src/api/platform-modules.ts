import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export interface PlatformModule {
  category: string;
  created_at: string;
  desc: string;
  href: string;
  icon: string;
  id: string;
  label: string;
  mandatory: boolean;
  updated_at: string;
}

export const getPlatformModules = createServerFn({ method: "GET" }).handler(async () => {
  const query = `
    query MyQuery {
      platformModules {
        category
        created_at
        desc
        href
        icon
        id
        label
        mandatory
        updated_at
      }
    }
  `;

  const data = await hasuraRequest<{ platformModules: PlatformModule[] }>(query);
  return data.platformModules;
});
