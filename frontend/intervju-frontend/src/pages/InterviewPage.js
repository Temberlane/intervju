import React from "react";
import "./InterviewPage.css";
import { useRive } from '@rive-app/react-canvas';
import Webcam from "react-webcam";

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
