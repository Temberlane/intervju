import React from "react";
import "./InterviewPage.css";
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import Webcam from "react-webcam";
import TTSButton from "../components/TTSButton";

const STATE_MACHINE = "State Machine 1"; // Adjust if your state machine name is different

export default function InterviewPage() {
  const { rive, RiveComponent } = useRive({
    src: "/steve.riv", // Make sure steve.riv is in your public folder
    stateMachines: STATE_MACHINE,
    autoplay: true,
  });

  const smileToggle = useStateMachineInput(rive, STATE_MACHINE, "smileToggle");

  return (
    <div className="interview-wrapper">
      <div className="interview-box">
          <div className="ai-avatar">
            {/* Rive Avatar filling the container */}
            <RiveComponent style={{ width: '100%', height: '100%' }} />
            
            {/* Control buttons positioned over the avatar */}
            <div className="avatar-controls">
              <button 
                className="smile-toggle-btn"
                onClick={() => smileToggle && (smileToggle.value = !smileToggle.value)}
              >
                😊 Toggle Smile
              </button>
              
              <div className="question-controls">
                <h3>Interview Questions</h3>
                <TTSButton text="Why do you want to work here?" />
                <TTSButton generateNew={true} />
              </div>
            </div>
            
            <div className="interviewee">
              {/* Webcam for User Recording */}
              <Webcam
                audio={false}
                height="100%"
                width="100%"
                style={{
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "user"
                }}
              />
            </div>
        </div>
      </div>
    </div>
  );
}
