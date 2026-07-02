import { createServerFn } from "@tanstack/react-start";
import { setCookie, getCookie, deleteCookie } from "@tanstack/react-start/server";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { hasuraRequest } from "./graphql.server";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super_secret_key_12345");

/* ─────────────────────────────────────────────
   Global Admin Auth  (cookie: agatike_admin_auth)
   Used for /internal/control/admin
   ───────────────────────────────────────────── */

export const loginAdmin = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { email, password } = ctx.data as unknown as { email: string; password: string };

  const query = `
      query GetAdmin($email: String!) {
        admin_users(where: { email: { _ilike: $email } }) {
          id
          password
          role
          is_super_admin
        }
      }
    `;

  const result = await hasuraRequest<{ admin_users: { id: string; password: string; role: string; is_super_admin: boolean }[] }>(query, {
    email,
  });
  const admin = result.admin_users[0];

  if (!admin) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const token = await new SignJWT({ 
      sub: admin.id, 
      type: "global_admin",
      role: admin.role,
      is_super_admin: admin.is_super_admin 
    })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h") // 24 hours as requested
    .sign(SECRET);

  console.log("[AdminAuth] Login successful for:", email);

  setCookie("agatike_admin_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/", // Must be / for TanStack Start server functions to receive it
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return { success: true, id: admin.id, role: admin.role };
});

export const getAdminSession = createServerFn({ method: "POST" }).handler(async () => {
  const token = getCookie("agatike_admin_auth");
  console.log("[AdminAuth] getAdminSession called. Token present:", !!token);
  
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const session = payload as unknown as { sub: string; type: string; role: string; is_super_admin: boolean };
    
    if (session.type !== "global_admin") {
        console.log("[AdminAuth] Invalid session type:", session.type);
        return null;
    }

    console.log("[AdminAuth] Session valid for user ID:", session.sub);
    return session;
  } catch (e) {
    console.log("[AdminAuth] Error verifying session token:", e);
    return null;
  }
});

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie("agatike_admin_auth", { path: "/internal/control/admin" });
  return { success: true };
});
