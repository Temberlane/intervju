import React, { useState } from "react";

function TTSButton({ text, generateNew = false }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumePath: "Resume.pdf",
          jobInfoPath: "Ciena_Embedded_Software_Internship.txt",
          minutes: 30
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        // Extract the first question and speak it
        const firstQuestion = data.questions[0].question;
        await handleSpeakText(firstQuestion);
      } else {
        throw new Error('No questions received');
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      alert("Error generating question");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakText = async (textToSpeak) => {
    const res = await fetch("http://localhost:8000/speak", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: textToSpeak }),
    });

    if (!res.ok) {
      alert("Error generating speech");
      return;
    }

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  };
  
  const handleSpeak = async () => {
    if (generateNew) {
      await fetchQuestion();
    } else {
      await handleSpeakText(text);
    }
  };

  return (
    <button onClick={handleSpeak} disabled={isLoading}>
      {isLoading ? "Loading..." : "🔊 Speak"}
    </button>
  );
}

export default TTSButton;