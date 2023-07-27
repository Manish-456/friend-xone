"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { addFriendValidator } from "@/lib/validations/add-friend";
import axios, { AxiosError } from "axios";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type FormData = z.infer<typeof addFriendValidator>;

export default function AddFriendButton() {
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),

  });

  const addFriend = async (email: string) => {
    try {
      setIsLoading(true);
      const validatedEmail = addFriendValidator.parse({ email });
      await axios.post("/api/friends/add", { email: validatedEmail });
      setShowSuccessState(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError("email", { message: error.message });
        return;
      }
      if (error instanceof AxiosError) {
        setError("email", { message: error.response?.data });
        return;
      }

      setError("email", {
        message: "Something went wrong",
      });
    }finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  };
  return (
    <form className="max-w-sm" onSubmit={handleSubmit(onSubmit)}>
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Add friend by E-Mail
      </label>
      <div className="mt-2 flex gap-4">
        <input
          {...register("email")}
          type="text"
          className="block w-full pl-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
          placeholder="you@example.com"
        />
        <Button type="submit" isLoading={isLoading}>Add</Button>
      </div>
      <p className="mt-1 text-red-600 text-sm">{errors.email?.message}</p>
      {showSuccessState &&  <p className="mt-1 text-green-600 text-sm">Friend request sent!</p>}
    </form>
  );
}
