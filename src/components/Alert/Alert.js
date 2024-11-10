import React, { useEffect } from "react";
import "./Alert.css";

function Alert({ type, message, expiration }) {
  useEffect(() => {
    if (expiration) {
      const timer = setTimeout(() => {
        // Add functionality to remove or hide the alert after expiration
        console.log("Alert expired");
      }, expiration);

      return () => clearTimeout(timer);
    }
  }, [expiration]);

  const getIcon = () => {
    switch (type) {
      case "warning":
        return "fa-exclamation-triangle";
      case "info":
        return "fa-info-circle";
      case "error":
        return "fa-times-circle";
      case "success":
        return "fa-check-circle";
      default:
        return "";
    }
  };

  const alertClass = `alert alert-${type}`;

  return (
    <div className={alertClass}>
      <div className="icon">
        <i className={`fas ${getIcon()}`}></i>
      </div>
      <div>{message}</div>
    </div>
  );
}

export default Alert;
