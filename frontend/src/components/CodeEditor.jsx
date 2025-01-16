import React, { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { useSocket } from "../context/SocketProvider";

const CodeEditor = ({ room, language }) => {
  const socket = useSocket();
  const [editorValue, setEditorValue] = useState(null);

  const handleEditorChange = (value) => {
    setEditorValue(value);
    socket.emit("code-change", { roomId: room, value });
  };

  const handleCodeChange = useCallback(
    ({ value }) => {
      setEditorValue(value);
    },
    [setEditorValue]
  );

  useEffect(() => {
    socket.on("code-change", handleCodeChange);

    return () => {
      socket.off("code-change", handleCodeChange);
    };
  }, [socket, handleCodeChange]);

  return (
    <div>
      <Editor
        height="100vh"
        theme="vs-dark"
        defaultLanguage="javascript"
        defaultValue="// Your code goes here"
        language={language ?? "javascript"}
        value={editorValue}
        onChange={handleEditorChange}
      />
    </div>
  );
};

export default CodeEditor;
