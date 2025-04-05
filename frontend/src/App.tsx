import { useState, useEffect } from "react";
import io from "socket.io-client";

// Import Shadcn components
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { ScrollArea } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";

const socket = io("http://localhost:4000");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState<
    { username: string; text: string; room: string }[]
  >([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
    };
  }, []);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("joinRoom", { username, room });
      setShowChat(true);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message !== "") {
      const messageData = {
        room: room,
        username: username,
        text: message,
      };

      await socket.emit("sendMessage", messageData);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      {!showChat ? (
        <Card className="w-full max-w-md shadow-xl border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold">
              Join a Chat Room
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Username"
                className="w-full"
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Room ID"
                className="w-full"
                onChange={(event) => setRoom(event.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={joinRoom}
              disabled={!username || !room}
            >
              Join Room
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-4xl h-[80vh] shadow-lg flex flex-col border-border">
          <CardHeader className="py-3 px-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                Room: <span className="font-bold text-primary">{room}</span>
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                Joined as{" "}
                <span className="font-medium text-foreground">{username}</span>
              </span>
            </div>
          </CardHeader>

          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {messageList.map((messageContent, index) => {
                const isCurrentUser = username === messageContent.username;
                return (
                  <div
                    key={index}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        isCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="break-words">{messageContent.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground/80"
                        }`}
                      >
                        {messageContent.username}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <Separator className="my-0" />

          <div className="p-4">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button type="submit" disabled={!message}>
                Send
              </Button>
            </form>
          </div>
        </Card>
      )}
    </div>
  );
}

export default App;
