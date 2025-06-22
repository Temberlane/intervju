import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import TTSButton from "../../../frontend/intervju-frontend/src/components/TTSButton";

const STATE_MACHINE = "State Machine 1"; // adjust if your name is different

function App() {
  const { rive, RiveComponent } = useRive({
    src: "/steve.riv",
    stateMachines: STATE_MACHINE,
    autoplay: true,
  });

  const smileToggle = useStateMachineInput(rive, STATE_MACHINE, "smileToggle");

  return (
    <div style={{ textAlign: "center", paddingTop: 50 }}>
      <RiveComponent style={{ width: 400, height: 400 }} />
      <button onClick={() => smileToggle && (smileToggle.value = !smileToggle.value)}>
        Toggle Smile
      </button>
      <div>
        <h1>Interview Question</h1>
        <p>Why do you want to work here?</p>

<TTSButton text="Why do you want to work here?" />  {/* Uses provided text */}
<TTSButton generateNew={true} />  {/* Generates and speaks a new question */}
      </div>
    </div>
    
  );
}

export default App;
