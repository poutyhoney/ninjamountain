// next/font downloads these Google fonts at build time and self-hosts them,
// so the browser never calls Google. `variable` names a CSS custom property
// that globals.css reads (var(--font-inter), etc.).
// `display: "swap"` shows fallback text right away, then swaps in the web
// font once it loads, instead of hiding text while it downloads.

import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google";

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

export const fontVariables = `${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable}`;