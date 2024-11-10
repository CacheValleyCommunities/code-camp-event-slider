import "./AppFrame.css";
import TopBar from "./components/TopBar/TopBar";
import BottomBar from "./components/BottomBar/BottomBar";
import Canvas from "./components/Canvas/Canvas";

import client from "socket.io-client";
import { useEffect } from "react";

function AppFrame() {

  useEffect(() => {
    const websocket = window.checkIfAPITargetIsPresent();

    const socket = client(websocket);

    socket.on("connect", () => {
      console.log("Connected to the socket API.");

      socket.on("video:start", () => {
        alert("video Starting");
      });
    });
  });
  
  return (
    <>
      <TopBar />
      <Canvas />
      <BottomBar />
    </>
  );
}

export default AppFrame;
