import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { jwtVerify, SignJWT } from "jose";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super_secret_key_12345");

async function getUserIdFromCookie() {
  const token = getCookie("agatike_user_auth");
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.sub;
  } catch {
    return null;
  }
}

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
  otpToken?: string;
  otp?: string;
  image?: string;
  country?: string;
}

export const checkOrganizerHandle = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { handle } = ctx.data as unknown as { handle: string };
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

export const createOrganizerAccount = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const data = ctx.data as unknown as OrganizerInput;

  if (!data.otpToken || !data.otp) {
    throw new Error("Missing OTP verification details");
  }

  try {
    const { payload } = await jwtVerify(data.otpToken, SECRET);
    if (payload.type !== "signup_otp" || payload.email !== data.email) {
      throw new Error("Invalid OTP token");
    }

    const isValidOtp = await bcrypt.compare(data.otp, payload.otp as string);
    if (!isValidOtp) {
      throw new Error("Incorrect OTP provided");
    }
  } catch (e: any) {
    throw new Error("Invalid or expired OTP");
  }

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
        $user_id: uuid = null,
        $image: String = "",
        $country: String = ""
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
          user_id: $user_id,
          image: $image,
          country: $country
        }) {
          returning {
            id
          }
        }
      }
    `;

  const payload = { ...data } as any;
  delete payload.otpToken;
  delete payload.otp;
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

  const result = await hasuraRequest<{ insert_organizers: { returning: { id: string }[] } }>(
    mutation,
    payload,
  );

  const newOrgId = result.insert_organizers?.returning?.[0]?.id;

  // If the user synced an account, link them as 'owner' in the new mapping table
  if (payload.user_id && newOrgId) {
    try {
      const linkMutation = `
        mutation LinkOrganizerUser($orgId: uuid!, $userId: uuid!) {
          insert_organizer_users_one(object: {
            organizer_id: $orgId,
            user_id: $userId,
            role: "owner"
          }) {
            id
          }
        }
      `;
      await hasuraRequest(linkMutation, { orgId: newOrgId, userId: payload.user_id });
    } catch (err) {
      // Soft fail in case the developer hasn't created or tracked the table in Hasura yet
      console.warn(
        "Failed to insert into organizer_users. Is the table created and tracked in Hasura?",
        err,
      );
    }
  }

  // Automatically subscribe the new organizer to the "Basic" plan for the 14-day trial
  if (newOrgId) {
    try {
      const planQuery = `
        query GetBasicPlan {
          pricing_plans(where: { name: { _ilike: "Basic%" } }, limit: 1) {
            id
          }
        }
      `;
      const planRes = await hasuraRequest<{ pricing_plans: { id: string }[] }>(planQuery);
      const basicPlanId = planRes.pricing_plans?.[0]?.id;

      if (basicPlanId) {
        const subMutation = `
          mutation AutoSubscribeBasic($organizer_id: uuid!, $plan_id: uuid!) {
            insert_subscriptions_one(object: {
              organizer_id: $organizer_id,
              plan_id: $plan_id,
              status: "active",
              amount: 0,
              modules: ["ALL"],
              workspace_id: []
            }) {
              id
            }
          }
        `;
        await hasuraRequest(subMutation, { organizer_id: newOrgId, plan_id: basicPlanId });
      }
    } catch (err) {
      console.warn("Failed to auto-subscribe organizer to Basic plan:", err);
    }
  }

  // Send Slack notification for account creation / verification pending
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  if (slackUrl && newOrgId) {
    try {
      await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `*New Organizer Registration Received!*\n*Organizer ID:* ${newOrgId}\n*Name:* ${payload.name || "N/A"}\n*Handle:* @${payload.handle || "N/A"}\n*Email:* ${payload.email || "N/A"}\n*Phone:* ${payload.phone || "N/A"}\n*Business:* ${payload.business ? "Yes" : "No"}\n*Business Cert:* ${payload.business_cert || "None provided"}\n*Status:* Pending Admin Approval / Verification`,
        }),
      });
    } catch (err) {
      console.error("Failed to send Slack notification for organizer creation:", err);
    }
  }

  return { affected_rows: result.insert_organizers?.returning?.length || 0 };
});

export const getOrganizerProfile = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const query = `
      query GetOrganizerProfile($id: uuid!) {
        organizers_by_pk(id: $id) {
          id
          name
          handle
          email
          phone
          bio
          socials
          followers
          numberOfEvents
          image
          business
          business_cert
          active
          country
        }
      }
    `;

  const data = await hasuraRequest<{ organizers_by_pk: any }>(query, { id: session.sub });
  return data.organizers_by_pk;
});

export const updateOrganizerProfile = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const data = ctx.data as unknown as {
    name?: string;
    handle?: string;
    email?: string;
    phone?: string;
    bio?: string;
    image?: string;
    password?: string;
    socials?: any;
    country?: string;
  };

  const variables: any = {
    id: session.sub,
    name: data.name,
    handle: data.handle,
    email: data.email,
    phone: data.phone,
    bio: data.bio,
    image: data.image,
    socials: data.socials,
    country: data.country,
  };

  let setFields = `
      name: $name,
      handle: $handle,
      email: $email,
      phone: $phone,
      bio: $bio,
      image: $image,
      socials: $socials,
      country: $country,
      updated_on: "now()"
    `;

  const mutation = `
      mutation UpdateOrganizerProfile(
        $id: uuid!,
        $name: String,
        $handle: String,
        $email: String,
        $phone: String,
        $bio: String,
        $image: String,
        $socials: jsonb,
        $country: String
      ) {
        update_organizers_by_pk(
          pk_columns: { id: $id },
          _set: {
            ${setFields}
          }
        ) {
          id
        }
      }
    `;

  const result = await hasuraRequest<{ update_organizers_by_pk: { id: string } }>(
    mutation,
    variables,
  );

  return result.update_organizers_by_pk;
});

export const changeOrganizerPassword = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { currentPassword, newPassword } = ctx.data as any;

  const query = `
      query GetPassword($id: uuid!) {
        organizers_by_pk(id: $id) {
          password
        }
      }
    `;
  const data = await hasuraRequest<{ organizers_by_pk: { password: string } }>(query, {
    id: session.sub,
  });

  if (!data.organizers_by_pk) throw new Error("Organizer not found");

  const valid = await bcrypt.compare(currentPassword, data.organizers_by_pk.password);
  if (!valid) throw new Error("Incorrect current password");

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPassword, salt);

  const mutation = `
      mutation UpdatePassword($id: uuid!, $password: String!) {
        update_organizers_by_pk(pk_columns: { id: $id }, _set: { password: $password }) {
          id
        }
      }
    `;
  await hasuraRequest(mutation, { id: session.sub, password: newHash });

  return { success: true };
});

export const getOrganizers = createServerFn({ method: "GET" })
  .validator((d: any) => d)
  .handler(async () => {
    const query = `
    query GetOrganizers {
      organizers {
        id
        name
        handle
        bio
        followers
        image
        email
        phone
        socials
        active
        country
      }
    }
  `;
    const result = await hasuraRequest<{ organizers: any[] }>(query, {});
    return result.organizers;
  });

export const getFollowedOrganizers = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const userId = await getUserIdFromCookie();
    if (!userId) return [];

    const query = `
      query GetFollowedOrganizers {
        organizer_followers {
          organizer_id
          user_id
        }
      }
    `;

    const result = await hasuraRequest<{
      organizer_followers: { organizer_id: string; user_id: any }[];
    }>(query, {});

    const userIdStr = String(userId).replace(/"/g, "");

    return result.organizer_followers
      .filter((f) => {
        // The database stores user_id as a jsonb array of follower user IDs
        if (Array.isArray(f.user_id)) {
          return f.user_id.some((id) => String(id).replace(/"/g, "") === userIdStr);
        }
        return String(f.user_id).replace(/"/g, "") === userIdStr;
      })
      .map((f) => f.organizer_id);
  } catch (err: any) {
    console.error("GET_FOLLOWED_ORGANIZERS_ERROR:", err);
    import("fs").then((fs) => fs.writeFileSync("error_log.txt", err.stack || err.message));
    throw err;
  }
});

export const followOrganizer = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await getUserIdFromCookie();
  if (!userId) throw new Error("unauthenticated");

  const { organizerId } = ctx.data as unknown as { organizerId: string };
  const userIdStr = String(userId).replace(/"/g, "");

  // 1. Fetch current followers row
  const fetchQuery = `
    query GetRow($organizerId: uuid!) {
      organizer_followers(where: { organizer_id: { _eq: $organizerId } }) {
        id
        user_id
      }
    }
  `;
  const existing = await hasuraRequest<{ organizer_followers: { id: string; user_id: any }[] }>(
    fetchQuery,
    { organizerId },
  );

  const row = existing.organizer_followers[0];

  if (row) {
    // Organizer already has a followers row. Append to the jsonb array.
    let currentUsers = Array.isArray(row.user_id) ? row.user_id : row.user_id ? [row.user_id] : [];
    const strUsers = currentUsers.map((u: any) => String(u).replace(/"/g, ""));

    if (strUsers.includes(userIdStr)) {
      return { success: true, inserted: false }; // Already following
    }

    currentUsers.push(userIdStr);

    const updateMut = `
      mutation UpdateFollowers($id: uuid!, $users: jsonb, $organizerId: uuid!, $count: Int!) {
        update_organizer_followers_by_pk(pk_columns: { id: $id }, _set: { user_id: $users }) {
          id
        }
        update_organizers_by_pk(pk_columns: { id: $organizerId }, _set: { followers: $count }) {
          id
        }
      }
    `;
    await hasuraRequest(updateMut, {
      id: row.id,
      users: currentUsers,
      organizerId,
      count: currentUsers.length,
    });
  } else {
    // First time this organizer is being followed. Insert new row with array.
    const insertMut = `
      mutation InsertFollowers($organizerId: uuid!, $users: jsonb, $count: Int!) {
        insert_organizer_followers_one(object: { organizer_id: $organizerId, user_id: $users }) {
          id
        }
        update_organizers_by_pk(pk_columns: { id: $organizerId }, _set: { followers: $count }) {
          id
        }
      }
    `;
    await hasuraRequest(insertMut, { organizerId, users: [userIdStr], count: 1 });
  }

  return { success: true, inserted: true };
});

export const unfollowOrganizer = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await getUserIdFromCookie();
  if (!userId) throw new Error("unauthenticated");

  const { organizerId } = ctx.data as unknown as { organizerId: string };
  const userIdStr = String(userId).replace(/"/g, "");

  // Fetch current followers row
  const fetchQuery = `
    query GetRow($organizerId: uuid!) {
      organizer_followers(where: { organizer_id: { _eq: $organizerId } }) {
        id
        user_id
      }
    }
  `;
  const existing = await hasuraRequest<{ organizer_followers: { id: string; user_id: any }[] }>(
    fetchQuery,
    { organizerId },
  );

  const row = existing.organizer_followers[0];
  if (!row) return { success: true }; // Nothing to unfollow

  let currentUsers = Array.isArray(row.user_id) ? row.user_id : row.user_id ? [row.user_id] : [];
  const strUsers = currentUsers.map((u: any) => String(u).replace(/"/g, ""));

  if (!strUsers.includes(userIdStr)) {
    return { success: true }; // Already not following
  }

  const newUsers = currentUsers.filter((u: any) => String(u).replace(/"/g, "") !== userIdStr);

  const updateMut = `
    mutation UpdateFollowers($id: uuid!, $users: jsonb, $organizerId: uuid!, $count: Int!) {
      update_organizer_followers_by_pk(pk_columns: { id: $id }, _set: { user_id: $users }) {
        id
      }
      update_organizers_by_pk(pk_columns: { id: $organizerId }, _set: { followers: $count }) {
        id
      }
    }
  `;
  await hasuraRequest(updateMut, {
    id: row.id,
    users: newUsers,
    organizerId,
    count: newUsers.length,
  });

  return { success: true };
});

export const getOrganizerFollowerIds = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const { organizerId } = ctx.data;
    const fetchQuery = `
    query GetFollowersRow($organizerId: uuid!) {
      organizer_followers(where: { organizer_id: { _eq: $organizerId } }) {
        user_id
      }
    }
  `;
    const existing = await hasuraRequest<{ organizer_followers: { user_id: any }[] }>(fetchQuery, {
      organizerId,
    });
    if (!existing.organizer_followers[0]) return [];
    const users = existing.organizer_followers[0].user_id;
    return Array.isArray(users) ? users.map((u) => String(u).replace(/"/g, "")) : [];
  });

export const getOrganizersByIds = createServerFn({ method: "POST" })
  .validator((d: { ids: string[] }) => d)
  .handler(async (ctx) => {
    const { ids } = ctx.data;
    if (!ids || ids.length === 0) return [];

    const query = `
      query GetOrganizersByIds($ids: [uuid!]!) {
        organizers(where: {id: {_in: $ids}}) {
          id
          name
          handle
          bio
          followers
          image
          email
          phone
          socials
          active
          country
        }
      }
    `;
    const result = await hasuraRequest<{ organizers: any[] }>(query, { ids });
    return result.organizers || [];
  });

export const sendAccountConversionOtp = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { email, phone } = ctx.data as unknown as { email: string; phone?: string };

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  const token = await new SignJWT({ email, otp: hashedOtp, type: "conversion_otp" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(SECRET);

  const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #F2571D; padding: 40px 24px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Verify your request</h2>
      </div>
      <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6; text-align: center;">
        <p>Please use the following One-Time Password (OTP) to complete your account conversion:</p>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #F2571D; padding: 24px; background: #fff5f2; border-radius: 12px; display: inline-block; margin: 24px 0;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #666;">This code will expire in 15 minutes.</p>
      </div>
      <div style="background-color: #fafafa; padding: 32px 24px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="font-size: 13px; color: #666; margin: 0;">Powered securely by <strong>Agatike Connect</strong></p>
      </div>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Agatike Connect <hello@agatike.rw>",
      to: [email],
      subject: `Your Verification OTP: ${otp}`,
      html: html,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to send OTP via email");
  }

  if (phone) {
    try {
      const { sendSMS } = await import("./pindo");
      await sendSMS(phone, `Your Agatike Connect verification code is: ${otp}`, session.sub);
    } catch (err) {
      console.error("Failed to send SMS OTP:", err);
    }
  }

  return { success: true, token };
});

export const verifyConversionCredentials = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const session = await getSession();
    if (!session || !session.sub) throw new Error("unauthenticated");

    const data = ctx.data as unknown as {
      password?: string;
      otp?: string;
      otpToken?: string;
    };

    if (!data.password || !data.otp || !data.otpToken) {
      throw new Error("Missing verification details");
    }

    // Verify OTP
    try {
      const { payload } = await jwtVerify(data.otpToken, SECRET);
      if (payload.type !== "conversion_otp") {
        throw new Error("Invalid OTP token");
      }

      const isValidOtp = await bcrypt.compare(data.otp, payload.otp as string);
      if (!isValidOtp) {
        throw new Error("Incorrect OTP provided");
      }
    } catch (e: any) {
      throw new Error("Invalid or expired OTP");
    }

    // Verify Password
    const pwdQuery = `
    query GetPassword($id: uuid!) {
      organizers_by_pk(id: $id) {
        password
      }
    }
  `;
    const pwdData = await hasuraRequest<{ organizers_by_pk: any }>(pwdQuery, {
      id: session.sub,
    });

    if (!pwdData.organizers_by_pk) throw new Error("Organizer not found");

    const validPwd = await bcrypt.compare(data.password, pwdData.organizers_by_pk.password);
    if (!validPwd) throw new Error("Incorrect current password");

    return { success: true };
  },
);

export const convertOrganizerAccount = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const data = ctx.data as unknown as {
    password?: string;
    otp?: string;
    otpToken?: string;
    targetType: "business" | "personal";
    business_cert?: string;
    plan_id?: string;
  };

  if (!data.password || !data.otp || !data.otpToken) {
    throw new Error("Missing verification details");
  }

  // Verify OTP
  try {
    const { payload } = await jwtVerify(data.otpToken, SECRET);
    if (payload.type !== "conversion_otp") {
      throw new Error("Invalid OTP token");
    }

    const isValidOtp = await bcrypt.compare(data.otp, payload.otp as string);
    if (!isValidOtp) {
      throw new Error("Incorrect OTP provided");
    }
  } catch (e: any) {
    throw new Error("Invalid or expired OTP");
  }

  // Verify Password
  const pwdQuery = `
    query GetPassword($id: uuid!) {
      organizers_by_pk(id: $id) {
        password
        email
        phone
        handle
      }
    }
  `;
  const pwdData = await hasuraRequest<{ organizers_by_pk: any }>(pwdQuery, {
    id: session.sub,
  });

  if (!pwdData.organizers_by_pk) throw new Error("Organizer not found");

  const validPwd = await bcrypt.compare(data.password, pwdData.organizers_by_pk.password);
  if (!validPwd) throw new Error("Incorrect current password");

  // Update Organizer profile
  const isBusiness = data.targetType === "business";

  const updateMutation = `
    mutation UpdateOrganizerConversion(
      $id: uuid!,
      $business: Boolean!,
      $business_cert: String!,
      $active: Boolean!
    ) {
      update_organizers_by_pk(
        pk_columns: { id: $id },
        _set: {
          business: $business,
          business_cert: $business_cert,
          active: $active
        }
      ) {
        id
      }
    }
  `;

  await hasuraRequest(updateMutation, {
    id: session.sub,
    business: isBusiness,
    business_cert: data.business_cert || "",
    active: false,
  });

  // Slack webhook notification
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  if (slackUrl) {
    try {
      const handle = pwdData.organizers_by_pk.handle;
      const currentTypeLabel = pwdData.organizers_by_pk.business ? "Business" : "Personal";
      const requestedTypeLabel = isBusiness ? "Business" : "Personal";

      await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `*Account Conversion Request!*\n*Organizer ID:* ${session.sub}\n*Handle:* @${handle}\n*Current Type:* ${currentTypeLabel}\n*Requested Type:* ${requestedTypeLabel}\n*Business Cert:* ${data.business_cert || "None"}\n*Status:* Pending Admin Approval`,
        }),
      });
    } catch (err) {
      console.error("Failed to send Slack notification for conversion:", err);
    }
  }

  return { success: true };
});
