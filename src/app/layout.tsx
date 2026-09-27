import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { PlatformProvider } from "@/lib/platform-store";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ed-Novate Africa — From “what next?” to a job",
  description:
    "Ed-Novate Africa pairs an AI career counsellor with hybrid courses, a verified skills passport, and direct employer connections across The Gambia and ECOWAS.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <PlatformProvider>{children}</PlatformProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
