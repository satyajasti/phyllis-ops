// /api/employees.js
// Returns active employees for the staff login selector.

import { getZohoToken, ZOHO_BASE } from "./zoho-token.js";

function firstValue(record, keys, fallback = "") {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
}

function employeeName(emp) {
  const name = emp.Name || {};
  const firstName = firstValue(emp, ["First_Name", "first_name"], name.first_name || "");
  const lastName = firstValue(emp, ["Last_Name", "last_name"], name.last_name || "");
  return `${firstName} ${lastName}`.trim() || "Unnamed employee";
}

function isActive(emp) {
  const raw = firstValue(emp, ["Is_Active", "is_active"], true);
  if (typeof raw === "boolean") return raw;
  const value = String(raw).trim().toLowerCase();
  return !["false", "no", "inactive", "disabled", "0"].includes(value);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const token = await getZohoToken();
    const response = await fetch(`${ZOHO_BASE}/report/All_Employees?max_records=500`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });
    const data = await response.json();
    const employees = (data.data || [])
      .filter(isActive)
      .map(emp => ({
        ID: emp.ID,
        id: emp.ID,
        first_name: firstValue(emp, ["First_Name", "first_name"], emp.Name?.first_name || ""),
        last_name: firstValue(emp, ["Last_Name", "last_name"], emp.Name?.last_name || ""),
        name: employeeName(emp),
        email: firstValue(emp, ["Email", "email"]),
        designation: firstValue(emp, ["Designation", "designation", "Role_Name", "role_name"], "Staff"),
        is_active: true,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json({ success: true, employees });
  } catch (e) {
    console.error("Employees API error:", e);
    return res.status(500).json({ error: e.message });
  }
}
