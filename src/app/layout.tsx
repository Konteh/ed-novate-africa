import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PlatformProvider } from "@/lib/platform-store";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ed-Novate Africa",
  description:
    "A guided path from choosing a course to getting hired, for learners in The Gambia and across ECOWAS.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <PlatformProvider>{children}</PlatformProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
