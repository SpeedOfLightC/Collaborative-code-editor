import React, { useCallback, useEffect, useRef, useState } from "react";
import * as Avatar from "@radix-ui/react-avatar";
import CodeEditor from "../components/CodeEditor";
import { useLocation, useNavigate, useParams } from "react-router";
import { useSocket } from "../context/SocketProvider";
import toast from "react-hot-toast";

const options = ["javascript", "html", "css", "cpp", "c", "python", "java"];

const EditorPage = () => {
  const [clientsList, setClientsList] = useState([]);
  const [remoteSocketID, setRemoteSocketID] = useState(null);
  const [language, setLanguage] = useState("");
  const { roomId } = useParams();
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { clients } = location.state;
    setClientsList(clients);
  }, [setClientsList]);

  const handleUserJoined = useCallback(
    ({ username, id }) => {
      setRemoteSocketID(id);
      toast(`${username} joined the room`);
      setClientsList((prev) => [...prev, { username, socketId: id }]);
    },
    [setRemoteSocketID, setClientsList]
  );

  const handleUserLeft = useCallback(
    ({ id, username }) => {
      setRemoteSocketID(null);
      toast(`${username} left the room`);
      setClientsList((prev) => prev.filter((client) => client.socketId !== id));
    },
    [setClientsList, setRemoteSocketID]
  );

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("user:left", handleUserLeft);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("user:left", handleUserLeft);
    };
  }, [socket, handleUserJoined, handleUserLeft]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied to clipboard");
  };

  const handleRoomLeave = useCallback(() => {
    socket.emit("room:leave", { roomId });
    navigate("/");
  }, [socket]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="language-options">
            <select onChange={handleLanguageChange}>
              {options.map((option, index) => {
                return <option key={index}>{option}</option>;
              })}
            </select>
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clientsList &&
              clientsList.map((client, index) => (
                <div className="client" key={client.socketId}>
                  <Avatar.Root className="AvatarRoot">
                    <Avatar.Fallback className="AvatarFallback">
                      {client.username[0].toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <span className="userName">{client.username}</span>
                </div>
              ))}
          </div>
        </div>

        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={handleRoomLeave}>
          Leave
        </button>
      </div>
      <div className="editorWrap">
        <CodeEditor room={roomId} language={language} />
      </div>
    </div>
  );
};

export default EditorPage;
