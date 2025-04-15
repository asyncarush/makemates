"use client";

import React, { useEffect, useRef, useState, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { API_ENDPOINT } from "@/axios.config";
import { AuthContext } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa";

export default function VideoChatPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const { currentUser } = useContext(AuthContext) || {};
  const [socket, setSocket] = useState<any>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [remoteUser, setRemoteUser] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCaller, setIsCaller] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const socketInstance = io(`${API_ENDPOINT}/video-chat`, {
      withCredentials: true,
    });

    setSocket(socketInstance);

    // Listen for video call responses
    socketInstance.on("video-call-accepted", () => {
      console.log("Call was accepted by other user");
      setIsWaitingForResponse(false);
      initiateCall();
    });

    socketInstance.on("video-call-rejected", () => {
      console.log("Call was rejected by other user");
      setIsWaitingForResponse(false);
      alert("Call was rejected");
      router.push("/chat");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [currentUser, router]);

  useEffect(() => {
    if (!socket) return;

    const setupWebRTC = async () => {
      try {
        // Get user media
        localStream.current = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream.current;
        }

        // Create peer connection
        peerConnection.current = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });

        // Add local stream to peer connection
        localStream.current.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, localStream.current!);
        });

        // Handle ICE candidates
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              roomId,
              candidate: event.candidate,
              userId: currentUser?.id,
            });
          }
        };

        // Handle remote stream
        peerConnection.current.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setIsCallActive(true);
          }
        };

        // Join the room
        socket.emit("join-video-room", {
          roomId,
          userId: currentUser?.id,
        });

        // Handle incoming offer
        socket.on(
          "offer",
          async ({ offer, userId }: { offer: any; userId: number }) => {
            console.log("Received offer from:", userId);
            setRemoteUser(userId);
            await peerConnection.current?.setRemoteDescription(
              new RTCSessionDescription(offer)
            );
            const answer = await peerConnection.current?.createAnswer();
            await peerConnection.current?.setLocalDescription(answer);
            socket.emit("answer", {
              roomId,
              answer,
              userId: currentUser?.id,
            });
          }
        );

        // Handle incoming answer
        socket.on("answer", async ({ answer }: { answer: any }) => {
          console.log("Received answer");
          await peerConnection.current?.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        });

        // Handle ICE candidates
        socket.on(
          "ice-candidate",
          async ({ candidate }: { candidate: any }) => {
            console.log("Received ICE candidate");
            await peerConnection.current?.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          }
        );

        // Handle user joined
        socket.on("user-joined", ({ userId }: { userId: number }) => {
          console.log("User joined:", userId);
          setRemoteUser(userId);
          if (!isCaller) {
            initiateCall();
          }
        });

        // Handle user left
        socket.on("user-left", () => {
          console.log("User left the call");
          setRemoteUser(null);
          setIsCallActive(false);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          alert("Other user has left the call");
          router.push("/chat");
        });
      } catch (error) {
        console.error("Error setting up WebRTC:", error);
      }
    };

    setupWebRTC();

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      socket.emit("leave-video-room", {
        roomId,
        userId: currentUser?.id,
      });
    };
  }, [socket, roomId, currentUser, isCaller]);

  const initiateCall = async () => {
    try {
      console.log("Initiating call...");
      const offer = await peerConnection.current?.createOffer();
      await peerConnection.current?.setLocalDescription(offer);
      socket.emit("offer", {
        roomId,
        offer,
        userId: currentUser?.id,
      });
    } catch (error) {
      console.error("Error initiating call:", error);
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current
        .getTracks()
        .find((track) => track.kind === "video");
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream.current) {
      const audioTrack = localStream.current
        .getTracks()
        .find((track) => track.kind === "audio");
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const endCall = () => {
    router.push("/chat");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex-1 relative">
        {/* Remote video */}
        <div className="absolute inset-0">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Local video */}
        <div className="absolute bottom-4 right-4 w-64 h-48 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
          <Button
            onClick={toggleVideo}
            variant="outline"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20"
          >
            {isVideoEnabled ? (
              <FaVideo className="w-5 h-5" />
            ) : (
              <FaVideoSlash className="w-5 h-5" />
            )}
          </Button>
          <Button
            onClick={toggleAudio}
            variant="outline"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20"
          >
            {isAudioEnabled ? (
              <FaMicrophone className="w-5 h-5" />
            ) : (
              <FaMicrophoneSlash className="w-5 h-5" />
            )}
          </Button>
          <Button
            onClick={endCall}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            End Call
          </Button>
        </div>
      </div>
    </div>
  );
}
