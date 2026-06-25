"use client";

import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { ConversationMessage } from "@/types/conversation";

const HUB_URL =
  (process.env.NEXT_PUBLIC_ERP_CRM_URL ?? "http://localhost:5003") +
  "/hubs/conversation";

/**
 * Customer-side SignalR hook for the ConversationHub.
 *
 * Mirrors the employee hook in web-crms/components/lib/hooks/useConversationHub.ts
 * but is tailored for the ecommerce (customer) side.
 *
 * Hub methods:
 *   JoinTicket(ticketId)   — called on connect
 *   LeaveTicket(ticketId)  — called on cleanup
 *
 * Hub events this client listens for:
 *   ReceiveMessage  — new message broadcast to the ticket group
 *   TicketResolved  — ticket status update (resolved / cancelled)
 */
export function useCustomerConversationHub(
  ticketId: string | null,
  onReceiveMessage: (message: ConversationMessage) => void,
  onTicketStatusChange?: (payload: { ticketId: string; ticketStatus: string }) => void
) {
  // Use refs so the callbacks don't need to be in the effect dependency array
  const onReceiveMessageRef = useRef(onReceiveMessage);
  const onTicketStatusChangeRef = useRef(onTicketStatusChange);

  useEffect(() => {
    onReceiveMessageRef.current = onReceiveMessage;
  }, [onReceiveMessage]);

  useEffect(() => {
    onTicketStatusChangeRef.current = onTicketStatusChange;
  }, [onTicketStatusChange]);

  useEffect(() => {
    if (!ticketId) return;

    let isCancelled = false;
    let connection: signalR.HubConnection | null = null;

    const msgHandler = (message: ConversationMessage) => {
      onReceiveMessageRef.current(message);
    };

    const statusHandler = (payload: { ticketId: string; ticketStatus: string }) => {
      onTicketStatusChangeRef.current?.(payload);
    };

    const timer = setTimeout(() => {
      if (isCancelled) return;

      connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.None)
        .build();

      connection.on("ReceiveMessage", msgHandler);
      connection.on("TicketResolved", statusHandler);

      connection
        .start()
        .then(() => {
          if (isCancelled) {
            if (connection?.state === signalR.HubConnectionState.Connected) {
              connection.stop();
            }
            return;
          }
          return connection?.invoke("JoinTicket", ticketId);
        })
        .catch((err) => {
          if (isCancelled) return; // Suppress abort error if component was unmounted
          console.error("[ConversationHub] connection error:", err);
        });
    }, 50);

    return () => {
      isCancelled = true;
      clearTimeout(timer);

      if (connection) {
        const conn = connection;
        conn.off("ReceiveMessage", msgHandler);
        conn.off("TicketResolved", statusHandler);

        if (conn.state === signalR.HubConnectionState.Connected) {
          conn
            .invoke("LeaveTicket", ticketId)
            .finally(() => conn.stop());
        } else if (conn.state !== signalR.HubConnectionState.Disconnected) {
          conn.stop();
        }
      }
    };
  }, [ticketId]);
}
