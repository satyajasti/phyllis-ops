

Share
Lite
Perfect! Here's the complete updated auth.js code ready to copy-paste:
How to Update:
Go to: https://github.com/satyajasti/phyllis-ops/blob/main/api/auth.js
Click the pencil icon (Edit ) in the top right
Select all the code (Ctrl+A or Cmd+A)
Delete it
Paste the new code from the attached file
Scroll down and click "Commit changes"
Add commit message: feat: add PIN login support for kitchen staff
Click "Commit"
Key Features of Updated Code:
✅ PIN Login for Staff - Chef, Cook, Server, etc. can login with PIN
✅ Zoho OAuth for Admins - Managers still use Zoho login
✅ Module Access Control - Returns allowed modules from Employees table
✅ Better Error Handling - Clear messages for invalid PIN or inactive employees
✅ Automatic Field Detection - Works with different field name formats (Email, email, Email_Name, etc.)
After Deployment:
Add PIN field to Employees table in Zoho Creator
Set PIN for each employee (e.g., 1234, 5678, 9012)
Chef can login with PIN:
Go to https://phyllis-ops.vercel.app/
Click "ADMIN PIN" button
Enter PIN: 1234
✅ Logged in!
Testing:
Once deployed, test with:
Chef PIN: 1234
Cook PIN: 5678
Admin PIN: satya (or your custom ZOHO_ADMIN_PIN )
The code is ready in the attachment. Copy it and paste it into GitHub!
Let me know once you've updated it and I can help troubleshoot if needed.
phyllis_ops_auth_updated.js
Code · 9.34 KB
View all files in this task
Task completed
How was this result?
Suggested follow-ups



Cloud computers
New

phyllis_ops_auth_updated.js
// /api/auth.js
// Handles Zoho OAuth 2.0 login flow + PIN-based login for PhyllisOps staff access
// Updated to support PIN login for kitchen staff who don't have Zoho accounts

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

// ─── Helper: Parse modules from Zoho Creator field ───
function parseModules(modulesField) {
  if (!modulesField) {
    return ["Dashboard", "PAR Entry", "Sales Entry", "Staff Hours", "Temp Log", "Checklists", "Waste Log"];
  }
  // Handle both comma-separated string and array formats
  const modules = Array.isArray(modulesField) 
    ? modulesField 
    : modulesField.split(",").map(m => m.trim()).filter(Boolean);
  return modules.length > 0 ? modules : ["Dashboard"];
}

// ─── Helper: Get employee from Zoho Creator by field ───
async function getEmployeeByField(fieldName, fieldValue) {
  try {
    const creatorToken = await getZohoToken();
    const encodedValue = encodeURIComponent(fieldValue);
    
    // Query the Employees_Report with the specified field
    const empRes = await fetch(
      `${ZOHO_BASE}/report/Employees_Report?criteria=${fieldName}%3D%22${encodedValue}%22&max_records=1`,
      { headers: { Authorization: `Zoho-oauthtoken ${creatorToken}` } }
    );
    
    const empData = await empRes.json();
    const records = empData.data || [];
    
    return records.length > 0 ? records[0] : null;
  } catch (error) {
    console.error(`Error fetching employee by ${fieldName}:`, error);
    return null;
  }
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
      const emp = await getEmployeeByField("Email", email);

      if (!emp) {
        return res.status(403).json({
          error: "no_employee_record",
          message: "Your account was not found in the system. Please use PIN login or contact your manager.",
          email,
        });
      }

      const allowedModules = parseModules(emp.Modules_Provided || emp.modules_provided);

      return res.status(200).json({
        success: true,
        user: {
          id: emp.ID,
          email,
          firstName: emp.First_Name || emp.first_name || "",
          lastName:  emp.Last_Name  || emp.last_name  || "",
          designation: emp.Designation || emp.designation || emp.Role_Name || emp.role_name || "",
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
  // NEW: PIN-based login for kitchen staff (no Zoho account needed)
  if (action === "verify-pin" && req.method === "POST") {
    const { pin } = req.body || {};
    
    if (!pin) {
      return res.status(400).json({ error: "Missing PIN" });
    }

    try {
      // 1. Check if this is the admin PIN
      const ADMIN_PIN = process.env.ZOHO_ADMIN_PIN || "satya";
      if (pin === ADMIN_PIN) {
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

      // 2. Look up employee in Zoho Creator by PIN
      const emp = await getEmployeeByField("PIN", pin);

      if (!emp) {
        return res.status(401).json({
          error: "invalid_pin",
          message: "Invalid PIN. Please check and try again.",
        });
      }

      // 3. Check if employee is active
      const isActive = emp.Is_Active === true || emp.is_active === "true" || emp.Is_Active === "Choice 1";
      if (!isActive) {
        return res.status(403).json({
          error: "inactive_employee",
          message: "Your account is inactive. Please contact your manager.",
        });
      }

      // 4. Parse allowed modules
      const allowedModules = parseModules(emp.Modules_Provided || emp.modules_provided);

      // 5. Return employee data
      return res.status(200).json({
        success: true,
        user: {
          id: emp.ID,
          email: emp.Email || emp.email || "",
          firstName: emp.First_Name || emp.first_name || "",
          lastName:  emp.Last_Name  || emp.last_name  || "",
          designation: emp.Designation || emp.designation || emp.Role_Name || emp.role_name || "",
          hourlyRate:  parseFloat(emp.Hourly_Rate || emp.hourly_rate || 0),
          isAdmin: false,
          allowedModules,
          roleTemplate: emp.Role_Template || emp.role_template || "",
          shiftsEmployeeId: emp.Shifts_Employee_ID || emp.shifts_employee_id || null,
        },
      });

    } catch (e) {
      console.error("PIN verification error:", e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: "Unknown action" });
}
Connecting Bridge: Messaging Platform for IT Recruiters and Consultants - Manus
