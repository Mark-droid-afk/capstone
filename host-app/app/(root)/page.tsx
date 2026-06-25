"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import UnderConstruction from "@/components/shared/under-construction";

const Page = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/signin");
    }
  }, [user, isLoading]);
  return (
    <div className="dark:text-gray-400">
      <UnderConstruction />
    </div>
  );
}

export default Page;
