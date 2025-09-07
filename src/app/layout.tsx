
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { AppFooter } from '@/components/app/app-footer';
import { CommandPalette } from '@/components/app/command-palette';

export const metadata: Metadata = {
  title: {
    default: 'Morfeus',
    template: '%s | Morfeus',
  },
  description: 'Crie e gerencie Cloud Pages para Salesforce Marketing Cloud com uma interface visual intuitiva, componentes reutilizáveis e publicação instantânea.',
  icons: {
    icon: 'https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/favicon.png?alt=media&token=b69ade02-5206-439e-a48f-caff2cf1e0b2',
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
