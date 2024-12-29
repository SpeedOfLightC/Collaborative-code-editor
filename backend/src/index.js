import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config({
  path: "./.env",
});

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: true,
});

const usernameToSocketIdMap = new Map();
const socketidToUsernameMap = new Map();

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: socketidToUsernameMap.get(socketId),
      };
    }
  );
};

io.on("connection", (socket) => {
  console.log("Socket connected: ", socket.id);
  socket.on("room:join", (data) => {
    const { roomId, username } = data;
    usernameToSocketIdMap.set(username, socket.id);
    socketidToUsernameMap.set(socket.id, username);
    io.to(roomId).emit("user:joined", { username, id: socket.id });
    socket.join(roomId);
    const connectedClients = getAllConnectedClients(roomId);
    // connectedClients.forEach((client) => {
    //   io.to(client.socketId).emit("user:joined", { id: socket.id, username });
    // });
    io.to(socket.id).emit("room:joined", {
      ...data,
      clients: connectedClients,
    });
  });

  socket.on("disconnecting", (reason) => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      io.to(roomId).emit("user:left", {
        id: socket.id,
        username: socketidToUsernameMap.get(socket.id),
      });
    });

    const username = socketidToUsernameMap.get(socket.id);
    usernameToSocketIdMap.delete(username);
    socketidToUsernameMap.delete(socket.id);
    socket.leave();
  });

  socket.on("code-change", ({ roomId, value }) => {
    io.to(roomId).emit("code-change", { value });
  });

  socket.on("room:leave", ({ roomId }) => {
    io.to(roomId).emit("user:left", {
      id: socket.id,
      username: socketidToUsernameMap.get(socket.id),
    });

    const username = socketidToUsernameMap.get(socket.id);
    usernameToSocketIdMap.delete(username);
    socketidToUsernameMap.delete(socket.id);
    socket.leave();
  });

  socket.on("code:sync", ({ to, code }) => {
    io.to(to).emit("code:sync", { code });
  });
});

httpServer.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
