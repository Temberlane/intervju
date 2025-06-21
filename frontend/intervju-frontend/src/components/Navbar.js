import React from "react";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <a href="/" className="navbar-logo">Intervju</a>
      </div>
      <div className="navbar-right">
        <a href="/login" className="navbar-link">Login</a>
        <a href="/signup" className="navbar-button">Sign Up</a>
      </div>
    </nav>
  );
}
