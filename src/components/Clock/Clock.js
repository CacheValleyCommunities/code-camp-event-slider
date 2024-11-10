import React, { useState, useEffect } from "react";
import "./Clock.css";
import moment from "moment";

function Clock({ fontColor }) {
  const [time, setTime] = useState(moment());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(moment());
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div>
      <div className="countdown-container">
        <div className="countdown" font-color={fontColor}>
          <span>{time.format("hh:mm A").toLowerCase()}</span>
        </div>
      </div>
    </div>
  );
}

export default Clock;
