require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

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

// === Interview Generation Functions ===
function parseResponse(text) {
  // Extract all questions (text between $$ markers)
  const questionMatches = text.match(/\$\$(.*?)\$\$/gs) || [];
  const questions = questionMatches.map(match => match.replace(/\$\$/g, '').trim());
  
  // Extract all purposes (text between && markers)
  const purposeMatches = text.match(/&&(.*?)&&/gs) || [];
  const purposes = purposeMatches.map(match => match.replace(/&&/g, '').trim());
  
  // Create array of {question, purpose} objects
  const qaPairs = [];
  const minLength = Math.min(questions.length, purposes.length);
  
  for (let i = 0; i < minLength; i++) {
    qaPairs.push({
      question: questions[i],
      purpose: purposes[i]
    });
  }
  
  return qaPairs;
}

async function generateQuestions(resumePath, jobInfoPath, minutes = 30) {
  try {
    // Initialize the Google AI client
    const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Read files
    const resumeBuffer = fs.readFileSync(resumePath);
    const jobInfo = fs.readFileSync(jobInfoPath, 'utf8');
    
    // FIND COMPANY VALUES AND WORKPLACE CULTURE IN A SEPARATE PROMPT
    const culturePrompt = 
      "Using the attached job information provided in the text file, extract and summarize the company's values and workplace culture. " +
      "Highlight any mentions of diversity, innovation, team collaboration, mentorship, ethical standards, and employee well-being. " +
      "Present the response as a clear and concise list.";

    const cultureResult = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(jobInfo).toString('base64'),
          mimeType: 'text/plain'
        }
      },
      culturePrompt
    ]);
    
    const cultureResponse = cultureResult.response.text();
    
    // Generate interview questions
    const prompt = 
      `Using the attached resume (in PDF format) and the job information provided in the text file, ` +
      `generate a list of targeted interview questions that evaluate the candidate's technical expertise, ` +
      `problem-solving abilities, and alignment with the role's responsibilities. ` +
      `Try to evaluate the candidate's situational and behavioural awareness and how well ` +
      `they can be expected to fit into the office's work environment and company's values. Take into account the company's culture and workplace environment which is described as the following : ${cultureResponse}. Keep in mind that these questions are going to be used in an interview that will last roughly ${minutes} many minutes. Make it so that the list can be comfortably read and answered within that time frame. ` +
      `[RULES] For any parts in the response that are spoken need to be surrounded by $$ and ended by $$ as markers for the spoken questions. For any parts that highlight the purpose of a question, surround it with && and ended by &&. Do not use unnatural language such as "()" in your response. Do not use acronyms such as e.g or etc, but words like API for Application Programming Interface are ok.`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: resumeBuffer.toString('base64'),
          mimeType: 'application/pdf'
        }
      },
      {
        inlineData: {
          data: Buffer.from(jobInfo).toString('base64'),
          mimeType: 'text/plain'
        }
      },
      prompt
    ]);
    
    const response = result.response.text();
    
    // Get the parsed questions
    const questions = parseResponse(response);
    
    return questions;
    
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

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

// === Generate Questions Route ===
app.post("/generate-questions", async (req, res) => {
  try {
    const { resumePath, jobInfoPath, minutes } = req.body;
    
    // Use uploaded files or default paths
    const actualResumePath = resumePath || path.join(__dirname, 'uploads', 'Resume.pdf');
    const actualJobInfoPath = jobInfoPath || path.join(__dirname, 'uploads', 'Ciena_Embedded_Software_Internship.txt');
    const actualMinutes = minutes || 30;
    
    console.log(`Generating questions for resume: ${actualResumePath}, job: ${actualJobInfoPath}, duration: ${actualMinutes} minutes`);
    
    const questions = await generateQuestions(actualResumePath, actualJobInfoPath, actualMinutes);
    
    res.json({ questions });
    
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ 
      error: "Failed to generate questions", 
      details: error.message 
    });
  }
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server is live on port ${PORT}`);
});


