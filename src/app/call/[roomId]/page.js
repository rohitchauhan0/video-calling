"use client";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation"; // Import useRouter hook
import SimplePeer from "simple-peer";

const Page = ({ params }) => {
  const socket = useMemo(() => io("http://localhost:3002"), []);
  const [myId, setMyId] = useState("");
  const [callId, setCallId] = useState("");
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);

  const myVideo = useRef();
  const userVideo = useRef();

  const router = useRouter(); // Get the router object
  const { roomId } = params; // Access roomId from URL params

  // Get user media (video & audio)
  const getMedia = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setStream(mediaStream);
    myVideo.current.srcObject = mediaStream;
  };

  useEffect(() => {
    // Establish the socket connection
    socket.on("connect", () => {
      setMyId(socket.id);
    });

    // Listen for incoming calls
    socket.on("receive-call", ({ offer, from }) => {
      const incomingPeer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream,
      });

      incomingPeer.signal(offer);

      incomingPeer.on("signal", (data) => {
        socket.emit("answer-call", { answer: data, to: from });
      });

      incomingPeer.on("stream", (userStream) => {
        userVideo.current.srcObject = userStream;
      });

      setPeer(incomingPeer);
    });

    // Listen for the answer from the callee
    socket.on("call-answered", ({ answer }) => {
      peer.signal(answer);
    });

    return () => socket.off();
  }, [socket, stream, peer]);

  // Call a user
  const callUser = (id) => {
    const outgoingPeer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    });

    outgoingPeer.on("signal", (data) => {
      socket.emit("call-user", { offer: data, to: id });
    });

    outgoingPeer.on("stream", (userStream) => {
      userVideo.current.srcObject = userStream;
    });

    setPeer(outgoingPeer);
  };

  // Initialize media when the component mounts
  useEffect(() => {
    getMedia();
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      <div className="flex space-x-4">
        <video
          ref={myVideo}
          autoPlay
          playsInline
          muted
          className="w-1/3"
        />
        <video ref={userVideo} autoPlay playsInline className="w-1/3" />
      </div>
      <div className="mt-4">
        <p>Your ID: {myId}</p>
        <p>Room ID: {roomId}</p> {/* Display the roomId */}
        <input
          type="text"
          placeholder="Enter ID to call"
          value={callId}
          onChange={(e) => setCallId(e.target.value)}
          className="p-2 border"
        />
        <button
          onClick={() => callUser(callId)}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Call
        </button>
      </div>
    </div>
  );
};

export default Page;
