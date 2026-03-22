import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const retroFont = localFont({
  src: [
    {
      path: "../../public/fonts/pressStart.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-retro",
});

const gameFont = localFont({
  src: [
    {
      path: "../../public/fonts/texturina.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-game",
});

export const metadata: Metadata = {
  title: "Labyrinth",
  description: "Escape the maze",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${gameFont.variable} ${retroFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
