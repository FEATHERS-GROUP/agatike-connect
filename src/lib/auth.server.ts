import { OAuth2Client } from "google-auth-library";

let googleClient: OAuth2Client | null = null;

export function getGoogleClient() {
  if (!googleClient) {
    googleClient = new OAuth2Client(
      process.env.GOOGLE_AUTH_CLIENT_ID,
      process.env.GOOGLE_AUTH_SECRET,
      "postmessage",
    );
  }
  return googleClient;
}
