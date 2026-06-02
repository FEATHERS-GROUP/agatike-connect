import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

export const getWorkspacePageBySlug = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const { slug } = ctx.data as unknown as { slug: string };
  
  const query = `
    query GetWorkspacePageBySlug($slug: String!) {
      workspace_pages(where: { slug: { _eq: $slug }, is_published: { _eq: true } }) {
        id
        workspace_id
        slug
        title
        description
        header_image_url
        logo_url
        theme_color
        components
        created_at
        updated_at
      }
    }
  `;

  const data = await hasuraRequest<{ workspace_pages: any[] }>(query, { slug });
  return data.workspace_pages[0] || null;
});

export const getWorkspacePage = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { workspace_id } = ctx.data as unknown as { workspace_id: string };

  const query = `
    query GetWorkspacePage($workspace_id: uuid!) {
      workspace_pages(where: { workspace_id: { _eq: $workspace_id } }) {
        id
        workspace_id
        slug
        title
        description
        header_image_url
        logo_url
        theme_color
        components
        is_published
      }
    }
  `;

  const data = await hasuraRequest<{ workspace_pages: any[] }>(query, { workspace_id });
  return data.workspace_pages[0] || null;
});

export const upsertWorkspacePage = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const input = ctx.data as any;
  const { workspace_id } = input;

  // Check if it exists
  const checkQuery = `
    query CheckPage {
      workspace_pages(where: { workspace_id: { _eq: "${workspace_id}" } }) {
        id
      }
    }
  `;
  const checkData = await hasuraRequest<{ workspace_pages: any[] }>(checkQuery);
  const existingId = checkData.workspace_pages[0]?.id;

  if (existingId) {
    const mutation = `
      mutation UpdateWorkspacePage(
        $id: uuid!,
        $slug: String!,
        $title: String = "",
        $description: String = "",
        $header_image_url: String = "",
        $logo_url: String = "",
        $theme_color: String = "",
        $components: jsonb = "[]",
        $is_published: Boolean = true
      ) {
        update_workspace_pages_by_pk(
          pk_columns: { id: $id },
          _set: {
            slug: $slug,
            title: $title,
            description: $description,
            header_image_url: $header_image_url,
            logo_url: $logo_url,
            theme_color: $theme_color,
            components: $components,
            is_published: $is_published,
            updated_at: "now()"
          }
        ) {
          id
          workspace_id
        }
      }
    `;
    const { workspace_id: _, ...updateInput } = input;
    const data = await hasuraRequest<{ update_workspace_pages_by_pk: any }>(mutation, { ...updateInput, id: existingId });
    return data.update_workspace_pages_by_pk;
  } else {
    const mutation = `
      mutation InsertWorkspacePage(
        $workspace_id: uuid!,
        $slug: String!,
        $title: String = "",
        $description: String = "",
        $header_image_url: String = "",
        $logo_url: String = "",
        $theme_color: String = "",
        $components: jsonb = "[]",
        $is_published: Boolean = true
      ) {
        insert_workspace_pages_one(
          object: {
            workspace_id: $workspace_id,
            slug: $slug,
            title: $title,
            description: $description,
            header_image_url: $header_image_url,
            logo_url: $logo_url,
            theme_color: $theme_color,
            components: $components,
            is_published: $is_published
          }
        ) {
          id
          workspace_id
        }
      }
    `;
    const data = await hasuraRequest<{ insert_workspace_pages_one: any }>(mutation, input);
    return data.insert_workspace_pages_one;
  }
});
