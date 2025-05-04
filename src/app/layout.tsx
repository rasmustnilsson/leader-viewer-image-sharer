import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/app/globals.css';
import './globals.css';
import CoverImage from './components/CoverImage';
import { WebSocketProvider } from './providers/websocket-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Image viewer',
  description: 'A simple image viewer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
        <WebSocketProvider>
          <CoverImage>{children}</CoverImage>
        </WebSocketProvider>
      </body>
    </html>
  );
}
