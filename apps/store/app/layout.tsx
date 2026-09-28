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
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
// Importing a CSS file here applies it to the whole app.
import "./globals.css";

// next/font downloads these Google fonts at build time and self-hosts them,
// so the browser never calls Google. `variable` names a CSS custom property
// that globals.css reads (var(--font-inter), etc.).
// `display: "swap"` shows fallback text right away, then swaps in the web
// font once it loads, instead of hiding text while it downloads.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* bg-background / text-foreground come from the @theme block in
          globals.css, which maps them to the obsidian and soft white tokens. */}
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
