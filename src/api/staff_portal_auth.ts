import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import bcrypt from "bcryptjs";

const CHECK_COMPANY_USER = `
  query CheckCompanyUser($email: String!) {
    workspace_users(where: { email: { _ilike: $email }, status: { _eq: "active" } }) {
      id
      email
      password
      name
      role
      organizer_id
      workspaces
    }
    organizers(where: { email: { _ilike: $email } }) {
      id
      email
      password
      name
    }
  }
`;

export const loginCompanyUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { email, password } = ctx.data as any;

  const res = await hasuraRequest<any>(CHECK_COMPANY_USER, { email });
  
  // Check Organizer First
  const organizer = res.organizers?.[0];
  if (organizer) {
    const isMatch = await bcrypt.compare(password, organizer.password);
    if (isMatch) {
      return { 
        success: true, 
        role: "organizer", 
        id: organizer.id, 
        name: organizer.name, 
        email: organizer.email 
      };
    }
  }

  // Check Workspace User
  const wsUser = res.workspace_users?.[0];
  if (wsUser) {
    const isMatch = await bcrypt.compare(password, wsUser.password);
    if (isMatch) {
      return { 
        success: true, 
        role: "workspace_user", 
        id: wsUser.id, 
        name: wsUser.name, 
        email: wsUser.email 
      };
    }
  }

  throw new Error("Invalid email or password");
});

const GET_STAFF_ASSIGNMENTS_BY_EMAIL = `
  query GetStaffAssignmentsByEmail($email: String!) {
    event_staff(where: { email: { _ilike: $email }, status: { _eq: "active" } }, order_by: { created_at: desc }) {
      id
      role
      status
      event_id
      pin_code
      badge_qr_string
      allowed_sections
      app_permissions
      vendor_id
      event {
        id
        title
        cover
        schedules {
          start_date
          end_date
        }
      }
    }
  }
`;

export const getStaffAssignmentsByEmail = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { email } = ctx.data as any;
  if (!email) return [];
  const data = await hasuraRequest<any>(GET_STAFF_ASSIGNMENTS_BY_EMAIL, { email });
  return data.event_staff || [];
});
