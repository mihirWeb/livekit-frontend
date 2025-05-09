"use client";

import { CloseIcon } from "@/components/CloseIcon";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import { WebViewOverlay } from "@/components/WebViewOverlay";
import TranscriptionView from "@/components/TranscriptionView";
import {
  DisconnectButton,
  RoomContext,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { Room, RoomEvent } from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import type { ConnectionDetails } from "./api/connection-details/route";
import { config } from "@/config/urls";

export default function Page() {
  const [room] = useState(new Room());

  const onConnectButtonClicked = useCallback(async () => {
    // Generate room connection details, including:
    //   - A random Room name
    //   - A random Participant name
    //   - An Access Token to permit the participant to join the room
    //   - The URL of the LiveKit server to connect to
    //
    // In real-world application, you would likely allow the user to specify their
    // own participant name, and possibly to choose from existing rooms to join.

    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? "/api/connection-details",
      window.location.origin
    );
    const response = await fetch(url.toString());
    const connectionDetailsData: ConnectionDetails = await response.json();

    await room.connect(connectionDetailsData.serverUrl, connectionDetailsData.participantToken);
    await room.localParticipant.setMicrophoneEnabled(true);
  }, [room]);

  useEffect(() => {
    // Only set up error handling, remove auto-connect
    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);

    return () => {
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
    };
  }, [room]);

  return (
    <main className="relative min-h-screen bg-[#1F1F1F]">
      <WebViewOverlay url={config.webviewUrl} />
      <main data-lk-theme="default" className="h-full grid content-center bg-[var(--lk-bg)]">
        <RoomContext.Provider value={room}>
          <div className="lk-room-container max-h-[90vh]">
            <SimpleVoiceAssistant onConnectButtonClicked={onConnectButtonClicked} />
          </div>
        </RoomContext.Provider>
      </main>
    </main>
  );
}

function SimpleVoiceAssistant(props: { onConnectButtonClicked: () => void }) {
  const { state: agentState } = useVoiceAssistant();
  return (
    <>
      <AnimatePresence>
        <div className="w-3/4 lg:w-1/2 mx-auto h-full">
          <TranscriptionView />
        </div>
      </AnimatePresence>

      <NoAgentNotification state={agentState} />
      <div style={{paddingBottom:"calc(100vh - 500px)"}} className="fixed bottom-0 w-full px-4 py-2 z-[60]">
        <ControlBar onConnectButtonClicked={props.onConnectButtonClicked} />
      </div>
    </>
  );
}

function ControlBar({ onConnectButtonClicked }: { onConnectButtonClicked: () => void }) {
  const { state: agentState } = useVoiceAssistant();

  return (
    <div className="relative h-[40px]">
      <AnimatePresence>
        {agentState === "disconnected" && (
          <motion.div
            initial={{ opacity: 0, top: "10px" }}
            animate={{ opacity: 1, top: 0 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex absolute w-full h-full justify-end"
          >
            <button
              onClick={onConnectButtonClicked}
              className="text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 
                rounded-lg px-4 py-1.5 font-medium transition-all duration-200 shadow-lg text-sm"
            >
              Start a Conversation
            </button>
          </motion.div>
        )}
        {agentState !== "disconnected" && agentState !== "connecting" && (
          <motion.div
            initial={{ opacity: 0, top: "10px" }}
            animate={{ opacity: 1, top: 0 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex absolute w-full h-full justify-end"
          >
            <div className="flex items-center">
              <VoiceAssistantControlBar controls={{ leave: false }} />
              <DisconnectButton>
                <CloseIcon />
              </DisconnectButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function onDeviceFailure(error: Error) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}
