require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

//Computer Vision Stuff
const { spawn } = require("child_process");

app.get("/run2/:arg", (req, res) => {
  const py = spawn("python", ["VideoCapture.py", req.params.arg]);
  let output = "";

  py.stdout.on("data", data => output += data.toString());
  py.stderr.on("data", err => console.error(err.toString()));

  py.on("close", code => {
    if (code === 0) {
      res.send(output);
    } else {
      res.status(500).send("Exited with code " + code);
    }
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Multer storage config (store resume file in uploads/)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Define model
const Form = require("./models/FormModel");

// POST endpoint to handle form submission
app.post("/submit", upload.single("resume"), async (req, res) => {
  try {
    const { jobDescription, notes } = req.body;
    const resumePath = req.file ? req.file.path : null;

    const newForm = new Form({
      jobDescription,
      notes,
      resumePath,
    });

    await newForm.save();

    res.status(200).json({ message: "Form submitted successfully!" });
  } catch (err) {
    console.error("Error submitting form:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


