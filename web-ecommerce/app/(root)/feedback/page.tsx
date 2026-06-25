import { Metadata } from "next";
import FeedbackPage from "@/components/Contact/FeedbackPage";

export const metadata: Metadata = {
  title: "Feedback & Reviews | NextMerce",
  description: "Leave a review or browse feedback from other customers.",
};

const Page = () => {
  return (
    <main>
      <FeedbackPage />
    </main>
  );
};

export default Page;