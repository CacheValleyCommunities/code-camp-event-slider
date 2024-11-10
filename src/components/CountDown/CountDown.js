import React, { useState, useEffect } from "react";
import "./CountDown.css";
import moment from "moment";

function CountDown({ targetDate, fontColor }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const date = moment(targetDate);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new moment();
      const distance = date - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  return (
    <div>
      <div className="countdown-container">
        <div className="countdown" font-color={fontColor}>
          {timeLeft.hours > 0 && <span>{timeLeft.hours}h </span>}
          {timeLeft.minutes > 0 && <span>{timeLeft.minutes}m </span>}
          <span>{timeLeft.seconds}s</span>
        </div>
      </div>
    </div>
  );
}

export default CountDown;
