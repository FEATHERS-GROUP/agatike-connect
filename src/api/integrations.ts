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
      
      // Save token data (in a production app, refresh tokens should be encrypted)
      if (!integrations.google) {
        integrations.google = {};
      }
      
      integrations.google[type] = {
        ...tokenData,
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

export const exportToGoogleDrive = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string; fileName: string; fileContentBase64: string; mimeType: string }) => d)
  .handler(async (ctx) => {
    const session = await getSession();
    if (!session || !session.sub) throw new Error("unauthenticated");

    const { organizerId, fileName, fileContentBase64, mimeType } = ctx.data;
    const organizer = await getOrganizer(organizerId);

    const accessToken = organizer?.integrations?.google?.drive?.access_token;
    if (!accessToken) {
      throw new Error("Google Drive is not connected for this workspace.");
    }

    // Prepare multipart upload body
    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata = {
      name: fileName,
      mimeType: mimeType
    };

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

    const organizer = await getOrganizer(orgId);

    const accessToken = organizer?.integrations?.google?.calendar?.access_token;
    if (!accessToken) {
      // Return gracefully if calendar is not connected, since it's an automatic sync.
      return { success: false, reason: "Calendar not connected" };
    }

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
