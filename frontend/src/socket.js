import { io } from "socket.io-client";

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD
    ? "https://online-polling-api.onrender.com"
    : "http://localhost:3001");

const socket = io(socketUrl, {
  transports: ["websocket", "polling"],
  autoConnect: true,
});

export default socket;
