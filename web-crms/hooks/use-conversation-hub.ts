"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import type { Message } from "@/types/conversation";

// Derive hub base by stripping /api/v1 suffix
const getHubUrl = () => {
  const base = (process.env.NEXT_PUBLIC_ERP_CRM_URL ?? "http://localhost:5003/api/v1")
    .replace(/\/api\/v1\/?$/, "");
  return `${base}/hubs/conversation`;
};

export function useConversationHub(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const connRef = useRef<signalR.HubConnection | null>(null);

  const setInitialMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs);
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    setMessages([]);
    let isCancelled = false;
    let connection: signalR.HubConnection | null = null;

    const timer = setTimeout(() => {
      if (isCancelled) return;

      connection = new signalR.HubConnectionBuilder()
        .withUrl(getHubUrl(), { withCredentials: true })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      connection.on("ReceiveMessage", (msg: Message) => {
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
        );
      });

      connection
        .start()
        .then(() => {
          if (isCancelled) {
            if (connection?.state === signalR.HubConnectionState.Connected) {
              connection.stop();
            }
            return;
          }
          setIsConnected(true);
          connection?.invoke("JoinConversation", conversationId).catch(console.error);
        })
        .catch((err) => {
          if (isCancelled) return; // Suppress abort error if component was unmounted
          console.error(err);
        });

      connection.onreconnected(() => {
        if (!isCancelled) {
          setIsConnected(true);
          connection?.invoke("JoinConversation", conversationId).catch(console.error);
        }
      });

      connection.onclose(() => setIsConnected(false));

      connRef.current = connection;
    }, 50);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      setIsConnected(false);

      if (connection) {
        const conn = connection;
        if (conn.state === signalR.HubConnectionState.Connected) {
          conn
            .invoke("LeaveConversation", conversationId)
            .catch(() => {})
            .finally(() => conn.stop());
        } else if (conn.state !== signalR.HubConnectionState.Disconnected) {
          conn.stop();
        }
      }
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string) => {
      const conn = connRef.current;
      if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
        throw new Error("SignalR not connected");
      }
      await conn.invoke("SendMessage", conversationId, content);
    },
    [conversationId],
  );

  return { messages, setInitialMessages, sendMessage, isConnected };
}
