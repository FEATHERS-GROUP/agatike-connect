import { createServerFn } from "@tanstack/react-start";
import { setCookie, getCookie, deleteCookie } from "@tanstack/react-start/server";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { hasuraRequest } from "./graphql.server";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_AUTH_CLIENT_ID,
  process.env.GOOGLE_AUTH_SECRET,
  "postmessage",
);

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super_secret_key_12345");

/* ─────────────────────────────────────────────
   Organizer Auth  (cookie: agatike_auth)
   ───────────────────────────────────────────── */

export const loginOrganizer = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { email, password } = ctx.data as unknown as { email: string; password: string };

  const query = `
      query GetOrganizer($email: String!) {
        organizers(where: { email: { _ilike: $email } }) {
          id
          password
        }
      }
    `;

  const result = await hasuraRequest<{ organizers: { id: string; password: string }[] }>(query, {
    email,
  });
  const organizer = result.organizers[0];

  if (!organizer) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, organizer.password);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const token = await new SignJWT({ sub: organizer.id, type: "organizer" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("3d")
    .sign(SECRET);

  setCookie("agatike_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 3, // 3 days
  });

  try {
    const { getApps, initializeApp, applicationDefault } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    if (getApps().length === 0) {
      initializeApp({ credential: applicationDefault() });
    }
    const db = getFirestore();
    await db
      .collection("organizer_sessions")
      .doc(organizer.id)
      .set({ status: "active", updated_at: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("Failed to update Firebase session status:", err);
  }

  return { success: true, id: organizer.id };
});

export const getSession = createServerFn({ method: "POST" }).handler(async () => {
  const token = getCookie("agatike_auth");
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const session = payload as unknown as { sub: string; type: string };

    if (session.type === "workspace_user") {
      const query = `
        query GetStatus($id: uuid!) {
          workspace_users_by_pk(id: $id) {
            status
          }
        }
      `;
      const res = await hasuraRequest<{ workspace_users_by_pk: { status: string } | null }>(query, {
        id: session.sub,
      });
      const user = res.workspace_users_by_pk;

      if (!user || user.status === "disabled" || user.status === "deleted") {
        deleteCookie("agatike_auth", { path: "/" });
        return null;
      }
    } else if (session.type === "organizer") {
      // Sliding session: if token has less than 2.9 days left, refresh it back to 3 days
      const timeLeft = (payload.exp as number) * 1000 - Date.now();
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      const bufferMs = 2.9 * 24 * 60 * 60 * 1000; // Only refresh if it's been at least ~2.4 hours

      if (timeLeft < bufferMs) {
        const refreshedToken = await new SignJWT({ sub: session.sub, type: "organizer" })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("3d")
          .sign(SECRET);

        setCookie("agatike_auth", refreshedToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 3, // 3 days
        });
      }
    }

    return session;
  } catch (e) {
    return null;
  }
});

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie("agatike_auth", { path: "/" });
  return { success: true };
});

/* ─────────────────────────────────────────────
   User Auth  (cookie: agatike_user_auth)
   Used by the public mobile / web app ("/")
   ───────────────────────────────────────────── */

export interface UserProfile {
  id: string;
  username: string;
  handle: string;
  email: string;
  gender: string | null;
  dateOfBirth: string | null;
  interests: string | null;
  active: boolean;
  phone: string | null;
  created_at: string | null;
  profile: string | null;
  country: string | null;
}

export const loginUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { email, password } = ctx.data as unknown as { email: string; password: string };

  const query = `
    query GetUser($email: String!) {
      users(where: { email: { _ilike: $email } }) {
        id
        username
        handle
        email
        password
        active
        banned
      }
    }
  `;

  const result = await hasuraRequest<{
    users: {
      id: string;
      username: string;
      handle: string;
      email: string;
      password: string;
      active: boolean;
      banned: boolean;
    }[];
  }>(query, { email });

  const user = result.users[0];
  if (!user) {
    // console.error("Auth Error: User not found for email:", email);
    throw new Error("Invalid email (not found)");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    // console.error("Auth Error: Incorrect password for email:", email);
    throw new Error("Invalid password");
  }

  if (!user.active) {
    if (user.banned) {
      throw new Error(
        "Your account has been suspended. Please contact support at support@agatike.com.",
      );
    }
    throw new Error("This account no longer exists.");
  }

  const token = await new SignJWT({ sub: user.id, type: "user", handle: user.handle })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);

  setCookie("agatike_user_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { success: true, id: user.id, username: user.username, handle: user.handle };
});

export const sendSignupOtp = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { email } = ctx.data as unknown as { email: string };

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  const token = await new SignJWT({ email, otp: hashedOtp, type: "signup_otp" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(SECRET);

  const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #F2571D; padding: 40px 24px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Verify your Email</h2>
      </div>
      <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6; text-align: center;">
        <p>Please use the following One-Time Password (OTP) to complete your registration:</p>
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
      subject: `Your Signup OTP: ${otp}`,
      html: html,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to send OTP via email");
  }

  return { success: true, token };
});

export const signupUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { username, email, password, agreed_to_terms, otpToken, otp } = ctx.data as unknown as {
    username: string;
    email: string;
    password: string;
    agreed_to_terms: boolean;
    otpToken: string;
    otp: string;
  };

  // Verify OTP token
  if (!otpToken || !otp) {
    throw new Error("Missing OTP verification details");
  }

  try {
    const { payload } = await jwtVerify(otpToken, SECRET);
    if (payload.type !== "signup_otp" || payload.email !== email) {
      throw new Error("Invalid OTP token");
    }

    const isValidOtp = await bcrypt.compare(otp, payload.otp as string);
    if (!isValidOtp) {
      throw new Error("Incorrect OTP provided");
    }
  } catch (e: any) {
    throw new Error("Invalid or expired OTP");
  }

  // Check if email already exists
  const checkQuery = `
    query CheckUser($email: String!) {
      users(where: { email: { _ilike: $email } }) {
        id
      }
    }
  `;
  const existing = await hasuraRequest<{ users: { id: string }[] }>(checkQuery, { email });
  if (existing.users.length > 0) {
    throw new Error("An account with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate handle from username
  const handle =
    username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20) + Math.floor(Math.random() * 1000);

  // Insert user
  const insertQuery = `
    mutation InsertUser($username: String!, $email: String!, $password: String!, $handle: String!, $dateOfBirth: date, $gender: String, $country: String, $phone: String, $agreed_to_terms: Boolean) {
      insert_users_one(object: {
        username: $username,
        email: $email,
        password: $password,
        handle: $handle,
        dateOfBirth: $dateOfBirth,
        gender: $gender,
        country: $country,
        phone: $phone,
        active: true,
        agreed_to_terms: $agreed_to_terms
      }) {
        id
        username
        handle
        email
      }
    }
  `;

  const result = await hasuraRequest<{
    insert_users_one: { id: string; username: string; handle: string; email: string };
  }>(insertQuery, {
    username,
    email,
    password: hashedPassword,
    handle,
    dateOfBirth: "1900-01-01",
    gender: "prefer_not_to_say",
    country: "Unknown",
    phone: "0000000000",
    agreed_to_terms,
  });

  const user = result.insert_users_one;

  // Auto-login after signup
  const token = await new SignJWT({ sub: user.id, type: "user", handle: user.handle })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);

  setCookie("agatike_user_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { success: true, id: user.id, username: user.username, handle: user.handle };
});

export const getUserSession = createServerFn({ method: "POST" }).handler(async () => {
  const token = getCookie("agatike_user_auth");
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.type !== "user") return null;

    // Fetch full user profile
    const query = `
      query GetUserById($id: uuid!) {
        users_by_pk(id: $id) {
          id
          username
          handle
          email
          gender
          dateOfBirth
          interests
          active
          phone
          created_at
          profile
          country
        }
      }
    `;

    const result = await hasuraRequest<{ users_by_pk: UserProfile | null }>(query, {
      id: payload.sub,
    });

    if (!result.users_by_pk || !result.users_by_pk.active) return null;

    return result.users_by_pk;
  } catch (e) {
    return null;
  }
});

export const logoutUser = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie("agatike_user_auth", { path: "/" });
  return { success: true };
});

export const updateUserOnboarding = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const token = getCookie("agatike_user_auth");
  if (!token) throw new Error("Unauthorized");

  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.type !== "user") throw new Error("Unauthorized");

    const { interests, profile, dateOfBirth, gender, phone, country } = ctx.data as unknown as {
      interests: any;
      profile: string;
      dateOfBirth?: string;
      gender?: string;
      phone?: string;
      country?: string;
    };

    const updateQuery = `
      mutation UpdateUserOnboarding($id: uuid!, $interests: jsonb, $profile: String, $dateOfBirth: date, $gender: String, $phone: String, $country: String) {
        update_users_by_pk(
          pk_columns: { id: $id }, 
          _set: { 
            interests: $interests, 
            profile: $profile,
            dateOfBirth: $dateOfBirth,
            gender: $gender,
            phone: $phone,
            country: $country
          }
        ) {
          id
        }
      }
    `;

    await hasuraRequest(updateQuery, {
      id: payload.sub,
      interests,
      profile,
      dateOfBirth,
      gender,
      phone,
      country,
    });

    return { success: true };
  } catch (e) {
    throw new Error("Failed to update user profile");
  }
});

export const updateUserGeneral = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const token = getCookie("agatike_user_auth");
  if (!token) throw new Error("Unauthorized");

  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.type !== "user") throw new Error("Unauthorized");

    const { username, email, phone, country, gender, dateOfBirth } = ctx.data as unknown as {
      username: string;
      email: string;
      phone: string;
      country: string;
      gender: string;
      dateOfBirth: string;
    };

    const updateQuery = `
      mutation UpdateUserGeneral($id: uuid!, $username: String!, $email: String!, $phone: String, $country: String, $gender: String, $dateOfBirth: date) {
        update_users_by_pk(
          pk_columns: { id: $id }, 
          _set: { 
            username: $username, 
            email: $email, 
            phone: $phone, 
            country: $country, 
            gender: $gender, 
            dateOfBirth: $dateOfBirth 
          }
        ) {
          id
        }
      }
    `;

    await hasuraRequest(updateQuery, {
      id: payload.sub,
      username,
      email,
      phone,
      country,
      gender,
      dateOfBirth,
    });

    return { success: true };
  } catch (e) {
    throw new Error("Failed to update user info");
  }
});

export const updateUserPassword = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const token = getCookie("agatike_user_auth");
  if (!token) throw new Error("Unauthorized");

  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.type !== "user") throw new Error("Unauthorized");

    const { password } = ctx.data as unknown as { password: string };
    const hashedPassword = await bcrypt.hash(password, 10);

    const updateQuery = `
      mutation UpdateUserPassword($id: uuid!, $password: String!) {
        update_users_by_pk(pk_columns: { id: $id }, _set: { password: $password }) {
          id
        }
      }
    `;

    await hasuraRequest(updateQuery, { id: payload.sub, password: hashedPassword });

    return { success: true };
  } catch (e) {
    throw new Error("Failed to update password");
  }
});

export const verifyNewPasswordDifference = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const token = getCookie("agatike_user_auth");
    if (!token) throw new Error("Unauthorized");

    try {
      const { payload } = await jwtVerify(token, SECRET);
      if (payload.type !== "user") throw new Error("Unauthorized");

      const { password } = ctx.data as unknown as { password: string };

      const query = `
      query GetUserPassword($id: uuid!) {
        users_by_pk(id: $id) {
          password
        }
      }
    `;

      const result = await hasuraRequest<{ users_by_pk: { password: string } }>(query, {
        id: payload.sub,
      });
      if (!result.users_by_pk) throw new Error("User not found");

      const isSame = await bcrypt.compare(password, result.users_by_pk.password);
      if (isSame) {
        throw new Error("Your new password cannot be the same as your current password");
      }

      return { success: true };
    } catch (e: any) {
      throw new Error(e.message || "Failed to verify password difference");
    }
  },
);

export const deactivateUserAccount = createServerFn({ method: "POST" }).handler(async () => {
  const token = getCookie("agatike_user_auth");
  if (!token) throw new Error("Unauthorized");

  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.type !== "user") throw new Error("Unauthorized");

    const updateQuery = `
      mutation DeactivateUser($id: uuid!) {
        update_users_by_pk(pk_columns: { id: $id }, _set: { active: false }) {
          id
        }
      }
    `;

    await hasuraRequest(updateQuery, { id: payload.sub });

    // Clear the session cookie so they are logged out immediately
    deleteCookie("agatike_user_auth", { path: "/" });

    return { success: true };
  } catch (e: any) {
    throw new Error(e.message || "Failed to deactivate account");
  }
});

export const googleAuthUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { code } = ctx.data as unknown as { code: string };
  const { tokens } = await googleClient.getToken(code);
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.GOOGLE_AUTH_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) throw new Error("Invalid Google token");

  const email = payload.email;
  const username = payload.name || email.split("@")[0];

  const checkQuery = `
    query CheckUser($email: String!) {
      users(where: { email: { _ilike: $email } }) {
        id
        username
        handle
        email
        active
        banned
      }
    }
  `;
  const existing = await hasuraRequest<{ users: any[] }>(checkQuery, { email });

  let user = existing.users[0];

  if (!user) {
    const hashedPassword = await bcrypt.hash("GOOGLE_AUTH_USER", 10);
    const handle =
      username
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 20) + Math.floor(Math.random() * 1000);

    const insertQuery = `
      mutation InsertGoogleUser($username: String!, $email: String!, $password: String!, $handle: String!) {
        insert_users_one(object: {
          username: $username,
          email: $email,
          password: $password,
          handle: $handle,
          dateOfBirth: "1900-01-01",
          gender: "prefer_not_to_say",
          country: "Unknown",
          phone: "0000000000",
          active: true,
          agreed_to_terms: true
        }) {
          id
          username
          handle
          email
          active
        }
      }
    `;

    const res = await hasuraRequest<{ insert_users_one: any }>(insertQuery, {
      username,
      email,
      password: hashedPassword,
      handle,
    });

    user = res.insert_users_one;
  }

  if (!user.active) {
    if (user.banned) throw new Error("Your account has been suspended.");
    throw new Error("This account no longer exists.");
  }

  const token = await new SignJWT({ sub: user.id, type: "user", handle: user.handle })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);

  setCookie("agatike_user_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { success: true, id: user.id, username: user.username, handle: user.handle };
});

export const googleAuthOrganizer = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { code } = ctx.data as unknown as { code: string };
  const { tokens } = await googleClient.getToken(code);
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.GOOGLE_AUTH_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) throw new Error("Invalid Google token");

  const email = payload.email;

  const query = `
      query GetOrganizer($email: String!) {
        organizers(where: { email: { _ilike: $email } }) {
          id
        }
      }
    `;

  const result = await hasuraRequest<{ organizers: { id: string }[] }>(query, { email });
  const organizer = result.organizers[0];

  if (!organizer) {
    throw new Error("Organizer not found. Please create a profile first.");
  }

  const token = await new SignJWT({ sub: organizer.id, type: "organizer" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);

  setCookie("agatike_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  try {
    const { getApps, initializeApp, applicationDefault } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    if (getApps().length === 0) {
      initializeApp({ credential: applicationDefault() });
    }
    const db = getFirestore();
    await db
      .collection("organizer_sessions")
      .doc(organizer.id)
      .set({ status: "active", updated_at: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("Failed to update Firebase session status:", err);
  }

  return { success: true, id: organizer.id };
});
