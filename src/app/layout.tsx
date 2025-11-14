import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Secret Diary - Your Private Journal",
  description: "A feature-rich journaling app with AI-powered insights, voice recording, and multimedia support.",
  keywords: ["journal", "diary", "AI", "voice recording", "multimedia", "private"],
  authors: [{ name: "Secret Diary Team" }],
  openGraph: {
    title: "Secret Diary",
    description: "Your private journal with AI-powered insights",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="bg-background text-foreground"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
