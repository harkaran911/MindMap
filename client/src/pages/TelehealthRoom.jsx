import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import toast from "react-hot-toast";

const SERVER_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export default function TelehealthRoom() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "video"; // 'video' or 'audio'
  const navigate = useNavigate();

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);

  const [hasRemote, setHasRemote] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(mode === "video");

  useEffect(() => {
    let isMounted = true;
    let currentStream = null;
    socketRef.current = io(SERVER_URL);

    const initWebRTC = async () => {
      try {
        // Request media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: mode === "video",
          audio: true
        });
        
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        currentStream = stream;
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize PeerConnection
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        // Add local tracks to PC
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // When remote peer adds track, display it
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setHasRemote(true);
          }
        };

        // Send ICE candidate to peer
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit("ice-candidate", {
              target: roomId, // Using room broadcast approach for 1-1
              candidate: event.candidate
            });
          }
        };

        // Socket listeners
        socketRef.current.on("user-connected", async (userId) => {
          // Another user joined, initiate offer
          toast("Participant requested to join...");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current.emit("offer", { target: roomId, caller: socketRef.current.id, sdp: offer });
        });

        socketRef.current.on("offer", async (payload) => {
          // Prevent responding to our own offer (broadcasting bug fix)
          if (payload.caller === socketRef.current.id) return;
          
          toast("Incoming connection...");
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.emit("answer", { target: roomId, caller: socketRef.current.id, sdp: answer });
        });

        socketRef.current.on("answer", async (payload) => {
          if (payload.caller === socketRef.current.id) return;
          if (pc.signalingState !== "stable") {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          }
        });

        socketRef.current.on("ice-candidate", async (candidate) => {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error("Error adding ice candidate", e);
          }
        });

        socketRef.current.on("user-disconnected", () => {
          toast.error("Participant left the room.");
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
          setHasRemote(false);
        });

        // Finally, join room
        socketRef.current.emit("join-room", roomId);

      } catch (err) {
        toast.error("Could not access camera/microphone.");
        console.error(err);
      }
    };

    initWebRTC();

    return () => {
      isMounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [roomId, mode]);

  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  };

  const toggleCam = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamEnabled(videoTrack.enabled);
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    navigate("/appointments");
  };

  return (
    <div className="bg-zinc-950 h-[calc(100vh-4rem)] relative flex flex-col items-center justify-center p-4">
      
      {/* Remote Video (Main) */}
      <div className="w-full h-full max-w-5xl rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 relative shadow-2xl">
        {!hasRemote && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
            <div className="w-16 h-16 rounded-full bg-zinc-800 animate-pulse mb-4" />
            <p>Waiting for participant to join...</p>
            <p className="text-xs mt-2 text-zinc-600">ID: {roomId}</p>
          </div>
        )}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover transition-opacity duration-500 ${hasRemote ? "opacity-100" : "opacity-0"}`} 
        />
      </div>

      {/* Local Video (PIP) */}
      {mode === "video" && (
        <div className="absolute bottom-24 right-8 w-40 h-56 lg:w-48 lg:h-64 rounded-xl overflow-hidden bg-black border-2 border-zinc-800 shadow-xl z-10 transition-all hover:scale-105">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" style={{ transform: 'scaleX(-1)' }} />
          {!camEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-500">
              <VideoOff size={24} />
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-zinc-800 shadow-lg">
        <button 
          onClick={toggleMic}
          className={`p-3 rounded-full transition-colors ${micEnabled ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-red-500/20 text-red-500 hover:bg-red-500/30"}`}
        >
          {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {mode === "video" && (
          <button 
            onClick={toggleCam}
            className={`p-3 rounded-full transition-colors ${camEnabled ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-red-500/20 text-red-500 hover:bg-red-500/30"}`}
          >
            {camEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
        )}

        <div className="w-px h-8 bg-zinc-800 mx-1" />

        <button 
          onClick={endCall}
          className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <PhoneOff size={20} />
        </button>
      </div>

    </div>
  );
}
