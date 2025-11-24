// pages/api/testdb.js
import { getPool } from "../../lib/db";

export default async function handler(req, res) {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT 1 AS result");
    res.status(200).json({ ok: true, dbResult: rows[0] });
  } catch (err) {
    console.error("❌ /api/testdb error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
