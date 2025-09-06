import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

pool.getConnection()
  .then(conn => {
    console.log(" MySQL connected as", process.env.DB_USER);
    conn.release();
  })
  .catch(err => {
    console.error(" MySQL connection error:", err.message);
  });

app.get("/test-server", (req, res) => {
  res.json({ success: true, message: "Server is working " });
});

app.post("/users", async (req, res) => {
  try {
    const { name, department, mobile, checked } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name cannot be empty", data: null });
    }
    if (!department?.trim()) {
      return res.status(400).json({ success: false, message: "Department cannot be empty", data: null });
    }
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: "Enter a valid 10-digit mobile number", data: null });
    }
    if (!checked) {
      return res.status(400).json({ success: false, message: "Check me out to continue", data: null });
    }

    const [result] = await pool.query(
      "INSERT INTO users (name, department, mobile, checked) VALUES (?, ?, ?, ?)",
      [name.trim(), department.trim(), mobile, checked ? 1 : 0]
    );

    res.json({
      success: true,
      message: "Form submitted successfully ",
      data: {
        id: result.insertId,
        name: name.trim(),
        department: department.trim(),
        mobile,
        checked: checked ? 1 : 0
      }
    });

  } catch (err) {
    console.error(" Error inserting user:", err);
    res.status(500).json({
      success: false,
      message: "Database error",
      data: null
    });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
