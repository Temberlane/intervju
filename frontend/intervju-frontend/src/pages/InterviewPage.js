import React from "react";
import "./InterviewPage.css";
import { useRive } from '@rive-app/react-canvas';

const STATE_MACHINE = "State Machine 1"; // Adjust if your state machine name is different

export default function InterviewPage() {
  const { RiveComponent } = useRive({
    src: "/steve.riv", // Make sure steve.riv is in your public folder
    stateMachines: STATE_MACHINE,
    autoplay: true,
  });

  return (
    <div className="interview-wrapper">
      <div className="interview-box">
          <div className="ai-avatar">
            {/* Rive Avatar filling the container */}
            <RiveComponent style={{ width: '100%', height: '100%' }} />
            
            <div className="interviewee">
              {/* Placeholder for Interviewee */}
              <p>User Recording</p>
          </div>
        </div>
      </div>
    </div>
  );
}
