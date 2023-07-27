"use client";

import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import UnseenChatToast from "./UnseenChatToast";

type Props = {
  friends: User[];
  sessionId: string;
};

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

export default function SidebarChatList({ friends, sessionId }: Props) {
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const [activeChats, setActiveChats] = useState<User[]>(friends);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));
   
    const newFriendHandler = (newFriend : User) => {
      setActiveChats(prev => [...prev, newFriend])
    };

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;

      if (!shouldNotify) return;

      // should be notified
      toast.custom((t) => (
        // custom component
        <UnseenChatToast
          t={t}
          sessionId={sessionId}
          senderId={message.senderId}
          senderImage={message.senderImg}
          senderName={message.senderName}
          senderMessage={message.text}
        />
      ));

      setUnseenMessages((prev) => [...prev, message]);
    };

    pusherClient.bind(`new_message`, chatHandler);
    pusherClient.bind(`new_friend`, newFriendHandler);
    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));

      pusherClient.unbind(`new_message`, chatHandler);
      pusherClient.unbind(`new_friend`, newFriendHandler);
    };
  }, [pathname, sessionId, router]);

  useEffect(() => {
    if (pathname.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);
  return (
    <>
      <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
        {activeChats.sort().map((friend) => {
          const unseenMessagesCount = unseenMessages.filter(
            (unseenMsg) => unseenMsg.senderId === friend.id
          ).length;
          return (
            <>
              <li key={friend.id}>
                <a
                  href={`/dashboard/chat/${chatHrefConstructor(
                    sessionId,
                    friend.id
                  )}`}
                  className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                >
                  {friend.name}
                  {unseenMessagesCount > 0 ? (
                    <div className="bg-indigo-600 font-medium text-xs w-4 h-4 rounded-full text-white flex items-center justify-center">
                      {unseenMessagesCount}
                    </div>
                  ) : null}
                </a>
              </li>
            </>
          );
        })}
      </ul>
    </>
  );
}
