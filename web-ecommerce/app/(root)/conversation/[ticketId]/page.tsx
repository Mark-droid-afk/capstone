import { Metadata } from "next";
import Conversation from "@/components/Conversation";

export const metadata: Metadata = {
  title: "Support Chat | NextMerce",
  description: "Chat with a support agent about your concern, inquiry, or request.",
};

type Props = {
  params: Promise<{ ticketId: string }>;
};

const ConversationPage = async ({ params }: Props) => {
  const { ticketId } = await params;

  return (
    <main className="flex flex-col mx-auto md:max-w-3xl w-full scrollbar px-4 sm:px-8 xl:px-0 pt-[209px] sm:pt-[155px] lg:pt-[95px] xl:pt-[165px]" style={{ height: "100dvh" }}>
      <Conversation ticketId={ticketId} />
    </main>
  );
};

export default ConversationPage;
