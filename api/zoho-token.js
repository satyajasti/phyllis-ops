// /api/zoho-token.js
// Shared helper to get a fresh Zoho access token using refresh token

export async function getZohoToken() {
  const missing = ["ZOHO_REFRESH_TOKEN", "ZOHO_CLIENT_ID", "ZOHO_CLIENT_SECRET"]
    .filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing Zoho environment variables: ${missing.join(", ")}`);
  }

  const res = await fetch("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: process.env.ZOHO_REFRESH_TOKEN,
      client_id:     process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      grant_type:    "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Could not refresh Zoho access token");
  }
  return data.access_token;
}

export const ZOHO_BASE = `https://creator.zoho.com/api/v2/${process.env.ZOHO_ACCOUNT_NAME}/phyllis-ops`;
