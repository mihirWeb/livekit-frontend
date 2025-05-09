import useCombinedTranscriptions from "@/hooks/useCombinedTranscriptions";
import { MESSAGE_PROCESSING_DELAY } from "@/config/constants";
import * as React from "react";

export default function TranscriptionView() {
  const combinedTranscriptions = useCombinedTranscriptions();
  const lastProcessedId = React.useRef<string | null>(null);
  const hasLoggedFirstUser = React.useRef<boolean>(false);
  const [messageQueue, setMessageQueue] = React.useState<string[]>([]);
  const processingQueue = React.useRef<boolean>(false);
  const messageCounter = React.useRef<number>(0);
  const lastMessageCounter = React.useRef<number>(0);

  const postMessageToIframe = React.useCallback((text: string) => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.contentWindow?.postMessage({
        type: 'SET_TEXTAREA',
        text: text
      }, '*');
    }
  }, []);

  const listenAnimations = React.useCallback((text: string) => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.contentWindow?.postMessage({
        type: 'SET_LISTEN_ANIMATIONS',
        text: text
      }, '*');
    }
  }, []);

  const processMessageQueue = React.useCallback(async () => {
    if (messageQueue.length === 0 || processingQueue.current) return;

    processingQueue.current = true;
    const message = messageQueue[0];
    console.log('Processing message from queue:', message);
    postMessageToIframe(message);

    await new Promise(resolve => setTimeout(resolve, MESSAGE_PROCESSING_DELAY));
    setMessageQueue(prev => prev.slice(1));
    processingQueue.current = false;
  }, [messageQueue, postMessageToIframe]);

  React.useEffect(() => {
    processMessageQueue();
  }, [messageQueue, processMessageQueue]);

  // scroll to bottom when new transcription is added
  React.useEffect(() => {
    const transcription = combinedTranscriptions[combinedTranscriptions.length - 1];
    if (transcription && transcription.id !== lastProcessedId.current) {
      if (transcription.role === 'user') {
        console.log('User message detected:', transcription.text);
        listenAnimations(transcription.text);
        hasLoggedFirstUser.current = true;
        setMessageQueue([]); // Reset queue on new user input
        messageCounter.current = 0;
        lastMessageCounter.current = 0;
      }

      const isComplete = /[.!?]$/.test(transcription.text.trim());

      if (isComplete && transcription.role === 'assistant') {
        messageCounter.current++;
        console.log(`Adding message ${messageCounter.current} to queue:`, transcription.text);
        setMessageQueue(prev => [...prev, transcription.text]);
        lastMessageCounter.current = messageCounter.current;
        lastProcessedId.current = transcription.id;
      }

      const transcriptionElement = document.getElementById(transcription.id);
      if (transcriptionElement) {
        transcriptionElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [combinedTranscriptions, listenAnimations]);

  return (
    <div className="h-full flex flex-col gap-2 overflow-y-auto">
      {combinedTranscriptions.map((segment) => (
        <div
          id={segment.id}
          key={segment.id}
          className={
            segment.role === "assistant"
              ? "p-2 self-start fit-content"
              : "bg-gray-800 rounded-md p-2 self-end fit-content"
          }
        >
          {segment.text}
        </div>
      ))}
    </div>
  );
}
