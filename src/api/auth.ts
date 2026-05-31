import { createServerFn } from "@tanstack/react-start";
import { setCookie, getCookie, deleteCookie } from "@tanstack/react-start/server";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { hasuraRequest } from "./graphql.server";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super_secret_key_12345");

export const loginOrganizer = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { email, password } = ctx.data as { email: string; password: string };

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
    return payload;
  } catch (e) {
    return null;
  }
});

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie("agatike_auth", { path: "/" });
  return { success: true };
});
