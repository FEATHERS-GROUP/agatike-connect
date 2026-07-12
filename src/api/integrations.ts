import { createServerFn } from "@tanstack/react-start";
import { getSession } from "./auth";
import { hasuraRequest } from "./graphql.server";

// Helper function to update the organizer integrations column
async function updateOrganizerIntegrations(organizerId: string, integrations: any) {
  const mutation = `
    mutation UpdateIntegrations($id: uuid!, $integrations: jsonb!) {
      update_organizers_by_pk(
        pk_columns: { id: $id },
        _set: { integrations: $integrations }
      ) {
        id
      }
    }
  `;
  try {
    await hasuraRequest(mutation, { id: organizerId, integrations });
    console.log(`[API] Successfully updated integrations for organizer ${organizerId}`);
  } catch (error) {
    console.error(`[API] Failed to update integrations for organizer ${organizerId}:`, error);
    throw new Error("Failed to update database: " + (error as any).message);
  }
}

// Fetch current organizer to get integrations JSONB
async function getOrganizer(organizerId: string) {
  const query = `
    query GetOrganizerIntegrations($id: uuid!) {
      organizers_by_pk(id: $id) {
        integrations
      }
    }
  `;
  const result = await hasuraRequest<{ organizers_by_pk: { integrations: any } }>(query, { id: organizerId });
  return result.organizers_by_pk;
}

export const saveGoogleCredentials = createServerFn({ method: "POST" })
  .validator((d: { type: "drive" | "calendar"; tokenData: any }) => d)
  .handler(async (ctx) => {
    try {
      console.log(`[API] saveGoogleCredentials called for type: ${ctx.data.type}`);
      const session = await getSession();
      if (!session || !session.sub) {
        console.log("[API] Unauthenticated request to saveGoogleCredentials");
        return { success: false, error: "Unauthenticated" };
      }

      let organizerId = session.sub;
      if (session.type === "workspace_user") {
        const meData = await hasuraRequest<{ workspace_users_by_pk: { organizer_id: string } }>(
          `query GetMe($id: uuid!) { workspace_users_by_pk(id: $id) { organizer_id } }`,
          { id: session.sub }
        );
        organizerId = meData.workspace_users_by_pk?.organizer_id;
      }
      console.log(`[API] Fetching organizer: ${organizerId}`);

      const organizer = await getOrganizer(organizerId);
      if (!organizer) {
        console.log(`[API] Organizer not found: ${organizerId}`);
        return { success: false, error: "Organizer not found" };
      }

      const { type, tokenData } = ctx.data;
      const integrations = organizer.integrations || {};
      
      let tokensToSave = tokenData;

      // Exchange authorization code for tokens
      if (tokenData.code) {
        const clientId = process.env.GOOGLE_AUTH_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_AUTH_SECRET;

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code: tokenData.code,
            client_id: clientId || "",
            client_secret: clientSecret || "",
            redirect_uri: "postmessage",
            grant_type: "authorization_code"
          })
        });

        if (!tokenResponse.ok) {
          const err = await tokenResponse.text();
          throw new Error(`Failed to exchange token: ${err}`);
        }

        const tokens = await tokenResponse.json();
        tokensToSave = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          expiry_date: Date.now() + (tokens.expires_in * 1000),
          scope: tokens.scope,
          token_type: tokens.token_type,
        };
      }

      if (!integrations.google) {
        integrations.google = {};
      }
      
      integrations.google[type] = {
        ...(integrations.google[type] || {}), // preserve existing refresh token if any
        ...tokensToSave,
        connected_at: new Date().toISOString()
      };

      await updateOrganizerIntegrations(organizerId, integrations);

      return { success: true };
    } catch (e: any) {
      console.error("[API] saveGoogleCredentials caught error:", e);
      return { success: false, error: e.message || String(e) };
    }
  });

export const disconnectGoogleIntegration = createServerFn({ method: "POST" })
  .validator((d: { type: "drive" | "calendar" }) => d)
  .handler(async (ctx) => {
    const session = await getSession();
    if (!session || !session.sub) throw new Error("unauthenticated");

    let organizerId = session.sub;
    if (session.type === "workspace_user") {
      const meData = await hasuraRequest<{ workspace_users_by_pk: { organizer_id: string } }>(
        `query GetMe($id: uuid!) { workspace_users_by_pk(id: $id) { organizer_id } }`,
        { id: session.sub }
      );
      organizerId = meData.workspace_users_by_pk?.organizer_id;
    }

    const { type } = ctx.data;

    const organizer = await getOrganizer(organizerId);
    if (!organizer) throw new Error("Organizer not found");

    const integrations = organizer.integrations || {};
    
    if (integrations.google && integrations.google[type]) {
      delete integrations.google[type];
      await updateOrganizerIntegrations(organizerId, integrations);
    }

    return { success: true };
  });

export const updateIntegrationSettings = createServerFn({ method: "POST" })
  .validator((d: { type: "drive" | "calendar"; settings: any }) => d)
  .handler(async (ctx) => {
    try {
      const session = await getSession();
      if (!session || !session.sub) return { success: false, error: "Unauthenticated" };

      let organizerId = session.sub;
      if (session.type === "workspace_user") {
        const meData = await hasuraRequest<{ workspace_users_by_pk: { organizer_id: string } }>(
          `query GetMe($id: uuid!) { workspace_users_by_pk(id: $id) { organizer_id } }`,
          { id: session.sub }
        );
        organizerId = meData.workspace_users_by_pk?.organizer_id;
      }

      const { type, settings } = ctx.data;
      const organizer = await getOrganizer(organizerId);
      if (!organizer) return { success: false, error: "Organizer not found" };

      const integrations = organizer.integrations || {};
      
      if (!integrations.google || !integrations.google[type]) {
        return { success: false, error: "Integration not connected" };
      }

      integrations.google[type] = {
        ...integrations.google[type],
        settings: {
          ...(integrations.google[type].settings || {}),
          ...settings
        }
      };

      await updateOrganizerIntegrations(organizerId, integrations);
      return { success: true };
    } catch (e: any) {
      console.error("[API] updateIntegrationSettings caught error:", e);
      return { success: false, error: e.message || String(e) };
    }
  });

export const getOrganizerIntegrations = createServerFn({ method: "GET" })
  .handler(async (ctx) => {
    const session = await getSession();
    if (!session || !session.sub) throw new Error("unauthenticated");

    let organizerId = session.sub;
    if (session.type === "workspace_user") {
      const meData = await hasuraRequest<{ workspace_users_by_pk: { organizer_id: string } }>(
        `query GetMe($id: uuid!) { workspace_users_by_pk(id: $id) { organizer_id } }`,
        { id: session.sub }
      );
      organizerId = meData.workspace_users_by_pk?.organizer_id;
    }

    const organizer = await getOrganizer(organizerId);
    if (!organizer) return {};

    return organizer.integrations || {};
  });

export async function getValidGoogleToken(organizerId: string, type: "drive" | "calendar"): Promise<string> {
  const organizer = await getOrganizer(organizerId);
  if (!organizer) throw new Error("Organizer not found");

  const integrations = organizer.integrations || {};
  const integrationData = integrations.google?.[type];

  if (!integrationData || !integrationData.access_token) {
    throw new Error(`Google ${type} is not connected for this workspace.`);
  }

  const expiryDate = integrationData.expiry_date;
  // Buffer of 5 minutes before actual expiration
  const isExpired = !expiryDate || Date.now() >= (expiryDate - 5 * 60 * 1000);

  if (isExpired && integrationData.refresh_token) {
    const clientId = process.env.GOOGLE_AUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_AUTH_SECRET;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId || "",
        client_secret: clientSecret || "",
        refresh_token: integrationData.refresh_token,
        grant_type: "refresh_token"
      })
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to refresh Google token. Please reconnect the integration.");
    }

    const tokens = await tokenResponse.json();
    
    integrationData.access_token = tokens.access_token;
    if (tokens.refresh_token) {
      integrationData.refresh_token = tokens.refresh_token;
    }
    integrationData.expiry_date = Date.now() + (tokens.expires_in * 1000);
    
    await updateOrganizerIntegrations(organizerId, integrations);

    return integrationData.access_token;
  }

  return integrationData.access_token;
}

export const listGoogleDriveFiles = createServerFn({ method: "GET" })
  .validator((d?: { pageToken?: string; folderId?: string }) => d)
  .handler(async (ctx) => {
    try {
      const session = await getSession();
      if (!session || !session.sub) return { success: false, error: "Unauthenticated" };

      let organizerId = session.sub;
      if (session.type === "workspace_user") {
        const meData = await hasuraRequest<{ workspace_users_by_pk: { organizer_id: string } }>(
          `query GetMe($id: uuid!) { workspace_users_by_pk(id: $id) { organizer_id } }`,
          { id: session.sub }
        );
        organizerId = meData.workspace_users_by_pk?.organizer_id;
      }

      const accessToken = await getValidGoogleToken(organizerId, "drive");

      const query = new URLSearchParams({
        q: ctx.data?.folderId ? `'${ctx.data.folderId}' in parents and trashed=false` : "'root' in parents and trashed=false",
        fields: "nextPageToken, files(id, name, mimeType, iconLink, webViewLink, modifiedTime, size)",
        pageSize: "50",
        orderBy: "folder,modifiedTime desc"
      });
      if (ctx.data?.pageToken) query.append("pageToken", ctx.data.pageToken);

      const response = await fetch(`https://www.googleapis.com/drive/v3/files?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[API] Google Drive error:", errorText);
        if (response.status === 401) {
          return { success: false, error: "Google Drive access token expired. Please disconnect and reconnect." };
        }
        return { success: false, error: `Google API Error: ${response.statusText}` };
      }

      const data = await response.json();
      return { success: true, files: data.files || [], nextPageToken: data.nextPageToken };
    } catch (e: any) {
      console.error("[API] listGoogleDriveFiles error:", e);
      return { success: false, error: e.message || String(e) };
    }
  });

export const readGoogleDriveFileContent = createServerFn({ method: "GET" })
  .validator((d: { fileId: string }) => d)
  .handler(async (ctx) => {
    try {
      const session = await getSession();
      if (!session || !session.sub) return { success: false, error: "Unauthenticated" };

      let organizerId = session.sub;
      if (session.type === "workspace_user") {
        const meData = await hasuraRequest<{ workspace_users_by_pk: { organizer_id: string } }>(
          `query GetMe($id: uuid!) { workspace_users_by_pk(id: $id) { organizer_id } }`,
          { id: session.sub }
        );
        organizerId = meData.workspace_users_by_pk?.organizer_id;
      }

      const accessToken = await getValidGoogleToken(organizerId, "drive");

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${ctx.data.fileId}?alt=media`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[API] Google Drive read error:", errorText);
        return { success: false, error: `Google API Error: ${response.statusText}` };
      }

      const text = await response.text();
      return { success: true, content: text };
    } catch (e: any) {
      console.error("[API] readGoogleDriveFileContent error:", e);
      return { success: false, error: e.message || String(e) };
    }
  });

export const createGoogleDriveFile = createServerFn({ method: "POST" })
  .validator((d: { name: string; mimeType: string; parentFolderId: string }) => d)
  .handler(async (ctx) => {
    try {
      const session = await getSession();
      if (!session || !session.sub) return { success: false, error: "Unauthenticated" };

      let organizerId = session.sub;
      if (session.type === "workspace_user") {
        const meData = await hasuraRequest<{ workspace_users_by_pk: { organizer_id: string } }>(
          `query GetMe($id: uuid!) { workspace_users_by_pk(id: $id) { organizer_id } }`,
          { id: session.sub }
        );
        organizerId = meData.workspace_users_by_pk?.organizer_id;
      }

      const accessToken = await getValidGoogleToken(organizerId, "drive");

      const { name, mimeType, parentFolderId } = ctx.data;

      const body = {
        name,
        mimeType,
        parents: parentFolderId !== "root" ? [parentFolderId] : undefined,
      };

      const response = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[API] Google Drive creation error:", errorText);
        return { success: false, error: `Google API Error: ${response.statusText}` };
      }

      const file = await response.json();
      return { success: true, file };
    } catch (e: any) {
      console.error("[API] createGoogleDriveFile error:", e);
      return { success: false, error: e.message || String(e) };
    }
  });

export const exportToGoogleDrive = createServerFn({ method: "POST" })
  .validator((d: { fileName: string; fileContentBase64: string; mimeType: string }) => d)
  .handler(async (ctx) => {
    const session = await getSession();
    if (!session || !session.sub) throw new Error("unauthenticated");

    let organizerId = session.sub;
    if (session.type === "workspace_user") {
      const meData = await hasuraRequest<{ workspace_users_by_pk: { organizer_id: string } }>(
        `query GetMe($id: uuid!) { workspace_users_by_pk(id: $id) { organizer_id } }`,
        { id: session.sub }
      );
      organizerId = meData.workspace_users_by_pk?.organizer_id;
    }

    const { fileName, fileContentBase64, mimeType } = ctx.data;
    const accessToken = await getValidGoogleToken(organizerId, "drive");

    const organizer = await getOrganizer(organizerId);
    const exportFolderKey = organizer?.integrations?.drive?.settings?.exportFolder || "root";

    let parentFolderId = "root";
    if (exportFolderKey !== "root") {
      let folderName = exportFolderKey;
      if (exportFolderKey === "agatike-exports") folderName = "Agatike Exports";
      else if (exportFolderKey === "agatike-events") folderName = "Agatike Events";

      const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
      const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`;
      
      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      let foundId = null;
      if (searchRes.ok) {
        const data = await searchRes.json();
        if (data.files && data.files.length > 0) {
          foundId = data.files[0].id;
        }
      }

      if (foundId) {
        parentFolderId = foundId;
      } else {
        const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
            parents: ["root"]
          })
        });

        if (createRes.ok) {
          const createData = await createRes.json();
          parentFolderId = createData.id;
        }
      }
    }

    // Prepare multipart upload body
    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata: any = {
      name: fileName,
      mimeType: mimeType
    };
    if (parentFolderId && parentFolderId !== "root") {
      metadata.parents = [parentFolderId];
    }

    const multipartRequestBody =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: " + mimeType + "\r\n" +
      "Content-Transfer-Encoding: base64\r\n\r\n" +
      fileContentBase64 +
      close_delim;

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Drive API Error: ${errorText}`);
    }

    const file = await response.json();
    return { success: true, fileId: file.id };
  });

export const syncEventToGoogleCalendar = createServerFn({ method: "POST" })
  .validator((d: { workspaceId: string; eventDetails: { summary: string; description: string; start: string; end: string; location: string } }) => d)
  .handler(async (ctx) => {
    const session = await getSession();
    if (!session || !session.sub) throw new Error("unauthenticated");

    const { workspaceId, eventDetails } = ctx.data;

    // First get the organizer ID for this workspace
    const wsQuery = `
      query GetWorkspaceOrg($id: uuid!) {
        workspaces_by_pk(id: $id) {
          orgnizer_id
        }
      }
    `;
    const wsData = await hasuraRequest<{ workspaces_by_pk: { orgnizer_id: string } }>(wsQuery, { id: workspaceId });
    const orgId = wsData?.workspaces_by_pk?.orgnizer_id;

    if (!orgId) return { success: false, reason: "Organizer not found for workspace" };

    const accessToken = await getValidGoogleToken(orgId, "calendar");
    
    const payload = {
      summary: eventDetails.summary,
      location: eventDetails.location,
      description: eventDetails.description,
      start: {
        dateTime: eventDetails.start,
        timeZone: "UTC",
      },
      end: {
        dateTime: eventDetails.end,
        timeZone: "UTC",
      },
    };

    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to sync to Google Calendar", errorText);
      return { success: false, reason: "API Error" };
    }

    const event = await response.json();
    return { success: true, eventId: event.id };
  });
