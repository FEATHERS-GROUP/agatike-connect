import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import bcrypt from "bcryptjs";

export interface OrganizerInput {
  bio?: string;
  business?: boolean;
  business_cert?: string;
  dateOfBirth?: string;
  field?: string;
  gender?: string;
  handle?: string;
  name?: string;
  national_id?: string;
  numberOfEvents?: string;
  password?: string;
  phone?: string;
  email?: string;
  socials?: any;
  speciality?: any;
  user_id?: string | null;
}

export const checkOrganizerHandle = createServerFn({ method: "POST" })
  .handler(async (ctx) => {
    const { handle } = ctx.data as { handle: string };
    const query = `
      query CheckHandle($handle: String!) {
        organizers(where: { handle: { _eq: $handle } }) {
          id
        }
      }
    `;
    const result = await hasuraRequest<{ organizers: { id: string }[] }>(query, { handle });
    return result.organizers.length === 0;
  });

export const createOrganizerAccount = createServerFn({ method: "POST" })
  .handler(async (ctx) => {
    const data = ctx.data as unknown as OrganizerInput;
    const mutation = `
      mutation MyMutation(
        $bio: String = "", 
        $business: Boolean = false,
        $business_cert: String = "", 
        $dateOfBirth: String = "", 
        $field: String = "", 
        $gender: String = "", 
        $handle: String = "", 
        $name: String = "", 
        $national_id: String = "", 
        $numberOfEvents: String = "", 
        $password: String = "", 
        $phone: String = "",
        $email: String = "",
        $socials: jsonb = "", 
        $speciality: jsonb = "", 
        $user_id: uuid = null
      ) {
        insert_organizers(objects: {
          active: false, 
          bio: $bio, 
          business: $business, 
          business_cert: $business_cert, 
          dateOfBirth: $dateOfBirth, 
          field: $field, 
          followers: 0, 
          gender: $gender, 
          handle: $handle, 
          name: $name, 
          national_id: $national_id, 
          numberOfEvents: $numberOfEvents, 
          password: $password, 
          phone: $phone,
          email: $email,
          socials: $socials, 
          speciality: $speciality, 
          updated_on: "now()", 
          user_id: $user_id
        }) {
          affected_rows
        }
      }
    `;

    const payload = { ...data };
    if (!payload.user_id) {
      payload.user_id = null;
    }

    if (payload.password) {
      const salt = await bcrypt.genSalt(10);
      payload.password = await bcrypt.hash(payload.password, salt);
    }

    // Handle JSONB defaults
    if (!payload.socials) payload.socials = {};
    if (!payload.speciality) payload.speciality = {};

    const result = await hasuraRequest<{ insert_organizers: { affected_rows: number } }>(mutation, payload);
    return result.insert_organizers;
  });
