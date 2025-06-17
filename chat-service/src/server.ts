import express from "express";
import http from "http";
import { Server } from "socket.io";

//Initialize Express
const app = express();
const port = 4000;

app.use(express.static("public"));


//create http server
const server = http.createServer(app);

//Initialize Socket.io server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});


//middleware
app.get("/", (req, res) => {
  res.send("Hello from Express + TypeScript + Socket.IO!");
});

//socket.io event handlers
io.on("connection", (socket) => {
  console.log(`Client contected: ${socket.id}`);
  // Example: listen for message event
  socket.on("message", (msg: string) => {
    console.log(`Received message: ${msg}`);
    
    // broadcast message
    io.emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
