import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

window.checkIfAPITargetIsPresent = () => {
  let res = window.localStorage.getItem('api-target');

  if (res === null) {
    if (process.env.SOCKET_API) {
      window.localStorage.setItem('api-target', process.env.SOCKET_API);
    } else {
      let promptres = prompt('Please enter the API target:', 'ws://localhost:3001');
      window.localStorage.setItem('api-target', promptres);
    }
  }

  return window.localStorage.getItem('api-target');
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
