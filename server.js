const express = require("express");
const cors = require("cors");
const path = require("path");
const medicineRoutes = require("./routes/medicineRoutes");
const medicineController = require("./controllers/medicineController");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.get("/", (req, res) => {
  res.json({ success: true, message: "MAAJ PHARMACY backend running" });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API OK" });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/medicines", medicineRoutes);

medicineController.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log("MAAJ PHARMACY backend running on http://localhost:" + PORT);
      console.log("Medicine API: http://localhost:" + PORT + "/api/medicines");
    });
  })
  .catch((err) => {
    console.error("Database initialization failed:", err.message);
    process.exit(1);
  });