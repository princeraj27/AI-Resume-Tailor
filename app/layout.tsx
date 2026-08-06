import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/layout/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI Career Intelligence Platform",
  description: "Multi-agent AI system for career development — powered by multi-agent orchestration, RAG, MCP, and voice AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <AppProviders>
          <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
                {children}
              </main>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
