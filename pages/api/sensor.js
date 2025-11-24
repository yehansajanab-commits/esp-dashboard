// pages/api/sensor.js
import { getPool } from "../../lib/db";

export default async function handler(req, res) {
  try {
    const pool = getPool();

    const [latestRows] = await pool.query(
      "SELECT ts, temperature, cond_state FROM sensor_data ORDER BY ts DESC LIMIT 1"
    );
    const [historyRows] = await pool.query(
      "SELECT ts, temperature, cond_state FROM sensor_data ORDER BY ts DESC LIMIT 20"
    );

    res.status(200).json({
      latest: latestRows[0] || null,
      history: historyRows,
    });
  } catch (err) {
    console.error("API /sensor error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
