import { Socket } from "socket.io";
import { createRoom, findUserRooms, joinRoom } from "./helpers/socket";
import { Character, IRoom, Message } from "./models/models";
import { Server } from "socket.io";

const express = require("express");
const cors = require("cors");
const http = require("http");

const app = express();

export const server = http.createServer(app);

app.use(cors());

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const userRooms: Set<IRoom> = new Set(); //maliable instances of rooms

io.on("connection", (socket: Socket) => {
  socket.on("send_message", (data: Message) => {
    socket.to("room1").emit("received_message", data.message);
  });

  socket.on("set_active_player", (data: IRoom) => {
    socket.emit("set_index", data.users);
  });

  socket.on("load_all_rooms", () => {
    const activeUserRooms = findUserRooms();

    const filteredArray = activeUserRooms.map((x) => {
      const id = x[0];
      const numUsers = x[1].size;
      return { id, users: numUsers };
    });

    socket.emit("display_all_rooms", filteredArray);
  });

  socket.on("increment_turn", (data: IRoom) => {
    data.turnIndex++;

    io.to(data.id).emit("update_turn", data);
  });

  socket.on(
    "chosen_card",
    ({ character, roomId }: { character: Character; roomId: string }) => {
      socket.to(roomId).emit("received_enemy_card", character);
    }
  );

  socket.on("join_room", () => {
    joinRoom(socket, userRooms);
  });

  socket.on("load_random_character", () => {});

  socket.on("create_room", (roomId: string) => {
    createRoom(socket, roomId, userRooms);
  });

  socket.on("attack", (data) => {
    io.to(data.room.id).emit("attacking_hit", data);
  });

  socket.on("win", () => {
    socket.emit("winning_alert");
  });
  socket.on("loss", () => {
    socket.emit("losing_alert");
  });

  socket.on("game_over", (data) => {
    io.socketsLeave(data.id);
    console.log(data);
    io.to(data.id).emit("leave_room");

    const arrayRooms = Array.from(userRooms);
    const room = arrayRooms.find((userRoom) => data.id === userRoom.id);
    room && userRooms.delete(room);
  });
});

const PORT = process.env.PORT || 80;

server.listen(PORT, console.log(`Server is running on port ${PORT}`));
