'use client';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CedarCopilot, ProviderConfig, useCedarStore, useVoice } from 'cedar-os';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const llmProvider: ProviderConfig = {
    provider: 'mastra' as const,
    baseURL: process.env.NEXT_PUBLIC_MASTRA_URL || 'http://localhost:4112',
    voiceRoute: '/voice', // Auto-configures voice endpoint
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CedarCopilot
          llmProvider={llmProvider}
          voiceSettings={{
            language: 'en-US',
            voiceId: 'alloy', // OpenAI voices: alloy, echo, fable, onyx, nova, shimmer
            useBrowserTTS: false, // Use OpenAI TTS instead of browser
            autoAddToMessages: true, // Add voice interactions to chat history
            pitch: 1.0,
            rate: 1.0,
            volume: 1.0,
          }}
        >
          {children}
        </CedarCopilot>
      </body>
    </html>
  );
}
