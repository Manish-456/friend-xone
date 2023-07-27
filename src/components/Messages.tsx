"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn, toPusherKey } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import { format } from "date-fns";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";

type Props = {
  initialMessages: Message[];
  sessionId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
  chatId : string;
};

export default function Messages({
  initialMessages,
  sessionId,
  sessionImg,
  chatId,
  chatPartner,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  const formatter = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };



  useEffect(() => {

    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));
    
    const messageHandler = (message: Message) => {
       setMessages(prev => [message, ...prev])
    }
    
   pusherClient.bind('incoming-message', messageHandler);
 
   return () => {
     pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
     pusherClient.unbind('incoming-message', messageHandler);

   }
 }, [chatId])



  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scroll-thumb-rounded scroll-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <div ref={scrollDownRef} />
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;

        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;
        return (
          <div
            key={`${message.id}-${message.timeStamp}`}
            className={`chat-message`}
          >
            <div
              className={cn(`flex items-end`, {
                "justify-end": isCurrentUser,
              })}
            >
              <div
                className={cn(
                  `flex flex-col space-y-2 text-base max-w-xs mx-2`,
                  {
                    "order-1": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                <span
                  className={cn(`px-4 py-2 rounded-lg inline-block`, {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none":
                      !hasNextMessageFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {message.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">
                    {formatter(message.timeStamp)}
                  </span>
                </span>
              </div>

              <div
                className={cn("relative w-8 h-8", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image
                  src={
                    isCurrentUser ? (sessionImg as string) : chatPartner.image
                  }
                  alt={"Profile picture"}
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                  fill
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
