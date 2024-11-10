import "./TopBar.css";

import CountDown from "./../CountDown/CountDown";
import Clock from "./../Clock/Clock";
import { useState, useEffect } from "react";
import websocket from "../../helpers/websocket";

function TopBar() {

  const [qrCode, setQrCode] = useState("qr-code");

  // connect to socket and listen for qr code changes
  useEffect(() => {
    console.log("Connecting to the socket API.");

    websocket.connect(process.env.SOCKET_API || "ws://localhost:3001").then((socket) => {
      console.log("Connected to the socket API.", socket);
      socket.on("qr-code", (data) => {
        console.log("QR Code Updated with data: ", data);
        setQrCode(data);
      });
    });
  }, []);

  return (
    <div className="top-bar">
      <CountDown targetDate="2024-11-15 08:00:00" />
      <Clock />
      <div className={qrCode}>
        <img
          src="https://event-slider.vercel.app/frame.png"
          alt="Event Signup QR Code"
        />

        <div className="qr-code-overlay">
          <p>Judging Registration</p>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
