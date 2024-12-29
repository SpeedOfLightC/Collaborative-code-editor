import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useSocket } from "../context/SocketProvider";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const socket = useSocket();

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success("created new room");
  };

  const handleSubmit = useCallback(() => {
    if (!roomId || !username) {
      toast.error("Please fill all the fields");
      return;
    }

    socket.emit("room:join", { roomId, username });
  }, [socket, roomId, username]);

  const handleJoinRoom = useCallback((data) => {
    const { roomId, username, clients } = data;
    if (!roomId || !username) {
      toast.error("Invalid room id or username");
      return;
    }

    toast.success("Joined room successfully");

    navigate(`/editor/${roomId}`, {
      state: {
        username,
        clients
      },
    });
  }, []);

  useEffect(() => {
    socket.on("room:joined", handleJoinRoom);

    return () => {
      socket.off("room:joined", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img
          className="homePageLogo"
          src="/code-sync.png"
          alt="code-sync-logo"
        />
        <h4 className="mainLabel">Paste invitation ROOM ID</h4>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="ROOM ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
          />
          <input
            type="text"
            className="inputBox"
            placeholder="USERNAME"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <button className="btn joinBtn" onClick={handleSubmit}>
            Join
          </button>
          <span className="createInfo">
            If you don't have an invite then create &nbsp;
            <a onClick={createNewRoom} href="" className="createNewBtn">
              new room
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;
