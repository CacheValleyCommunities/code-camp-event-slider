import { io } from "socket.io-client";

class SocketHelper {
  constructor() {
    if (!SocketHelper.instance) {
      this.socket = null;
      this.isConnecting = false;
      this.connectionPromise = null;
      SocketHelper.instance = this;
    }
    return SocketHelper.instance;
  }

  connect(url, authToken) {
    if (this.socket) {
      return Promise.resolve(this.socket); // Return existing socket if already connected
    }

    if (this.isConnecting) {
      return this.connectionPromise; // Return the existing connection promise
    }

    this.isConnecting = true;

    this.connectionPromise = new Promise((resolve, reject) => {
      this.socket = io(url, {
        auth: { token: authToken },
        transports: ["websocket"],
      });

      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket.id);
        this.isConnecting = false; // Reset connecting flag
        resolve(this.socket); // Resolve promise with the socket instance
      });

      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      this.socket.on("connect_error", (error) => {
        this.isConnecting = false; // Reset connecting flag
        reject(error); // Reject promise on error
      });
    });

    return this.connectionPromise;
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

const websocket = new SocketHelper();
export default websocket;
