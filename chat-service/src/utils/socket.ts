import { Server, Socket } from "socket.io";
import http from "http";
import express, { Request } from "express";

const app = express();
const server = http.createServer(app);

interface UserSocketMap {
  [userId: string]: string; // Maps userId to socketId
}

const userSocketMap: UserSocketMap = {};

const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to your frontend URL in production
  },
});

export const getReceiverSocketId = (userId: string): string | undefined => {
  return userSocketMap[userId];
};

io.on("connection", (socket: Socket) => {
  console.log("A user connected:", socket.id);
  const userId = socket.handshake.query.userId as string;
  console.log("User ID from handshake:", userId);
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});


export { io, app, server}