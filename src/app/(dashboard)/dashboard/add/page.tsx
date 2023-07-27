
import AddFriendButton from '@/components/AddFriendButton'
import React from 'react'

export default async function AddPage() {
  
  return (
    <div className='pt-8'>
       <h1 className='font-bold text-3xl mb-8'>Add a friend</h1>
       <AddFriendButton />
    </div>
  )
}
