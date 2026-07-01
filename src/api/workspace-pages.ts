import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";
import { deleteFiles } from "./storage";

export const getPublicWorkspacePageById = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const { id } = ctx.data as unknown as { id: string };

  const query = `
    query GetPublicPageById($id: uuid!) {
      workspace_pages_by_pk(id: $id) {
        id
        slug
        folder_id
        title
        is_published
        parent_id
      }
    }
  `;

  const data = await hasuraRequest<{ workspace_pages_by_pk: any }>(query, { id });
  const page = data.workspace_pages_by_pk;
  // Only return if published
  return page?.is_published ? page : null;
});

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
        parent_id
        parent {
          slug
          title
          children {
            slug
            title
          }
        }
        children {
          slug
          title
        }
      }
    }
  `;

  const data = await hasuraRequest<{ workspace_pages: any[] }>(query, { slug });
  return data.workspace_pages[0] || null;
});

export const getAllWorkspacePages = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const payload = (ctx.data as any).data || ctx.data;
  const { workspace_id } = payload;

  const query = `
    query GetAllWorkspacePages($workspace_id: uuid!) {
      workspace_pages(
        where: { workspace_id: { _eq: $workspace_id } },
        order_by: { updated_at: desc }
      ) {
        id
        workspace_id
        folder_id
        slug
        title
        is_published
        header_image_url
        theme_color
        components
        updated_at
        parent_id
      }
    }
  `;

  const data = await hasuraRequest<{ workspace_pages: any[] }>(query, { workspace_id });
  return data.workspace_pages || [];
});

export const getWorkspacePage = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { id } = ctx.data as unknown as { id: string };

  const query = `
    query GetWorkspacePageById($id: uuid!) {
      workspace_pages_by_pk(id: $id) {
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
        parent_id
      }
    }
  `;

  const data = await hasuraRequest<{ workspace_pages_by_pk: any }>(query, { id });
  return data.workspace_pages_by_pk || null;
});

export const upsertWorkspacePage = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const input = (ctx.data as any).data || ctx.data;
  const { id, workspace_id } = input;

  if (id) {
    // Update existing page by its specific ID
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
        $is_published: Boolean = true,
        $parent_id: uuid
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
            parent_id: $parent_id,
            updated_at: "now()"
          }
        ) {
          id
          workspace_id
          slug
        }
      }
    `;
    const updateInput = {
      id: input.id,
      slug: input.slug,
      title: input.title || "",
      description: input.description || "",
      header_image_url: input.header_image_url || "",
      logo_url: input.logo_url || "",
      theme_color: input.theme_color || "",
      components: input.components || [],
      is_published: input.is_published ?? true,
      parent_id: input.parent_id || null
    };
    const data = await hasuraRequest<{ update_workspace_pages_by_pk: any }>(mutation, updateInput);
    return data.update_workspace_pages_by_pk;
  } else {
    // Insert a brand new page
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
        $is_published: Boolean = true,
        $parent_id: uuid
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
            is_published: $is_published,
            parent_id: $parent_id
          }
        ) {
          id
          workspace_id
          slug
        }
      }
    `;
    const insertInput = {
      workspace_id: input.workspace_id,
      slug: input.slug,
      title: input.title || "",
      description: input.description || "",
      header_image_url: input.header_image_url || "",
      logo_url: input.logo_url || "",
      theme_color: input.theme_color || "",
      components: input.components || [],
      is_published: input.is_published ?? true,
      parent_id: input.parent_id || null
    };
    const data = await hasuraRequest<{ insert_workspace_pages_one: any }>(mutation, insertInput);
    return data.insert_workspace_pages_one;
  }
});


export const updateWorkspacePageFolder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, folder_id } = ctx.data as any;
  const q = `
    mutation UpdateWorkspacePageFolder($id: uuid!, $folder_id: uuid) {
      update_workspace_pages_by_pk(pk_columns: {id: $id}, _set: {folder_id: $folder_id}) {
        id
      }
    }
  `;
  return hasuraRequest(q, { id, folder_id });
});

export const deleteWorkspacePage = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { id } = ctx.data as unknown as { id: string };

  // 1. Fetch the page first to collect all image URLs before deletion
  const fetchQuery = `
    query GetPageForDeletion($id: uuid!) {
      workspace_pages_by_pk(id: $id) {
        header_image_url
        logo_url
        components
      }
    }
  `;
  const pageData = await hasuraRequest<{ workspace_pages_by_pk: any }>(fetchQuery, { id });
  const page = pageData.workspace_pages_by_pk;

  if (page) {
    // Collect all image URLs from the page
    const imageUrls: string[] = [];

    if (page.header_image_url) imageUrls.push(page.header_image_url);
    if (page.logo_url) imageUrls.push(page.logo_url);

    // Scan components for embedded images
    const components: any[] = page.components || [];
    for (const comp of components) {
      if (comp.type === "image" && comp.url) imageUrls.push(comp.url);
      if (comp.type === "split_block" && comp.imageUrl) imageUrls.push(comp.imageUrl);
      if (comp.type === "sponsor_logos" && Array.isArray(comp.logos)) {
        comp.logos.forEach((l: any) => {
          if (l.url) imageUrls.push(l.url);
        });
      }
    }

    // 2. Delete all collected images from Supabase Storage
    if (imageUrls.length > 0) {
      try {
        await deleteFiles({ data: { urls: imageUrls } } as any);
      } catch (err) {
        console.error("Failed to clean up page images from storage:", err);
        // Continue with DB deletion even if storage cleanup partially fails
      }
    }
  }

  // 3. Delete the database record
  const mutation = `
    mutation DeleteWorkspacePage($id: uuid!) {
      delete_workspace_pages_by_pk(id: $id) {
        id
      }
    }
  `;

  const data = await hasuraRequest<{ delete_workspace_pages_by_pk: any }>(mutation, { id });
  return data.delete_workspace_pages_by_pk;
});
