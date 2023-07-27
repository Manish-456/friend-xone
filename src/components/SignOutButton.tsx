"use client";

import React, { useState } from 'react'
import { Button } from './ui/button';
import { signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Loader2, LogOut } from 'lucide-react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
}

export default function SignOutButton({...props}: Props) {
    const [isSigningOut, setIsSigningOut] =useState(false);

  return (
    <Button onClick={async() => {
        setIsSigningOut(true);
        try {
         await signOut();            
        } catch (error) {
            toast.error(`There was a problem signing out.`)
        }finally{
            setIsSigningOut(false);
        }
    }} variant={"ghost"} {...props}>
 {isSigningOut ? <Loader2 className='animate-spin h-4 w-4' /> : (
    <LogOut className='w-4 h-4'/>
 )}
    </Button>
  )
}