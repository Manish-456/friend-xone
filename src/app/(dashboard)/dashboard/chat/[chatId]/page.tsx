import ChatInput from "@/components/ChatInput";
import Messages from "@/components/Messages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/lib/db";
import { messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

interface SingleChatProps {
  params: {
    chatId: string;
  };
}

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );
    const dbMessages = results.map((result) => JSON.parse(result) as Message);

    const reversedDbMessages = dbMessages.reverse();

    const messages = messageArrayValidator.parse(reversedDbMessages);

    return messages;
  } catch (error) {
    notFound();
  }
}

export default async function SingleChatPage({ params }: SingleChatProps) {

  const { chatId } = params;
  const session = await getServerSession(authOptions);

  if (!session) notFound();

  const { user } = session;

  const [userId1, userId2] = chatId.split("--");

  if (user.id !== userId1 && user.id !== userId2) {
    notFound();
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User;
  const initialMessage = await getChatMessages(chatId);

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                src={chatPartner.image}
                className="rounded-full"
                fill
                referrerPolicy="no-referrer"
                alt={`${chatPartner.name} profile picture`}
              />
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {chatPartner.email}
            </div>
          </div>
        </div>
      </div>
      <Messages sessionImg={session.user.image} chatId={chatId} chatPartner={chatPartner} initialMessages={initialMessage} sessionId={session.user.id}/>
      <ChatInput chatPartner={chatPartner} chatId={chatId}/>
    </div>
  );
}
