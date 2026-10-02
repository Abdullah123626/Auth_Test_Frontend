import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crewly | Make room for great people",
  description: "A calmer way to build your next great team.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Browser extensions (jaise bis_register / __processed_ attributes) body badal dete hain;
    // is se hydration warning aati hai jo app ki ghalti nahi.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
