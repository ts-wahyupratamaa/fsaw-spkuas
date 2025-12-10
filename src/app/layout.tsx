import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Head from 'next/head';
import { Toaster } from '@/components/ui/sonner';
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});
import { SmoothCursor } from "@/components/ui/smooth-cursor"


const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Fuzzy SAW Lab',
  description: 'Eksperimen praktis metode Fuzzy Simple Additive Weighting (SAW).',
  icons: {
    icon: '/gigi.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <Head>
        <Head>
          <link rel='icon' href='/gigi.png' />
        </Head>
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <SmoothCursor/>
        <Toaster />
      </body>
    </html>
  );
}
