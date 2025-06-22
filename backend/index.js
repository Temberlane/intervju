require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const util = require("util");
const bodyParser = require("body-parser");


// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = process.env.PORT || 5000;


// stuff for the gen
const { spawn } = require("child_process");
const path = require("path");

// Add this endpoint to your server.js
app.post("/generate-questions", async (req, res) => {
  try {
    const { resumePath, jobInfoPath, minutes } = req.body;
    
    // Spawn Python process
    const pythonProcess = spawn("python3", [
      path.join(__dirname, "../interviewGeneration.py"),
      resumePath || "uploads/Resume.pdf",
      jobInfoPath || "uploads/Ciena_Embedded_Software_Internship.txt",
      minutes || 30
    ]);
    
    let outputData = "";
    let errorData = "";
    
    // Collect data from script
    pythonProcess.stdout.on("data", (data) => {
      outputData += data.toString();
    });
    
    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        console.error(`Error output: ${errorData}`);
        return res.status(500).json({ error: "Failed to generate questions", details: errorData });
      }
      
      try {
        // Parse the output into a suitable format
        const questions = JSON.parse(outputData);
        res.json({ questions });
      } catch (err) {
        console.error("Failed to parse Python output:", err);
        res.status(500).json({ 
          error: "Failed to parse questions output",
          rawOutput: outputData
        });
      }
    });
  } catch (err) {
    console.error("Error running Python script:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


//Computer Vision Stuff
const { spawn } = require("child_process");

app.get("/run2", (req, res) => {
  const py = spawn("python3", [path.join(__dirname, "../VideoCapture.py")]); // No arguments!
  let output = "";
  let errorOutput = "";

  py.stdout.on("data", data => output += data.toString());
  py.stderr.on("data", err => errorOutput += err.toString());

  py.on("close", code => {
    if (code === 0) {
      res.send(output);
    } else {
      res.status(500).send(errorOutput || ("Exited with code " + code));
    }
  });
});


// === Middleware ===
app.use(cors({
  origin: "https://www.intervju.work", // ✅ Restrict to your frontend domain
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// === MongoDB Connection ===
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// === Multer Config ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// === Mongoose Model ===
const Form = require("./models/FormModel");

// === Routes ===
app.post("/submit", upload.single("resume"), async (req, res) => {
  try {
    const { jobDescription, notes } = req.body;
    const resumePath = req.file?.path || null;

    const newForm = new Form({ jobDescription, notes, resumePath });
    await newForm.save();

    res.status(200).json({ message: "✅ Form submitted successfully!" });
  } catch (err) {
    console.error("❌ Error submitting form:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server is live on port ${PORT}`);
});


