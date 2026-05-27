// /api/auth.js
// Handles Zoho OAuth 2.0 login flow for PhyllisOps staff access

import { getZohoToken, ZOHO_BASE } from "./zoho-token.js";

const CLIENT_ID     = process.env.ZOHO_CLIENT_ID;
const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const REDIRECT_URI  = "https://phyllis-ops.vercel.app/oauth";

const SCOPES = [
  "ZohoCreator.form.READ",
  "ZohoCreator.form.CREATE",
  "ZohoCreator.form.UPDATE",
  "ZohoCreator.form.DELETE",
  "ZohoCreator.report.READ",
  "ZohoCreator.report.UPDATE",
  "ZohoCreator.report.DELETE",
  "ZohoShifts.schedules.READ",
  "ZohoShifts.schedules.CREATE",
  "ZohoShifts.schedules.UPDATE",
  "ZohoShifts.schedules.DELETE",
  "ZohoShifts.timesheets.READ",
  "ZohoShifts.timesheets.CREATE",
  "ZohoShifts.timesheets.UPDATE",
  "ZohoShifts.timeoff.READ",
  "ZohoShifts.timeoff.CREATE",
  "ZohoShifts.timeoff.UPDATE",
  "ZohoShifts.employees.READ",
  "ZohoShifts.settings.READ",
  "openid",
  "email",
  "profile",
].join(",");

const DEFAULT_STAFF_MODULES = [
  "Dashboard",
  "PAR Entry",
  "Sales Entry",
  "Staff Hours",
  "My Schedule",
  "Clock In/Out",
  "My Timesheet",
  "Time Off",
  "Temp Log",
  "Checklists",
  "Waste Log",
];

function firstValue(record, keys, fallback = "") {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
}

function parseModules(value) {
  if (Array.isArray(value)) return value.map(String).map(m => m.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map(m => m.trim()).filter(Boolean);
  return [];
}

function normalizeEmployee(emp) {
  const name = emp.Name || "";
  const nameText = typeof name === "string" ? name : String(name.display_value || "").trim();
  const parts = nameText.split(/\s+/).filter(Boolean);
  const firstName = firstValue(emp, ["First_Name", "first_name"], typeof name === "object" ? name.first_name || "" : parts[0] || "");
  const lastName = firstValue(emp, ["Last_Name", "last_name"], typeof name === "object" ? name.last_name || "" : parts.slice(1).join(" "));
  const allowedModules = parseModules(firstValue(emp, [
    "Allowed_Modules",
    "allowed_modules",
    "Modules_Provided",
    "modules_provided",
  ]));

  return {
    id: emp.ID,
    email: firstValue(emp, ["Email", "email"]),
    firstName,
    lastName,
    designation: firstValue(emp, ["Designation", "designation", "Role_Name", "role_name"]),
    hourlyRate: parseFloat(firstValue(emp, ["Hourly_Rate", "hourly_rate", "salary"], 0)),
    isAdmin: false,
    allowedModules: allowedModules.length ? allowedModules : DEFAULT_STAFF_MODULES,
    roleTemplate: firstValue(emp, ["Role_Template", "role_template"]),
    shiftsEmployeeId: firstValue(emp, ["Shifts_Employee_ID", "shifts_employee_id"], null),
  };
}

function employeePin(emp) {
  return String(firstValue(emp, ["PIN", "Pin", "pin", "pinin", "Pinin"])).trim();
}

function isEmployeeActive(emp) {
  const raw = firstValue(emp, ["Is_Active", "is_active"], true);
  if (typeof raw === "boolean") return raw;
  const value = String(raw).trim().toLowerCase();
  return !["false", "no", "inactive", "disabled", "0"].includes(value);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { action } = req.query;

  // ── GET /api/auth?action=login-url ──
  // Returns the Zoho OAuth login URL for the frontend to redirect to
  if (action === "login-url") {
    const url = `https://accounts.zoho.com/oauth/v2/auth?` +
      `response_type=code` +
      `&client_id=${CLIENT_ID}` +
      `&scope=${encodeURIComponent(SCOPES)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&access_type=offline` +
      `&prompt=consent`;
    return res.status(200).json({ url });
  }

  // ── POST /api/auth?action=callback ──
  // Exchanges the authorization code for tokens, looks up employee in Creator
  if (action === "callback" && req.method === "POST") {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: "Missing code" });

    try {
      // 1. Exchange code for tokens
      const tokenRes = await fetch("https://accounts.zoho.com/oauth/v2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type:    "authorization_code",
          client_id:     CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri:  REDIRECT_URI,
          code,
        }),
      });
      const tokenData = await tokenRes.json();
      if (tokenData.error) return res.status(401).json({ error: tokenData.error });

      const userAccessToken = tokenData.access_token;

      // 2. Get the user's profile (email) from Zoho
      // Try /oauth/user/info first, then /userinfo as fallback
      let email = "";
      try {
        const profileRes = await fetch("https://accounts.zoho.com/oauth/user/info", {
          headers: { Authorization: `Zoho-oauthtoken ${userAccessToken}` },
        });
        const profile = await profileRes.json();
        email = (
          profile.Email || profile.email ||
          profile.ZPUID || profile.mail ||
          profile.Display_Name || ""
        ).toLowerCase().trim();
        // If it looks like a user ID not an email, clear it
        if (email && !email.includes("@")) email = "";
      } catch(_) {}

      // Fallback: try OIDC userinfo endpoint
      if (!email) {
        try {
          const uiRes = await fetch("https://accounts.zoho.com/oauth/v2/userinfo", {
            headers: { Authorization: `Zoho-oauthtoken ${userAccessToken}` },
          });
          const ui = await uiRes.json();
          email = (ui.email || ui.Email || "").toLowerCase().trim();
        } catch(_) {}
      }

      if (!email) return res.status(401).json({ error: "Could not retrieve email from Zoho", debug: "profile_fetch_failed" });

      // 3. Check if this is the admin (owner)
      const ADMIN_EMAIL = process.env.ZOHO_ADMIN_EMAIL || "";
      if (ADMIN_EMAIL && email === ADMIN_EMAIL.toLowerCase()) {
        return res.status(200).json({
          success: true,
          user: {
            id: "admin",
            email,
            firstName: "Satya",
            lastName: "",
            designation: "Owner",
            isAdmin: true,
            allowedModules: ["ALL"],
            shiftsEmployeeId: null,
          },
          accessToken: userAccessToken,
        });
      }

      // 4. Look up employee in Zoho Creator by email
      const creatorToken = await getZohoToken();
      const empRes = await fetch(
        `${ZOHO_BASE}/report/Employees_Report?criteria=Email%3D%22${encodeURIComponent(email)}%22&max_records=1`,
        { headers: { Authorization: `Zoho-oauthtoken ${creatorToken}` } }
      );
      const empData = await empRes.json();
      const records = empData.data || [];

      if (records.length === 0) {
        // Fallback: try matching by name if email field not yet populated
        return res.status(403).json({
          error: "no_employee_record",
          message: "Your account was not found in the system. Please contact your manager.",
          email,
        });
      }

      const emp = records[0];
      const allowedModules = emp.Allowed_Modules
        ? emp.Allowed_Modules.split(",").map(m => m.trim()).filter(Boolean)
        : ["Dashboard", "PAR Entry", "Sales Entry", "Staff Hours", "Temp Log", "Checklists", "Waste Log"];

      return res.status(200).json({
        success: true,
        user: {
          id: emp.ID,
          email,
          firstName: emp.First_Name || emp.first_name || "",
          lastName:  emp.Last_Name  || emp.last_name  || "",
          designation: emp.Designation || emp.designation || "",
          hourlyRate:  parseFloat(emp.Hourly_Rate || emp.hourly_rate || 0),
          isAdmin: false,
          allowedModules,
          roleTemplate: emp.Role_Template || emp.role_template || "",
          shiftsEmployeeId: emp.Shifts_Employee_ID || emp.shifts_employee_id || null,
        },
        accessToken: userAccessToken,
      });

    } catch (e) {
      console.error("Auth callback error:", e);
      return res.status(500).json({ error: e.message });
    }
  }

  // ── POST /api/auth?action=verify-pin ──
  // Legacy PIN fallback for admin during transition
  if (action === "verify-pin" && req.method === "POST") {
    const { employeeId, pin } = req.body || {};
    if (!pin) return res.status(400).json({ error: "Missing PIN" });

    const ADMIN_PIN = process.env.ZOHO_ADMIN_PIN || "satya";
    if (!employeeId && pin === ADMIN_PIN) {
      return res.status(200).json({
        success: true,
        user: {
          id: "admin",
          firstName: "Satya",
          lastName: "",
          designation: "Owner",
          isAdmin: true,
          allowedModules: ["ALL"],
          shiftsEmployeeId: null,
        },
      });
    }

    if (!employeeId) return res.status(400).json({ error: "Missing employee" });

    try {
      const creatorToken = await getZohoToken();
      const empRes = await fetch(`${ZOHO_BASE}/report/All_Employees?max_records=200`, {
        headers: { Authorization: `Zoho-oauthtoken ${creatorToken}` },
      });
      const empData = await empRes.json();
      const emp = (empData.data || []).find(record => String(record.ID) === String(employeeId));

      if (!emp) {
        return res.status(404).json({
          error: "employee_not_found",
          message: "Employee not found. Ask a manager to check the Zoho employee table.",
        });
      }

      if (!isEmployeeActive(emp)) {
        return res.status(403).json({
          error: "inactive_employee",
          message: "This employee is inactive. Please contact your manager.",
        });
      }

      if (employeePin(emp) !== String(pin).trim()) {
        return res.status(401).json({
          error: "invalid_pin",
          message: "Invalid PIN. Please check and try again.",
        });
      }

      return res.status(200).json({
        success: true,
        user: normalizeEmployee(emp),
      });
    } catch (e) {
      console.error("PIN verification error:", e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: "Unknown action" });
}
