"use client";

import { pusherClient } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';
import axios from 'axios';
import { Check, UserPlus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast';

interface FriendRequestProps {
    incomingFriendRequests : IncomingFriendRequest[];
    sessionId : string;
}

const FriendRequests = ({incomingFriendRequests, sessionId} : FriendRequestProps) => {
   const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
   );

   const [isMounted, setIsMounted] = useState(false);

   

  

   useEffect(() => {
     setIsMounted(true);
     pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));
     
     const friendRequestHandler = ({senderId, senderEmail} : IncomingFriendRequest) => {
        setFriendRequests(prev => [...prev, {senderEmail, senderId}])
    }
    pusherClient.bind('incoming_friend_requests', friendRequestHandler);
  
    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler);

    }
  }, [sessionId])
   const router = useRouter();

   const acceptRequest = async(senderId : string) => {
   try {
    await axios.post('/api/friends/accept', {id : senderId});
    setFriendRequests(prev => prev.filter(request => request.senderId !== senderId));
     router.refresh();
   } catch (error) {
         toast.error(`Something went wrong. Please try again later.`);
   }
   }

   const denyFriend = async(senderId : string) => {
 try {
  await axios.post('/api/friends/deny', {id : senderId});
  setFriendRequests(prev => prev.filter(request => request.senderId !== senderId));
   router.refresh();
 } catch (error) {
  toast.error(`Something went wrong. Please try again later.`);
 }
   }

 if(!isMounted) return null;
    return (
    <>
    {friendRequests?.length === 0 ? (<p className='text-zinc-500 text-sm'>
        Nothing to show here...
    </p>) : (<>
    {
        friendRequests.map(request => (
            <div key={request.senderId} className='flex gap-4 items-center'>
                 <UserPlus className='text-black' />
                 <p className='font-medium text-lg'>{request.senderEmail}</p>
                 <button onClick={() => acceptRequest(request.senderId)} aria-label='accept friend' className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md'>
                    <Check className='font-semibold text-white w-3/4 h-3/4' />
                    </button>
                 <button aria-label='accept friend' onClick={() => denyFriend(request.senderId)} className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md'>
                    <X className='font-semibold text-white w-3/4 h-3/4' />
                    </button>
   
            </div>
        ))
    }
    </>)}
    </>
  )
}

export default FriendRequests