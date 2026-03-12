import { useCallback, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import hark from "hark";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
import Scene from "../Scene";

function getMessageText(message: {
  parts?: Array<{ type: string; text?: string }>;
}): string {
  return (
    message.parts
      ?.filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("") ?? ""
  );
}

const Overlay = () => {
  const [voiceUrl, setVoiceUrl] = useState("");
  const [recentResponse, setRecentResponse] = useState("");
  const [isLalaSpeaking, setIsLalaSpeaking] = useState(false);
  const [isHotMicActive, setIsHotMicActive] = useState(false);

  const getVoiceAudio = useCallback(async (text: string) => {
    try {
      const voiceResp = await fetch("https://lalaland.chat/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceId: "zrHiDhphv9ZnVXBqCLjz",
          voiceProvider: "ElevenLabs",
        }),
      });

      if (voiceResp.ok) {
        const voiceBlob = await voiceResp.blob();
        return URL.createObjectURL(voiceBlob);
      } else {
        console.error("Voice response error", voiceResp.status);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const { sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "http://localhost:3001/api/chat",
    }),
    onFinish: async ({ message }) => {
      const text = getMessageText(message);
      const audioUrl = await getVoiceAudio(text);
      if (audioUrl) setVoiceUrl(audioUrl);
      setRecentResponse(text);
    },
  });

  useEffect(() => {
    window.electronAPI.generateText(
      "Your name is Lala. You are a cute, smart, Anime girl AI companion inside the user's computer. Like Cortana from Halo. Greet the user on first message. Tell jokes, teach them, or just hangout. Keep it under 500 characters. Do not use emojis and do not bracket your response with quotes.",
    );

    const cleanupText = window.electronAPI.onGeneratedText((text: string) => {
      setRecentResponse(text);
    });

    return () => cleanupText?.();
  }, []);

  useEffect(() => {
    const cleanupHotMic = window.electronAPI.onHotMicToggled(
      (isActive: boolean) => {
        setIsHotMicActive(isActive);
      },
    );

    const cleanupPrompt = window.electronAPI.onPromptSent((prompt: string) => {
      window.electronAPI.generateText(prompt);
    });

    return () => {
      cleanupHotMic?.();
      cleanupPrompt?.();
    };
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let speechEvents: hark.Harker | null = null;
    let wavesurfer: WaveSurfer | null = null;
    let recorder: RecordPlugin | null = null;
    let isUserSpeaking = false;
    let isLoading = false;

    const main = async () => {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      speechEvents = hark(stream);

      wavesurfer = WaveSurfer.create({
        container: "#recorder",
        height: 0,
      });

      recorder = wavesurfer.registerPlugin(
        RecordPlugin.create({
          scrollingWaveform: true,
          renderRecordedAudio: false,
        }),
      );

      speechEvents.on("speaking", () => {
        if (isLalaSpeaking || isLoading) return;
        isUserSpeaking = true;
        recorder?.startRecording();
      });

      speechEvents.on("stopped_speaking", () => {
        if (isLalaSpeaking) return;
        isLoading = true;
        recorder?.stopRecording();
        isUserSpeaking = false;
      });

      recorder.on("record-end", async (blob: Blob) => {
        const formData = new FormData();
        const file = new File([blob], "voice.wav", { type: "audio/wav" });
        formData.append("file", file);

        try {
          const whisperResp = await fetch(
            "https://lalaland.chat/api/magic/whisper",
            { method: "POST", body: formData },
          );

          if (whisperResp.ok) {
            const whisperText = await whisperResp.json();
            await sendMessage({ text: whisperText });
            setTimeout(() => {
              isLoading = false;
            }, 5000);
          } else {
            console.error("Whisper error", whisperResp.status);
            isLoading = false;
          }
        } catch (e) {
          console.error(e);
          isLoading = false;
        }
      });
    };

    if (isHotMicActive) {
      main();
    }

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      speechEvents?.stop();
      wavesurfer?.destroy();
      recorder?.destroy();
      isUserSpeaking = false;
      isLoading = false;
    };
  }, [isLalaSpeaking, isHotMicActive, sendMessage]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Scene
        virtualText={recentResponse}
        voiceUrl={voiceUrl}
        onSpeakStart={() => setIsLalaSpeaking(true)}
        onSpeakEnd={() => setIsLalaSpeaking(false)}
      />
      <div id="recorder" />
    </div>
  );
};

const OverlayLayout = () => <Overlay />;

export default OverlayLayout;
