import { refresh } from "./apiRequest.js";

class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.listeners = new Map(); // Map of event types to listener arrays
    this.socketOpenpPomise = null;
  }

  async connect() {
    if (this.socket) {
      // console.log("WebSocket is already connected.");
      return this.socketOpenpRomise;
    }
    let accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      accessToken = await refresh();
    }

    this.socket = new WebSocket(`${this.url}?token=${accessToken}`);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // console.log("Received message:", data);
      this.notifyListeners(data.type, data);
    };

    this.socket.onclose = () => {
      // console.log("WebSocket disconnected.");
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.socketOpenpRomise = new Promise((resolve, reject) => {
      this.socket.onopen = () => {
        // console.log("WebSocket connected.");
        resolve();
      };
    });
    return this.socketOpenpRomise;
  }

  close() {
    if (this.socket) {
      this.socket.onmessage = null; // Remove message handler
      this.socket.onclose = null; // Remove close handler
      this.socket.onerror = null; // Remove error handler
      this.socket.close(); // Close the socket
      this.socket = null; // Reset the socket reference
    }
  }

  notifyListeners(eventType, data) {
    const listeners = this.listeners.get(eventType) || [];
    // console.log(
    //   `Notifying ${listeners.length} listeners for event: ${eventType}`
    // );

    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (err) {
        console.error("Error in WebSocket listener:", err);
      }
    });
  }
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
    // console.log(
    //   `Subscribed to ${eventType}. Total listeners: ${
    //     this.listeners.get(eventType).length
    //   }`
    // );
  }

  unsubscribe(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const listeners = this.listeners.get(eventType);
      // console.log(
      //   `Before unsubscribe: ${listeners.length} listeners for event: ${eventType}`
      // );
      const updatedListeners = listeners.filter(
        (listener) => listener !== callback
      );
      // console.log(
      //   `After unsubscribe: ${updatedListeners.length} listeners for event: ${eventType}`
      // );
      this.listeners.set(eventType, updatedListeners);
    } else {
      console.log(`No listeners found for event: ${eventType}`);
    }
  }
}

const chatWebSocketManager = new WebSocketManager(
  "wss://localhost:8443/manage/ws/chat/"
);

const tournamentWebSocketManager = new WebSocketManager(
  "wss://localhost:8443/manage/ws/tournament/"
);

export { chatWebSocketManager, tournamentWebSocketManager };
