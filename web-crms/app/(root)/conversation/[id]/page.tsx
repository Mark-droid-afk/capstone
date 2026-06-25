"use client";

import { use } from "react";
import ConversationsShell from "@/components/conversations/conversations-shell";

export default function ConversationByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ConversationsShell initialId={id} />;
}
