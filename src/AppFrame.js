import "./AppFrame.css";
import TopBar from "./components/TopBar/TopBar";
import BottomBar from "./components/BottomBar/BottomBar";
import Canvas from "./components/Canvas/Canvas";

function AppFrame() {

  return (
    <>
      <TopBar />
      <Canvas />
      <BottomBar />
    </>
  );
}

export default AppFrame;
