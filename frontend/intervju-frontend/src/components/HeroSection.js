import React from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSection({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <h1>Intervju: Your AI Interview Coach</h1>
      <p>
        Practice, prepare, and ace your next interview with personalized AI feedback and mock sessions.
      </p>
      <button
        className="btn-primary"
        onClick={() => navigate("/form")}
      >
        Try it now
      </button>
      <button
        onClick={toggleDarkMode}
        style={{
          marginTop: "1.5rem",
          backgroundColor: "transparent",
          border: "1px solid currentColor",
          padding: "0.5rem 1rem",
          borderRadius: "0.5rem",
          cursor: "pointer",
        }}
      >
        {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      </button>
    </section>
  );
}
