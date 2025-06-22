import React from "react";
import "./InterviewPage.css";
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';


const STATE_MACHINE = "State Machine 1"; // Adjust if your state machine name is different

export default function InterviewPage() {
  const { rive, RiveComponent } = useRive({
    src: "/steve.riv",             // Path to your Rive file
    stateMachines: STATE_MACHINE,
    autoplay: true,
  });

  const smileToggle = useStateMachineInput(rive, STATE_MACHINE, "smileToggle");

  return (
    <div className="interview-wrapper">
      <div className="interview-container">
        <div className="user-recording">
          <h2>User Recording View</h2>
          <p>Camera feed will appear here.</p>
        </div>
        <div className="ai-avatar">
          <p>🤖 AI Avatar</p>
        </div>
      </div>
    </div>
  );
}