// /api/zoho.js
import { getZohoToken, ZOHO_BASE } from "./zoho-token.js";

// ── Exact Zoho Creator report names ──
const REPORTS = {
  Employees:          "All_Employees",
  Recipes:            "All_Recipes",
  Ingredients:        "All_Ingredients",
  Recipe_Ingredients: "All_Recipe_Ingredients",
  PAR_Entries:        "PAR_Entries_Report",
  Sales_Entries:      "Sales_Entries_Report",
  Labor_Entries:      "Labor_Entries_Report",
};

// ── Exact Zoho Creator form names ──
const FORMS = {
  Employees:          "Employees",
  Recipes:            "Recipes",
  Ingredients:        "Ingredients",
  Recipe_Ingredients: "Recipe_Ingredients",
  PAR_Entries:        "PAR_Entries",
  Sales_Entries:      "Sales_Entries",
  Labor_Entries:      "Labor_Entries",
};

// ── Field name mappings from app → Zoho ──
const FIELD_MAPS = {
  Employees: (d) => ({
    Name: { first_name: d.first_name || "", last_name: d.last_name || "" },
    designation: d.designation || "",
    salary: d.hourly_rate || 0,
    pinin: d.pin || "",
  }),
  Recipes: (d) => ({
    Recipe_Name: d.recipe_name || d.name || "",
    Selling_Price: d.selling_price || d.price || 0,
    Is_Active: "true",
  }),
  Ingredients: (d) => ({
    Ingredient_Name: d.ingredient_name || "",
    Purchase_Unit: d.purchase_unit || "",
    Category: d.category || "",
    Weekly_PAR: d.weekly_par || "",
    Cost_Per_Unit: d.cost_per_unit || 0,
  }),
  Recipe_Ingredients: (d) => ({
    Recipe_Name: d.recipe_name || "",
    Recipe_ID: d.recipe_id || "",
    Ingredient_Name: d.ingredient_name || "",
    Ingredient_ID: d.ingredient_id || "",
    Quantity_Per_Plate: d.quantity_per_plate || 0,
  }),
  PAR_Entries: (d) => ({
    Ingredient_Name: d.ingredient_name || "",
    Ingredient_ID: d.ingredient_id || "",
    Entry_Date: d.entry_date || "",
    On_Hand: d.on_hand || 0,
    Order_Quantity: d.order_qty || 0,
    Completed_By: d.completed_by || "",
  }),
  Sales_Entries: (d) => ({
    Sale_Date: d.sale_date || "",
    Recipe_Name: d.recipe_name || "",
    Recipe_ID: d.recipe_id || "",
    Quantity_Sold: d.qty_sold || 0,
    Selling_Price: d.selling_price || 0,
    Entered_By: d.entered_by || "",
  }),
  Labor_Entries: (d) => ({
    Work_Date: d.work_date || "",
    Employee_Name: d.employee_name || "",
    Employee_ID: d.employee_id || "",
    Designation: d.designation || "",
    Hours_Worked: d.hours_worked || 0,
    Hourly_Rate: d.hourly_rate || 0,
  }),
};

// ── Normalize records from Zoho → app format ──
function normalize(form, records) {
  if (!records || !Array.isArray(records)) return [];
  return records.map((r) => {
    if (form === "Employees") {
      return {
        ID: r.ID,
        first_name: r.Name?.first_name || "",
        last_name: r.Name?.last_name || "",
        designation: r.designation || "",
        hourly_rate: parseFloat(r.salary || 0),
        pin: r.pinin || "",
        is_active: r.Is_Active || "",
      };
    }
    if (form === "Recipes") {
      return {
        ID: r.ID,
        recipe_name: r.Recipe_Name || "",
        selling_price: parseFloat(r.Selling_Price || 0),
      };
    }
    if (form === "Ingredients") {
      return {
        ID: r.ID,
        ingredient_id: r.Ingredient_ID || r.ID,
        ingredient_name: r.Ingredient_Name || "",
        purchase_unit: r.Purchase_Unit || "",
        category: r.Category || "",
        weekly_par: r.Weekly_PAR || "",
        cost_per_unit: parseFloat(r.Cost_Per_Unit || 0),
      };
    }
    if (form === "Recipe_Ingredients") {
      return {
        ID: r.ID,
        recipe_id: r.Recipe_ID || "",
        recipe_name: r.Recipe_Name || "",
        ingredient_id: r.Ingredient_ID || "",
        ingredient_name: r.Ingredient_Name || "",
        quantity_per_plate: parseFloat(r.Quantity_Per_Plate || 0),
      };
    }
    if (form === "PAR_Entries") {
      return {
        ID: r.ID,
        ingredient_id: r.Ingredient_ID || "",
        ingredient_name: r.Ingredient_Name || "",
        entry_date: r.Entry_Date || "",
        on_hand: parseFloat(r.On_Hand || 0),
        order_qty: parseFloat(r.Order_Quantity || 0),
        completed_by: r.Completed_By || "",
      };
    }
    if (form === "Sales_Entries") {
      return {
        ID: r.ID,
        recipe_id: r.Recipe_ID || "",
        recipe_name: r.Recipe_Name || "",
        sale_date: r.Sale_Date || "",
        qty_sold: parseInt(r.Quantity_Sold || 0),
        selling_price: parseFloat(r.Selling_Price || 0),
        entered_by: r.Entered_By || "",
      };
    }
    if (form === "Labor_Entries") {
      return {
        ID: r.ID,
        employee_id: r.Employee_ID || "",
        employee_name: r.Employee_Name || "",
        work_date: r.Work_Date || "",
        hours_worked: parseFloat(r.Hours_Worked || 0),
        hourly_rate: parseFloat(r.Hourly_Rate || 0),
        designation: r.Designation || "",
      };
    }
    return r;
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const token = await getZohoToken();
    const { action, form, data, recordId, criteria } = req.body || {};

    const headers = {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
    };

    const reportName = REPORTS[form] || form;
    const formName = FORMS[form] || form;

    switch (action) {

      // ── GET all records ──
      case "getAll": {
        let url = `${ZOHO_BASE}/report/${reportName}?max_records=200`;
        if (criteria) url += `&criteria=${encodeURIComponent(criteria)}`;
        const r = await fetch(url, { method: "GET", headers });
        const d = await r.json();
        console.log("Zoho raw response for", reportName, ":", JSON.stringify(d).substring(0,500));
        const normalized = normalize(form, d.data || []);
        return res.status(200).json(normalized);
      }

      // ── DEBUG raw response ──
      case "debug": {
        let url = `${ZOHO_BASE}/report/${reportName}?max_records=5`;
        const r = await fetch(url, { method: "GET", headers });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── CREATE record ──
      case "create": {
        const mappedData = FIELD_MAPS[form] ? FIELD_MAPS[form](data) : data;
        const url = `${ZOHO_BASE}/form/${formName}`;
        const r = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({ data: mappedData }),
        });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── UPDATE record ──
      case "update": {
        const mappedData = FIELD_MAPS[form] ? FIELD_MAPS[form](data) : data;
        const url = `${ZOHO_BASE}/report/${reportName}/${recordId}`;
        const r = await fetch(url, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ data: mappedData }),
        });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── DELETE record ──
      case "delete": {
        const url = `${ZOHO_BASE}/report/${reportName}/${recordId}`;
        const r = await fetch(url, { method: "DELETE", headers });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── DELETE by criteria ──
      case "deleteByCriteria": {
        const getUrl = `${ZOHO_BASE}/report/${reportName}?criteria=${encodeURIComponent(criteria)}&max_records=200`;
        const gr = await fetch(getUrl, { method: "GET", headers });
        const gd = await gr.json();
        const records = gd.data || [];
        for (const rec of records) {
          await fetch(`${ZOHO_BASE}/report/${reportName}/${rec.ID}`, {
            method: "DELETE",
            headers,
          });
        }
        return res.status(200).json({ deleted: records.length });
      }

      default:
        return res.status(400).json({ error: "Unknown action: " + action });
    }
  } catch (e) {
    console.error("Zoho API error:", e);
    return res.status(500).json({ error: e.message });
  }
}
