import React, { useEffect, useRef } from "react";

interface JitsiMeetComponentProps {
  roomName: string;
  displayName?: string;
  onClose?: () => void;
}

const JitsiMeetComponent: React.FC<JitsiMeetComponentProps> = ({
  roomName,
  displayName = "User",
  onClose,
}) => {
  const apiRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadExternalApi = () => {
      if ((window as any).JitsiMeetExternalAPI) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const existing = document.querySelector(
          'script[src="https://meet.jit.si/external_api.js"]'
        ) as HTMLScriptElement | null;

        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => reject());
          return;
        }

        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.head.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadExternalApi();
      } catch {
        return;
      }

      if (!isMounted || !containerRef.current) {
        return;
      }

      const JitsiAPI = (window as any).JitsiMeetExternalAPI;
      if (!JitsiAPI) {
        return;
      }

      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }

      containerRef.current.innerHTML = "";

      const api = new JitsiAPI("meet.jit.si", {
        roomName,
        width: "100%",
        height: "100%",
        parentNode: containerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          toolbarButtons: [
            "microphone",
            "camera",
            "chat",
            "raisehand",
            "tileview",
            "hangup",
          ],
        },
        interfaceConfigOverwrite: {
          MOBILE_APP_PROMO: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },
        userInfo: {
          displayName,
        },
      });

      if (onClose) {
        api.addEventListener("readyToClose", onClose);
      }

      apiRef.current = api;
    };

    initJitsi();

    return () => {
      isMounted = false;
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [roomName, displayName, onClose]);

  return (
    <div
      ref={containerRef}
      id="jitsi-meet-container"
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default JitsiMeetComponent;
