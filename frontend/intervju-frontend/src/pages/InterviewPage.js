import React from "react";
import "./InterviewPage.css";
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';

const STATE_MACHINE = "State Machine 1"; // adjust if your name is different

export default function InterviewPage() {
  const { rive, RiveComponent } = useRive({
      src: "/steve.riv",
      stateMachines: STATE_MACHINE,
      autoplay: true,
    });
  
  const smileToggle = useStateMachineInput(rive, STATE_MACHINE, "smileToggle");
  return (
    <div className="interview-wrapper">
      <div className="interview-box">
        <div className="left-panel">
          <div className="user-recording">
            {/* Placeholder for user's webcam recording */}
            <p>AI Avatar</p>
            <div style={{ textAlign: "center", paddingTop: 50 }}>
              <RiveComponent style={{ width: 400, height: 400 }} />
              <button onClick={() => smileToggle && (smileToggle.value = !smileToggle.value)}>
                Toggle Smile
              </button>
              <div>
                <h1>Interview Question</h1>
                <p>Why do you want to work here?</p>


              </div>
            </div>
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
