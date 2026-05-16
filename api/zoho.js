// /api/zoho.js
// Single API route handling all Zoho Creator CRUD operations
import { getZohoToken, ZOHO_BASE } from "./zoho-token.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const token = await getZohoToken();
    const { action, form, data, recordId, criteria } = req.body || {};

    const headers = {
      "Authorization": `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
    };

    let url, method, body;

    switch (action) {

      // ── GET all records from a form ──
      case "getAll": {
        url = `${ZOHO_BASE}/report/${form}?max_records=200`;
        if (criteria) url += `&criteria=${encodeURIComponent(criteria)}`;
        method = "GET";
        const r = await fetch(url, { method, headers });
        const d = await r.json();
        return res.status(200).json(d.data || []);
      }

      // ── CREATE a new record ──
      case "create": {
        url = `${ZOHO_BASE}/form/${form}`;
        method = "POST";
        body = JSON.stringify({ data });
        const r = await fetch(url, { method, headers, body });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── UPDATE a record ──
      case "update": {
        url = `${ZOHO_BASE}/report/${form}/${recordId}`;
        method = "PATCH";
        body = JSON.stringify({ data });
        const r = await fetch(url, { method, headers, body });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── DELETE a record ──
      case "delete": {
        url = `${ZOHO_BASE}/report/${form}/${recordId}`;
        method = "DELETE";
        const r = await fetch(url, { method, headers });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── DELETE by criteria (e.g. all PAR entries for a date) ──
      case "deleteByCriteria": {
        // First get matching records then delete each
        const getUrl = `${ZOHO_BASE}/report/${form}?criteria=${encodeURIComponent(criteria)}&max_records=200`;
        const gr = await fetch(getUrl, { method: "GET", headers });
        const gd = await gr.json();
        const records = gd.data || [];
        for (const rec of records) {
          await fetch(`${ZOHO_BASE}/report/${form}/${rec.ID}`, { method: "DELETE", headers });
        }
        return res.status(200).json({ deleted: records.length });
      }

      default:
        return res.status(400).json({ error: "Unknown action" });
    }
  } catch (e) {
    console.error("Zoho API error:", e);
    return res.status(500).json({ error: e.message });
  }
}
