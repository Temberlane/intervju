import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoadingPage.css"; // we'll style it separately

export default function LoadingPage() {
  const navigate = useNavigate();

  // Automatically redirect after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/interview"); // Change this once your next page is ready
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <section className="loading-wrapper">
      <div className="spinner" />
      <h2>Thanks for submitting!</h2>
      <p className="loading-text">
        Generating your personalized interview questions... Please wait.
      </p>
    </section>
  );
}

