import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'HabitZen',
  description: 'A clean, focused habit tracker app to help users manage their daily routines.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div 
            className="fixed inset-0 -z-10 h-full w-full bg-cover bg-center" 
            style={{backgroundImage: "url('https://placehold.co/1920x1080.png')"}}
            data-ai-hint="abstract gold red"
        />
        <div className="fixed inset-0 -z-10 h-full w-full bg-background/70 backdrop-blur-sm" />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
