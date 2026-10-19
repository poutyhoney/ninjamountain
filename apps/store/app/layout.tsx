import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import "./globals.css";

import { fontVariables } from "./fonts";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  title: "Ninja Mountain Arcade",
  description:
    "Training challenges across the Ninja Mountain training grounds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
      {gaMeasurementId && (
        <GoogleAnalytics
          gaId={gaMeasurementId}
          debugMode={process.env.NODE_ENV !== "production"}
        />
      )}
    </html>
  );
}
