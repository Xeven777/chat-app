import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { ScrollArea } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";
import { toast } from "sonner";
import { Copy, Dices, UserRoundSearch } from "lucide-react";
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  names,
} from "unique-names-generator";

const dev = !true; // i change it according to my mood btw
const prodUrl = "https://chat-app-w6y9.onrender.com";

// const prodUrl2 =
//   "https://chat-app-backend-env.eba-cmgmgdew.ap-south-1.elasticbeanstalk.com";

const socket = io(dev ? "http://localhost:4000" : prodUrl);

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState<
    { username: string; text: string; room: string }[]
  >([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messageList]);

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
        <div className="flex z-10 items-center justify-center md:justify-start md:ml-28 min-h-screen bg-background p-4">
          <img
            src="/bg.webp"
            alt=""
            className="absolute inset-0 object-center object-cover size-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent via-background/60 to-background" />
          <Card className="w-full md:scale-105 max-w-md shadow-xl border-border">
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
                <Copy
                  className="absolute right-9 top-1 cursor-pointer hover:bg-muted rounded-full px-2 py-1 size-8 active:scale-105 transition-all duration-200"
                  onClick={() => {
                    navigator.clipboard.writeText(room);
                    toast.info("Copied");
                  }}
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
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <img
            src="/bg.webp"
            alt=""
            className="absolute inset-0 object-center size-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-background/25 to-background" />
          <Card className="w-full backdrop-blur-2xl z-20 max-w-4xl h-[92vh] lg:h-[82vh] shadow-2xl flex flex-col border-border">
            <CardHeader className="py-3 px-4 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex gap-2">
                  Room: <span className="font-bold text-primary">{room}</span>
                  <Copy
                    className="size-5 mt-1 hover:opacity-90 cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(room);
                      toast.info("Copied");
                    }}
                  />
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  Joined as{" "}
                  <span className="font-medium text-foreground underline">
                    {username}
                  </span>
                </span>
              </div>
            </CardHeader>

            <ScrollArea
              ref={scrollAreaRef}
              className="flex-grow p-4 pb-2 overflow-hidden"
              type="always"
            >
              <div className="space-y-5 pb-1">
                {messageList.length === 0 && (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-muted-foreground text-sm">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                )}

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
                        className={`max-w-4/5 rounded-2xl px-4 py-2.5 ${
                          isCurrentUser
                            ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                            : "bg-muted text-muted-foreground rounded-tl-none shadow-sm"
                        }`}
                      >
                        <p className="break-words text-sm md:text-base">
                          {messageContent.text}
                        </p>
                        <p
                          className={`text-[10px] md:text-xs opacity-80 mt-1 ${
                            isCurrentUser
                              ? "text-primary-foreground/80 text-end"
                              : "text-muted-foreground/80 text-start"
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
