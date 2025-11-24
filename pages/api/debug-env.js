// pages/api/debug-env.js
export default function handler(req, res) {
  res.status(200).json({
    DB_HOST: process.env.DB_HOST || null,
    DB_USER: process.env.DB_USER || null,
    DB_NAME: process.env.DB_NAME || null,
  });
}
