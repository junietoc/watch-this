import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/*
  📚 LAYOUT.TSX - The Root Layout
  
  In Next.js App Router, this is the "shell" that wraps ALL pages.
  Think of it like the <html> and <body> tags that stay the same
  while the page content changes.
  
  KEY CONCEPTS:
  
  1. FONTS: We import Google Fonts using next/font/google
     - This automatically optimizes fonts (no layout shift!)
     - Creates CSS variables we can use anywhere
  
  2. METADATA: Sets the page title, description, etc.
     - Good for SEO and social sharing
  
  3. CHILDREN: This is where each page's content goes
     - When you navigate to /algorithms, that page renders here
*/

// Font configurations - these become CSS variables
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap", // Prevents invisible text while loading
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// Metadata for SEO - this appears in browser tabs and search results
export const metadata: Metadata = {
  title: {
    default: "Watch This | Algorithm Visualizer",
    template: "%s | Watch This", // e.g., "MPNext | Watch This"
  },
  description: "Watch algorithms come to life, step by step. An interactive learning tool for understanding how algorithms work.",
  keywords: ["algorithms", "visualization", "learning", "computer science", "education"],
};

// The actual layout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      {/* 
        The className applies both font variables to the body.
        Now we can use font-sans (Space Grotesk) and font-mono (JetBrains Mono)
        anywhere in our app with Tailwind!
      */}
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
