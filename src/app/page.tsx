import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import React from 'react'

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <>
    {JSON.stringify(session?.user)}
    </>
  )
}
