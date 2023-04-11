import { Socket } from "socket.io";
import { Character, IRoom } from "../models/models";

import { v4 } from "uuid";
import { random10FromArray } from "./math";
import { io } from "..";

const characters = require("../data/characters.json");

export function findUserRooms() {
  const allRooms = Array.from(io.sockets.adapter.rooms);
  const userRooms = allRooms.filter((room) => room[0].startsWith("id_"));

  return userRooms;
}

export function createRoom(
  socket: Socket,
  roomId: string,
  userRooms: Set<IRoom>
) {
  const room: IRoom = { id: roomId, turnIndex: 1, users: 1 };
  userRooms.add(room);
  socket.join(roomId);
  socket.emit("room_created", room);
}

export function joinRoom(socket: Socket, userRooms: Set<IRoom>, data: string) {
  const activeUserRooms = findUserRooms();

  if (activeUserRooms.length === 0) {
    const roomId = `id_${v4()}`;
    createRoom(socket, roomId, userRooms);
    return;
  }

  const room = activeUserRooms.find((room) => room[1].size < 2);

  if (room) {
    const id = data ? data : room[0];
    const roomModal: IRoom = [...userRooms].find((set) => set.id === id)!;

    if (io.sockets.adapter.rooms.get(id)) {
      roomModal.users = io.sockets.adapter.rooms.get(id)!.size + 1;
    } else {
      roomModal.users = 2;
      // QUICK FIX = better to get live io.socket.adaptar.room.size
    }

    socket.join(id);
    socket.to(id).emit("user_joined_room", {
      room: roomModal,
      player: { userName: socket.id },
    });

    socket.emit("joined", roomModal);
    loadRandomCharacters(id);
  }
}

export function loadRandomCharacters(roomId: string) {
  const randomCharacters = random10FromArray(characters);
  io.to(roomId).emit("random_characters", randomCharacters);
}
