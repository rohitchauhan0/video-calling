"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid"; // Install this package using: npm install uuid

const Page = () => {
  const router = useRouter();

  const handleCreateRoom = () => {
    const roomId = uuidv4(); // Generate a unique room ID
    router.push(`/room/${roomId}`); // Redirect to the room page
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Video Calling App</h1>
      <button
        onClick={handleCreateRoom}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
      >
        Create a Room
      </button>
    </div>
  );
};

export default Page;
