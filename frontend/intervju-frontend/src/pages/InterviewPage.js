import React from "react";
import "./InterviewPage.css";

export default function InterviewPage() {
  return (
    <div className="interview-wrapper">
      <div className="interview-box">
        <div className="left-panel">
          <div className="user-recording">
            {/* Placeholder for user's webcam recording */}
            <p>AI Avatar</p>

            <div className="ai-avatar">
              {/* Placeholder for AI Avatar */}
              <p>User Recording</p>
            </div>
          </div>
        </div>

        <div className="right-panel">
          {/* Placeholder for transcript/chat */}
          <h3>Transcript</h3>
          <p>Interview chat messages will appear here.</p>
        </div>
      </div>
    </div>
  );
}
