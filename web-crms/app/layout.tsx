import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import LayoutProvider from "@/providers/LayoutProvider";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERP System",
  description: "Manufacturing Industry Capstone Project",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <LayoutProvider>{children}</LayoutProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
};

export default RootLayout;
