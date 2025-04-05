import { useState, useEffect } from "react";
import io from "socket.io-client";

import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { ScrollArea } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";
import { toast } from "sonner";
import { Dices, UserRoundSearch } from "lucide-react";
import {
  uniqueNamesGenerator, adjectives,
  animals,
  names
} from "unique-names-generator";

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
      if (username.length < 2 || username.length > 15) {
        toast.error("Username must be between 3 and 15 characters");
        return;
      }
      if (room.length < 3 || room.length > 20) {
        toast.error("Room ID must be between 3 and 20 characters");
        return;
      }
      socket.emit("joinRoom", { username, room });
      setShowChat(true);
      toast.success(`Welcome to the room ${room}, ${username}!`);
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
    <div>
      {!showChat ? (
        <div className="flex z-10 items-center justify-center md:justify-start ml-28 min-h-screen bg-background p-4">
          <img
            src="/bg.webp"
            alt=""
            className="absolute inset-0 object-center size-full"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/60 to-background" />
          <Card className="w-full scale-105 max-w-md shadow-xl border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl font-bold">
                Join a Chat Room
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 relative">
                <Input
                  type="text"
                  placeholder="Username"
                  className="w-full"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
                <UserRoundSearch
                  className="absolute right-2 top-1 cursor-pointer hover:bg-muted rounded-full px-2 py-1 size-8 active:rotate-12 active:scale-105 transition-all duration-200"
                  onClick={() => {
                    setUsername(
                      uniqueNamesGenerator({
                        dictionaries: [names],
                        length: 1,
                        separator: "-",
                      })
                    );
                    toast.success("Generated Random Username");
                  }}
                />
              </div>
              <div className="space-y-2 relative">
                <Input
                  type="text"
                  placeholder="Room ID"
                  className="w-full"
                  value={room}
                  onChange={(event) => setRoom(event.target.value)}
                />
                <Dices
                  className="absolute right-2 top-1 cursor-pointer hover:bg-muted rounded-full px-2 py-1 size-8 active:rotate-12 active:scale-105 transition-all duration-200"
                  onClick={() => {
                    setRoom(
                      uniqueNamesGenerator({
                        dictionaries: [adjectives, animals],
                        length: 2,
                        separator: "-",
                      })
                    );
                    toast.success("Generated Random Room ID");
                  }}
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
        </div>
      ) : (
        <div>
          <Card className="w-full z-20 max-w-4xl h-[82vh] shadow-lg flex flex-col border-border">
            <CardHeader className="py-3 px-4 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  Room: <span className="font-bold text-primary">{room}</span>
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  Joined as{" "}
                  <span className="font-medium text-foreground underline">
                    {username}
                  </span>
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
        </div>
      )}
    </div>
  );
}

export default App;
