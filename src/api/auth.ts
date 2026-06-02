import { createServerFn } from "@tanstack/react-start";
import { setCookie, getCookie, deleteCookie } from "@tanstack/react-start/server";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { hasuraRequest } from "./graphql.server";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super_secret_key_12345");

/* ─────────────────────────────────────────────
   Organizer Auth  (cookie: agatike_auth)
   ───────────────────────────────────────────── */

export const loginOrganizer = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { email, password } = ctx.data as unknown as { email: string; password: string };

  const query = `
      query GetOrganizer($email: String!) {
        organizers(where: { email: { _eq: $email } }) {
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
    .setExpirationTime("7d")
    .sign(SECRET);

  setCookie("agatike_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { success: true, id: organizer.id };
});

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const token = getCookie("agatike_auth");
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as { sub: string; type: string };
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
}

export const loginUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { email, password } = ctx.data as unknown as { email: string; password: string };

  const query = `
    query GetUser($email: String!) {
      users(where: { email: { _eq: $email } }) {
        id
        username
        handle
        email
        password
        active
      }
    }
  `;

  const result = await hasuraRequest<{
    users: { id: string; username: string; handle: string; email: string; password: string; active: boolean }[];
  }>(query, { email });

  const user = result.users[0];
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  if (!user.active) {
    throw new Error("Account is deactivated. Please contact support.");
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

export const signupUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { username, email, password, dateOfBirth, gender, country, phone } = ctx.data as unknown as {
    username: string;
    email: string;
    password: string;
    dateOfBirth: string;
    gender: string;
    country: string;
    phone: string;
  };

  // Check if email already exists
  const checkQuery = `
    query CheckUser($email: String!) {
      users(where: { email: { _eq: $email } }) {
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
  const handle = username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20) + Math.floor(Math.random() * 1000);

  // Insert user
  const insertQuery = `
    mutation InsertUser($username: String!, $email: String!, $password: String!, $handle: String!, $dateOfBirth: date, $gender: String, $country: String, $phone: String) {
      insert_users_one(object: {
        username: $username,
        email: $email,
        password: $password,
        handle: $handle,
        dateOfBirth: $dateOfBirth,
        gender: $gender,
        country: $country,
        phone: $phone,
        active: true
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
  }>(insertQuery, { username, email, password: hashedPassword, handle, dateOfBirth, gender, country, phone });

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

export const getUserSession = createServerFn({ method: "GET" }).handler(async () => {
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

    const { interests, profile } = ctx.data as unknown as { interests: any; profile: string };

    const updateQuery = `
      mutation UpdateUserOnboarding($id: uuid!, $interests: jsonb, $profile: String) {
        update_users_by_pk(pk_columns: { id: $id }, _set: { interests: $interests, profile: $profile }) {
          id
        }
      }
    `;

    await hasuraRequest(updateQuery, { id: payload.sub, interests, profile });

    return { success: true };
  } catch (e) {
    throw new Error("Failed to update user profile");
  }
});
