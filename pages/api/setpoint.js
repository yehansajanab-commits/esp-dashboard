// pages/api/setpoint.js
import { getPool } from "../../lib/db";

const DEVICE_ID = process.env.DEVICE_ID || "esp32-1";

export default async function handler(req, res) {
  const pool = getPool();

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query(
        `
        SELECT threshold, updated_at
        FROM device_settings
        WHERE device_id = ?
        ORDER BY updated_at DESC
        LIMIT 1
      `,
        [DEVICE_ID]
      );

      res.status(200).json(rows[0] || null);
    } catch (err) {
      console.error("GET /setpoint error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "POST") {
    try {
      const { threshold } = req.body;
      const value = parseFloat(threshold);

      if (Number.isNaN(value)) {
        return res.status(400).json({ error: "Invalid threshold" });
      }

      await pool.query(
        `
        INSERT INTO device_settings (device_id, threshold)
        VALUES (?, ?)
      `,
        [DEVICE_ID, value]
      );

      res.status(201).json({ ok: true, threshold: value });
    } catch (err) {
      console.error("POST /setpoint error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end("Method Not Allowed");
  }
}
