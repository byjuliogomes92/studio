
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { AppFooter } from '@/components/app/app-footer';
import { CommandPalette } from '@/components/app/command-palette';

export const metadata: Metadata = {
  title: {
    default: 'Morfeu',
    template: '%s | Morfeu',
  },
  description: 'Crie e gerencie Cloud Pages para Salesforce Marketing Cloud com uma interface visual intuitiva, componentes reutilizáveis e publicação instantânea.',
  icons: {
    icon: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 0L61.2 38.8L100 50L61.2 61.2L50 100L38.8 61.2L0 50L38.8 38.8L50 0Z" fill="%232563EB"/><path d="M25 10L30.6 29.4L50 35L30.6 40.6L25 60L19.4 40.6L0 35L19.4 29.4L25 10Z" fill="%2360A5FA"/></svg>')}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <meta httpEquiv="Content-Language" content="pt-br" />
        <meta name="robots" content="index, follow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
            <div className="flex-grow flex flex-col">
              <main className="flex-grow">{children}</main>
              <CommandPalette />
              <Toaster />
              <AppFooter />
            </div>
        </AuthProvider>
      </body>
    </html>
  );
}
