import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider defaultTheme="dark" storageKey="habitzen-theme">
            <div 
                className="fixed inset-0 -z-10 h-full w-full bg-cover bg-center" 
                style={{backgroundImage: "url('https://images.pexels.com/photos/1766838/pexels-photo-1766838.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')"}}
                data-ai-hint="calm organized"
            />
            <div className="fixed inset-0 -z-10 h-full w-full bg-background/80 backdrop-blur-sm" />
            {children}
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
