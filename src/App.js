import "./App.css";
import AppFrame from "./AppFrame";
import { useEffect, useState } from "react";
import CountDown from "./components/CountDown/CountDown";
import Clock from "./components/Clock/Clock";

function App() {

  const [shouldRenderFrame, setShouldRenderFrame] = useState(true);

  setInterval(() => {
    setShouldRenderFrame(!shouldRenderFrame);

    document.body.style.backgroundColor = shouldRenderFrame ? 'white' : 'black';
  }, 1000 * 30); // 30 minutes

  return (
    <>
      <div className={shouldRenderFrame ? 'App' : 'App white'}>
        <AppFrame className={!shouldRenderFrame ? 'fade-out' : 'fade-in'} />
      </div>

      <div className="hidden-clock-and-timer">
        <CountDown fontColor="black" targetDate="2024-11-15 08:00:00" />
        <Clock fontColor="black" />
      </div>
    </>
  );
}

export default App;
