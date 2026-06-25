// lib/Hub/useCustomerConversationHub.ts
import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export function useCustomerConversationHub(
  ticketId: number | null,
  onReceiveMessage: (message: any) => void,
) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const onReceiveMessageRef = useRef(onReceiveMessage);

  useEffect(() => {
    onReceiveMessageRef.current = onReceiveMessage;
  }, [onReceiveMessage]);

  useEffect(() => {
    if (!ticketId) return;

    let isMounted = true;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5003/hubs/conversation", {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None) // suppress internal "stopped during negotiation" noise
      .build();

    const handler = (message: any) => onReceiveMessageRef.current(message);
    connection.on("ReceiveMessage", handler);

    connection.start()
      .then(() => {
        if (!isMounted) {
          if (connection.state === signalR.HubConnectionState.Connected)
            connection.stop();
          return;
        }
        return connection.invoke("JoinTicket", String(ticketId));
      })
      .catch(err => {
        if (err?.message?.includes("stopped during negotiation")) return;
        console.error("SignalR connection error:", err);
      });

    connectionRef.current = connection;

    return () => {
      isMounted = false;
      connection.off("ReceiveMessage", handler);

      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("LeaveTicket", String(ticketId))
          .finally(() => connection.stop());
      } else if (connection.state !== signalR.HubConnectionState.Disconnected) {
        connection.stop();
      }
    };
  }, [ticketId]);
}