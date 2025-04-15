import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { SocketService } from "@/services/ChatService";

interface Call {
  roomId: string;
  callerId: string;
  callerName: string;
}

interface User {
  id: string;
  name: string;
}

export const useVideoCall = (
  socket: Socket | null,
  socketService: SocketService,
  router: AppRouterInstance,
  currentUser: User | null
) => {
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ roomId, callerId, callerName }: Call) => {
      console.log("Received video call request:", {
        roomId,
        callerId,
        callerName,
      });
      setIncomingCall({ roomId, callerId, callerName });
    };

    const handleCallAccepted = ({ roomId }: { roomId: string }) => {
      console.log("Call accepted, navigating to room:", roomId);
      setIncomingCall(null);
      router.push(`/video-chat/${roomId}`);
    };

    const handleCallRejected = () => {
      console.log("Call was rejected");
      setIncomingCall(null);
      setIsWaitingForResponse(false);
      alert("Call was rejected");
    };

    socket.on("incoming-video-call", handleIncomingCall);
    socket.on("video-call-accepted", handleCallAccepted);
    socket.on("video-call-rejected", handleCallRejected);

    return () => {
      socket.off("incoming-video-call", handleIncomingCall);
      socket.off("video-call-accepted", handleCallAccepted);
      socket.off("video-call-rejected", handleCallRejected);
    };
  }, [socket, router]);

  const initiateCall = (roomId: string) => {
    if (!currentUser) return;

    socketService.emitVideoCallRequest(
      roomId,
      currentUser.id,
      currentUser.name
    );
    setIsWaitingForResponse(true);

    // Navigate to video chat page after a short delay
    setTimeout(() => {
      router.push(`/video-chat/${roomId}`);
    }, 1000);
  };

  const acceptCall = () => {
    if (!socket || !incomingCall || !currentUser) return;

    socketService.emitVideoCallResponse(
      incomingCall.roomId,
      currentUser.id,
      true
    );
  };

  const rejectCall = () => {
    if (!socket || !incomingCall || !currentUser) return;

    socketService.emitVideoCallResponse(
      incomingCall.roomId,
      currentUser.id,
      false
    );
    setIncomingCall(null);
  };

  return {
    incomingCall,
    isWaitingForResponse,
    initiateCall,
    acceptCall,
    rejectCall,
  };
};
