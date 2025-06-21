import React, { useState } from "react";
import "./FormPage.css";
import { useNavigate } from "react-router-dom";


export default function FormPage() {
  const [step, setStep] = useState(1);
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");

  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!resume) {
      setStatus("Please upload your resume.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobDescription", jobDescription);
    formData.append("notes", notes);

    try {
      const response = await fetch("http://localhost:5000/submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        navigate("/loading");

        setStep(1);
        setResume(null);
        setJobDescription("");
        setNotes("");
        setStatus("");
      } else {
        setStatus("❌ Submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("❌ An error occurred. Please try again.");
    }
  };

  const progressPercentage = step === 1 ? "33%" : step === 2 ? "66%" : "100%";

  return (
    <section className="form-wrapper">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress" style={{ width: progressPercentage }} />
      </div>

      <h2>Submit Your Info</h2>
      <p className="form-subtext">
        Provide us with more information about your interview. The more info we have, the better our AI bot can give you a more professional and real interview question.
      </p>

      <form className="form-box" onSubmit={handleSubmit}>
        {step === 1 && (
          <label className="form-label">
            Resume Upload
            <div className="upload-card">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files[0])}
                required
              />
            </div>
          </label>
        )}

        {step === 2 && (
          <label className="form-label">
            Job Description
            <textarea
              className="text-input"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              required
            />
          </label>
        )}

        {step === 3 && (
          <label className="form-label">
            Additional Notes (optional)
            <textarea
              className="text-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </label>
        )}

        <div className="form-buttons">
          {step > 1 && (
            <button type="button" className="nav-btn" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}

          {step < 3 && (
            <button type="button" className="nav-btn" onClick={() => setStep(step + 1)}>
              Next
            </button>
          )}

          {step === 3 && (
            <button type="submit" className="submit-btn">
              Submit
            </button>
          )}
        </div>
      </form>

      {status && <p className="form-status">{status}</p>}
    </section>
  );
}
