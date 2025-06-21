import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeatureSection";
import Footer from "./components/Footer";
import FormPage from "./pages/FormPage";
import LoadingPage from "./pages/LoadingPage";
import InterviewPage from "./pages/InterviewPage";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <main className="container">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <FeaturesSection />
              </>
            }
          />
          <Route path="/form" element={<FormPage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/interview" element={<InterviewPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
