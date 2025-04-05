import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

interface Message {
  username: string;
  text: string;
}

interface ChatRoom {
  messages: Message[];
}

const chatRooms: Record<string, ChatRoom> = {};

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {},
});

const PORT = process.env.PORT || 4000;

app.use(cors());

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("joinRoom", (data) => {
    const { username, room } = data;
    socket.join(room);

    if (!chatRooms[room]) {
      chatRooms[room] = { messages: [] };
    }

    socket.emit("message", {
      username: "System",
      text: `Welcome, ${username}! You joined room: ${room}`,
    });

    socket.to(room).emit("message", {
      username: "System",
      text: `${username} has joined the room.`,
    });
  });

  socket.on("sendMessage", (data) => {
    const { username, room, text } = data;

    if (chatRooms[room]) {
      chatRooms[room].messages.push({ username, text });
    }

    io.to(room).emit("message", { username, text });
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
