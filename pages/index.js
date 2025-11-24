// pages/index.js
import { useEffect, useState } from "react";

export default function Home() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [setpoint, setSetpoint] = useState("");
  const [currentSetpoint, setCurrentSetpoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function fetchData() {
    try {
      setLoading(true);

      const [sensorRes, setpointRes] = await Promise.all([
        fetch("/api/sensor"),
        fetch("/api/setpoint"),
      ]);

      const sensorData = await sensorRes.json();
      const setpointData = await setpointRes.json();

      setLatest(sensorData.latest || null);
      setHistory(sensorData.history || []);
      setCurrentSetpoint(setpointData || null);
    } catch (err) {
      console.error("Error fetching data", err);
      setMessage("Failed to load data from server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  async function handleSetpointSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/setpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold: setpoint }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update setpoint");
      }

      setSetpoint("");
      setMessage("Setpoint updated!");
      fetchData();
    } catch (err) {
      console.error("Setpoint error:", err);
      setMessage(err.message || "Failed to update setpoint");
    }
  }

  return (
    <div style={styles.page}>
      <h1>ESP Automation Dashboard</h1>

      <div style={styles.card}>
        <h2>Current Sensor Status</h2>
        {loading && <p>Loading...</p>}
        {!loading && latest && (
          <p style={styles.status}>
            <strong>Time:</strong> {new Date(latest.ts).toLocaleString()} <br />
            <strong>Temperature:</strong> {latest.temperature} °C <br />
            <strong>Condition:</strong>{" "}
            {latest.cond_state ? (
              <span style={{ ...styles.badge, ...styles.badgeOn }}>ON (1)</span>
            ) : (
              <span style={{ ...styles.badge, ...styles.badgeOff }}>OFF (0)</span>
            )}
          </p>
        )}
        {!loading && !latest && <p>No sensor data yet.</p>}
      </div>

      <div style={styles.card}>
        <h2>Setpoint Control</h2>
        {currentSetpoint ? (
          <p>
            <strong>Current setpoint:</strong> {currentSetpoint.threshold} °C
            <br />
            <small>
              Last updated:{" "}
              {new Date(currentSetpoint.updated_at).toLocaleString()}
            </small>
          </p>
        ) : (
          <p>
            <strong>Current setpoint:</strong> Not set yet.
          </p>
        )}

        {message && <p style={styles.message}>{message}</p>}

        <form onSubmit={handleSetpointSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="setpoint">New setpoint (°C): </label>
            <input
              id="setpoint"
              type="number"
              step="0.1"
              value={setpoint}
              onChange={(e) => setSetpoint(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>
            Save Setpoint
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <h2>Last 20 Records</h2>
        {history.length === 0 ? (
          <p>No data yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Temperature (°C)</th>
                <th>Condition</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, idx) => (
                <tr key={idx}>
                  <td>{new Date(row.ts).toLocaleString()}</td>
                  <td>{row.temperature}</td>
                  <td>{row.cond_state ? "ON (1)" : "OFF (0)"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    maxWidth: "900px",
    margin: "20px auto",
    padding: "10px",
    background: "#f5f5f5",
  },
  card: {
    background: "#fff",
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  status: {
    fontSize: "1.1em",
  },
  badge: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "4px",
    color: "#fff",
    fontSize: "0.9em",
  },
  badgeOn: {
    background: "#28a745",
  },
  badgeOff: {
    background: "#dc3545",
  },
  formGroup: {
    marginBottom: "10px",
  },
  input: {
    padding: "5px",
    width: "150px",
  },
  button: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "4px",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
  message: {
    color: "#007bff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    background: "#fff",
  },
};
