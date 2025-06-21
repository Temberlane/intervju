import React from "react";
import "./InterviewPage.css";
import { useEffect } from "react";

export default function InterviewPage() {
  useEffect(() => {
    document.body.style.overflow = "hidden";   // 💥 Prevent page scroll
    return () => {
      document.body.style.overflow = "auto";   // ✅ Restore on unmount
    };
  }, []);
  return (
    <section className="interview-wrapper">
      <div className="interview-container">
        <h2>Mock Interview</h2>
        <p>Your webcam, transcript, and interview UI will go here.</p>
      </div>
    </section>
  );
}
