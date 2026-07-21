import '@mantine/core/styles.css';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MantineProvider } from "@mantine/core";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: " World places",
  description: "turist guide for world places",
   icons: {
    icon: [
      {
        rel: "icon",
        url: "/rr.jpeg",
      },
      {
        rel: "apple-touch-icon",
        url: "/rr.jpeg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MantineProvider >
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
