import express from "express";
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database(":memory:");

// Create weather-survey table
db.run(`
  CREATE TABLE weather_survey (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    weather_conditions TEXT
  )
`);

// POST /weather-survey endpoint
app.post("/weather-survey", (req, res) => {
  const { name, email, weatherConditions } = req.body;

  // Insert new response into database
  db.run(
    `
    INSERT INTO weather_survey (name, email, weather_conditions)
    VALUES (?, ?, ?)
  `,
    [name, email, weatherConditions],
    function (err) {
      if (err) {
        console.error(err);
        res
          .status(500)
          .json({ error: "Failed to insert response into database" });
      } else {
        // Return id of newly created response
        res.json({ id: this.lastID });
      }
    }
  );
});

// GET /weather-survey/:id endpoint
app.get("/weather-survey/:id", (req, res) => {
  const { id } = req.params;

  // Retrieve response from database
  db.get(
    `
    SELECT * FROM weather_survey WHERE id = ?
  `,
    [id],
    (err, row) => {
      if (err) {
        console.error(err);
        res
          .status(500)
          .json({ error: "Failed to retrieve response from database" });
      } else if (!row) {
        res.status(404).json({ error: "Response not found" });
      } else {
        // Return response
        res.json(row);
      }
    }
  );
});

// GET /weather-survey endpoint
app.get("/weather-survey", (req, res) => {
  // Retrieve all responses from database
  db.all(
    `
    SELECT * FROM weather_survey
  `,
    (err, rows) => {
      if (err) {
        console.error(err);
        res
          .status(500)
          .json({ error: "Failed to retrieve responses from database" });
      } else {
        // Return responses
        res.json(rows);
      }
    }
  );
});

// Start server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
