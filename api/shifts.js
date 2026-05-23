// /api/shifts.js
// Zoho Shifts API integration — schedules, timesheets, time off, employees

import { getZohoToken } from "./zoho-token.js";

const SHIFTS_ORG_ID = process.env.ZOHO_SHIFTS_ORG_ID || "906486714";
const SHIFTS_BASE   = `https://shifts.zoho.com/api/v1/${SHIFTS_ORG_ID}`;

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

    const { action, employeeId, shiftId, timesheetId, startDate, endDate, data } = req.body || {};

    switch (action) {

      // ── Get all employees from Shifts ──
      case "getEmployees": {
        const r = await fetch(`${SHIFTS_BASE}/employees?limit=100`, { headers });
        const d = await r.json();
        return res.status(200).json(d.employees || []);
      }

      // ── Get shifts for an employee (their schedule) ──
      case "getMySchedule": {
        const start = startDate || new Date().toISOString().split("T")[0];
        const end   = endDate   || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
        let url = `${SHIFTS_BASE}/shifts?start_date=${start}&end_date=${end}&status=published`;
        if (employeeId) url += `&employees=${employeeId}`;
        const r = await fetch(url, { headers });
        const d = await r.json();
        return res.status(200).json(d.shifts || []);
      }

      // ── Get all shifts (admin view) ──
      case "getAllShifts": {
        const start = startDate || new Date().toISOString().split("T")[0];
        const end   = endDate   || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
        const r = await fetch(`${SHIFTS_BASE}/shifts?start_date=${start}&end_date=${end}`, { headers });
        const d = await r.json();
        return res.status(200).json(d.shifts || []);
      }

      // ── Create a shift (admin) ──
      case "createShift": {
        const r = await fetch(`${SHIFTS_BASE}/shifts`, {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── Update a shift (admin) ──
      case "updateShift": {
        const r = await fetch(`${SHIFTS_BASE}/shifts/${shiftId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(data),
        });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── Delete a shift (admin) ──
      case "deleteShift": {
        const r = await fetch(`${SHIFTS_BASE}/shifts/${shiftId}`, {
          method: "DELETE",
          headers,
        });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── Get timesheets (for an employee or all) ──
      case "getTimesheets": {
        const start = startDate || new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
        const end   = endDate   || new Date().toISOString().split("T")[0];
        let url = `${SHIFTS_BASE}/timesheets?start_date=${start}&end_date=${end}`;
        if (employeeId) url += `&employee_id=${employeeId}`;
        const r = await fetch(url, { headers });
        const d = await r.json();
        return res.status(200).json(d.time_entries || []);
      }

      // ── Clock In — create a timesheet entry with start_time ──
      case "clockIn": {
        const body = {
          employee_id: employeeId,
          start_time:  new Date().toISOString(),
          schedule_id: data?.scheduleId,
          position_id: data?.positionId,
          shift_id:    data?.shiftId || undefined,
          notes:       data?.notes || "",
        };
        // Remove undefined fields
        Object.keys(body).forEach(k => body[k] === undefined && delete body[k]);
        const r = await fetch(`${SHIFTS_BASE}/timesheets`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── Clock Out — update timesheet entry with end_time ──
      case "clockOut": {
        const r = await fetch(`${SHIFTS_BASE}/timesheets/${timesheetId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ end_time: new Date().toISOString() }),
        });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── Get time off requests ──
      case "getTimeOff": {
        let url = `${SHIFTS_BASE}/timeoff`;
        if (employeeId) url += `?employee_id=${employeeId}`;
        const r = await fetch(url, { headers });
        const d = await r.json();
        return res.status(200).json(d.time_off_requests || d || []);
      }

      // ── Create time off request ──
      case "requestTimeOff": {
        const r = await fetch(`${SHIFTS_BASE}/timeoff`, {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── Approve / deny time off (admin) ──
      case "updateTimeOff": {
        const { timeOffId, status } = data || {};
        const r = await fetch(`${SHIFTS_BASE}/timeoff/${timeOffId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ status }),
        });
        const d = await r.json();
        return res.status(200).json(d);
      }

      // ── Get Shifts org settings (schedules, positions) ──
      case "getSettings": {
        const [schedRes, posRes] = await Promise.all([
          fetch(`${SHIFTS_BASE}/settings/schedules`, { headers }),
          fetch(`${SHIFTS_BASE}/settings/positions`, { headers }),
        ]);
        const [schedData, posData] = await Promise.all([schedRes.json(), posRes.json()]);
        return res.status(200).json({
          schedules: schedData.schedules || [],
          positions: posData.positions   || [],
        });
      }

      default:
        return res.status(400).json({ error: "Unknown action: " + action });
    }
  } catch (e) {
    console.error("Shifts API error:", e);
    return res.status(500).json({ error: e.message });
  }
}
