const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");
const util = require("util");

const app = express();
app.use(cors());
app.use(bodyParser.json());


const { spawn } = require("child_process");
const path = require("path");

// Add this endpoint to your server.js
app.post("/generate-questions", async (req, res) => {
  try {
    const { resumePath, jobInfoPath, minutes } = req.body;
    
    // Spawn Python process
    const pythonProcess = spawn("python3", [
      path.join(__dirname, "../interviewGeneration.py"),
      resumePath || "Resume.pdf",
      jobInfoPath || "Ciena_Embedded_Software_Internship.txt",
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


// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Check if key file exists before initializing client
try {
  if (!fs.existsSync("google-tts-key.json")) {
    console.error("ERROR: google-tts-key.json file not found!");
    process.exit(1);
  }
  
  const client = new textToSpeech.TextToSpeechClient({
    keyFilename: "google-tts-key.json",
  });

  app.get("/", (req, res) => {
    res.send("Server is running");
  });

  app.post("/speak", async (req, res) => {
    const text = req.body.text || "Hello!";
    console.log(`Processing TTS request for text: "${text}"`);

    const request = {
      input: { text },
      voice: {
        languageCode: "en-US",
        name: "en-US-Wavenet-D", // Choose voice here
      },
      audioConfig: { audioEncoding: "MP3" },
    };

    try {
      const [response] = await client.synthesizeSpeech(request);
      console.log("TTS request successful, sending audio response");
      res.set("Content-Type", "audio/mpeg");
      res.send(response.audioContent);
    } catch (err) {
      console.error("TTS Error:", err);
      res.status(500).send("Error generating speech");
    }
  });

  const PORT = process.env.PORT || 8000;
  const server = app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Server process ID: ${process.pid}`);
    console.log(`Server URL: http://localhost:${PORT}`);
  });

  server.on('error', (error) => {
    console.error('Server error:', error);
  });

  // Keep the Node.js process running
  process.stdin.resume();

} catch (error) {
  console.error("Server initialization error:", error);
}

process.on("SIGINT", () => {
  console.log("Backend shutting down gracefully.");
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});