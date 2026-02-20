import type { Metadata } from "next";
import "./globals.css";
import BottomTabBar from "@/components/BottomTabBar";
import GlobalMeditationWrapper from "@/components/GlobalMeditationWrapper";

export const metadata: Metadata = {
  title: "Naruto Inner Path",
  description: "La via del Guerriero Gentile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="pb-20">
        <GlobalMeditationWrapper>
          {children}
          <BottomTabBar />
        </GlobalMeditationWrapper>
      </body>
    </html>
  );
}