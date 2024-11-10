import Alert from "../Alert/Alert";
import "./BottomBar.css";

import websocket from "../../helpers/websocket";
import { useEffect, useState } from "react";

function BottomBar() {

  const PLAY_STATUS = {
    PLAYING: "playing",
    PAUSED: "paused",
    STOPPED: "stopped",
  }

  const [playStatus, setPlayStatus] = useState(PLAY_STATUS.STOPPED);
  const [videoSrc, setVideoSrc] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [audioPlayStatus, setAudioPlayStatus] = useState(PLAY_STATUS.STOPPED);

  const [alertBar, setAlertBar] = useState({ type: "", message: "" });

  useEffect(() => {
    console.log("Connecting to the socket API.");
    websocket.connect("ws://localhost:8080").then((socket) => {
      console.log("Connected to the socket API.", socket);
      socket.on("video:start", (data) => {
        console.log("Video Starting with data: ", data);
        setVideoSrc(data.url);
        setPlayStatus(PLAY_STATUS.PLAYING);
      });

      socket.on("video:stop", () => {
        console.log("Video Stopping");
        setPlayStatus(PLAY_STATUS.STOPPED);
      });

      socket.on("alert:set", (data) => {
        console.log("Setting Alert with data: ", data);
        setAlertBar(data);
      })

      socket.on("video:pause", () => {
        console.log("Video Pausing");
        setPlayStatus(PLAY_STATUS.PAUSED);

        const videoPlayer = document.getElementById("video-player");
        videoPlayer.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      });

      socket.on("video:resume", () => {
        console.log("Video Resuming");
        setPlayStatus(PLAY_STATUS.PLAYING);

        const videoPlayer = document.getElementById("video-player");
        videoPlayer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      });

      // audio is just the video but hidden
      socket.on("audio:start", (data) => {
        console.log("Audio Starting with data: ", data);
        setAudioSrc(data.url);
        setAudioPlayStatus(PLAY_STATUS.PLAYING);
      })

      socket.on("audio:stop", () => {
        console.log("Audio Stopping");
        setAudioPlayStatus(PLAY_STATUS.STOPPED);
      });
    });
  });

return (
    <>
      {playStatus === PLAY_STATUS.PLAYING && (
        <div className="video-player">
          <div className="video-player__content">
            <iframe id="video-player" src={videoSrc + "?autoplay=1"} title="CodeCamp Video" />
          </div>
        </div>
      )}

      {audioPlayStatus === PLAY_STATUS.PLAYING && (
        <div className="audio-player">
          <div className="audio-player__content">
            <iframe id="audio-player" src={audioSrc + "&autoplay=1"} title="CodeCamp Audio" />
          </div>
        </div>
      )}

      <div className="bottom-bar">
        <div>
          <img
            src="https://southernutahcodecamp.com/wp-content/uploads/2018/09/codecamp_white.svg"
            alt="CodeCamp Logo"
          />
        </div>
        <div>
        {alertBar.message !== "" && (<Alert
          type={alertBar.type}
          message={alertBar.message}
        />)}
        </div>
      </div>
    </>
  )
}

export default BottomBar;
