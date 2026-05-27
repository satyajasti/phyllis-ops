// /api/employees.js
// Fetch all employees for the login dropdown

import { getZohoToken, ZOHO_BASE } from "./zoho-token.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get Zoho Creator token
    const creatorToken = await getZohoToken();

    // Fetch all employees from Employees_Report
    const empRes = await fetch(
      `${ZOHO_BASE}/report/Employees_Report?max_records=500`,
      { headers: { Authorization: `Zoho-oauthtoken ${creatorToken}` } }
    );

    const empData = await empRes.json();
    const records = empData.data || [];

    // Map employees to simple format for dropdown
    const employees = records
      .filter(emp => {
        // Only include active employees
        const isActive = emp.Is_Active === true || 
                        emp.is_active === "true" || 
                        emp.Is_Active === "Choice 1";
        return isActive;
      })
      .map(emp => ({
        id: emp.ID,
        name: `${emp.First_Name || emp.first_name || ""} ${emp.Last_Name || emp.last_name || ""}`.trim(),
        role: emp.Role_Name || emp.role_name || emp.Designation || emp.designation || "Staff",
        email: emp.Email || emp.email || "",
      }))
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort by name

    return res.status(200).json({
      success: true,
      employees,
      count: employees.length,
    });

  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({
      error: "Failed to fetch employees",
      message: error.message,
    });
  }
}
