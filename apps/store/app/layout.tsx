// Root layout for the store app.
//
// In the App Router, app/layout.tsx wraps every page. It's the only place
// that renders <html> and <body>, so it's where global CSS, fonts, and
// default metadata go. `children` is whatever page matches the current route
// (today, just app/page.tsx).
//
// Fonts and metadata mirror apps/web/app/layout.tsx so the store looks like
// Ninja Mountain.

import type { Metadata } from "next";
// Importing a CSS file here applies it to the whole app.
import "./globals.css";

import { fontVariables } from "./fonts";

// Exporting `metadata` sets the page <title> and <meta name="description">.
// Next reads this export; you don't render a <head> yourself.
export const metadata: Metadata = {
  title: "Ninja Mountain Arcade",
  description: "Training challenges across the Ninja Mountain training grounds.",
};

// `Readonly<...>` marks props as read-only: a component should never
// reassign its own props.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Each font's `.variable` is a class that defines its --font-* property.
    // Putting all three on <html> makes them available to every element.
    <html
      lang="en"
      className={`${fontVariables} h-full antialiased`}
    >
      {/* bg-background / text-foreground come from the @theme block in
          globals.css, which maps them to the obsidian and soft white tokens. */}
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
