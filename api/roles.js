// /api/roles.js
// Manages Role Templates and Employee module permissions in Zoho Creator

import { getZohoToken, ZOHO_BASE } from "./zoho-token.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const token = await getZohoToken();
    const headers = {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
    };

    const { action, data, recordId } = req.body || {};

    switch (action) {

      // ── Get all role templates ──
      case "getRoles": {
        const r = await fetch(`${ZOHO_BASE}/report/Roles_Report`, { headers });
        const d = await r.json();
        return res.status(200).json(d.data || []);
      }

      // ── Create a new role template ──
      case "createRole": {
        const r = await fetch(`${ZOHO_BASE}/form/Roles`, {
          method: "POST",
          headers,
          body: JSON.stringify({ data }),
        });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── Update a role template ──
      case "updateRole": {
        const r = await fetch(`${ZOHO_BASE}/report/Roles_Report/${recordId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ data }),
        });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── Delete a role template ──
      case "deleteRole": {
        const r = await fetch(`${ZOHO_BASE}/report/Roles_Report/${recordId}`, {
          method: "DELETE",
          headers,
        });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── Update employee's allowed modules and role template ──
      case "updateEmployeeModules": {
        // data = { allowed_modules: "Dashboard,PAR Entry,...", role_template: "Line Cook" }
        const r = await fetch(`${ZOHO_BASE}/report/Employees_Report/${recordId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ data }),
        });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── Update employee's email and shifts employee ID ──
      case "updateEmployeeAuth": {
        // data = { email: "...", shifts_employee_id: "..." }
        const r = await fetch(`${ZOHO_BASE}/report/Employees_Report/${recordId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ data }),
        });
        const d = await r.json();
        return res.status(200).json(d);
      }

      default:
        return res.status(400).json({ error: "Unknown action: " + action });
    }
  } catch (e) {
    console.error("Roles API error:", e);
    return res.status(500).json({ error: e.message });
  }
}
