"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

import { SendHorizonal } from "lucide-react";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);


  async function loginWithGoogle() {
    try {
      setIsLoading(true);
      await signIn("google",);
    } catch (error: any) {   
     toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      <div className="flex min-h-full items-center justify-center sm:px-6 lg:px-8 py-12 px-4">
        <div className="w-full flex flex-col items-center max-w-md space-y-8">
          <div className="flex flex-col items-center gap-8 ">
            <SendHorizonal className="h-24 w-24 fill-blue-400   rounded-full  rotate-[270deg] text-white" />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <Button
            isLoading={isLoading}
            onClick={loginWithGoogle}
            type="button"
            className="w-full mx-auto max-w-sm"
          >
            <Icons.google className="h-6 w-6 mr-2" /> Sign in with google
          </Button>
        </div>
      </div>
    </>
  );
}
