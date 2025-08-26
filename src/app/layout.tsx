
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { AppFooter } from '@/components/app/app-footer';

export const metadata: Metadata = {
  title: {
    default: 'Cloud Page Forge',
    template: '%s | Cloud Page Forge',
  },
  description: 'Crie e gerencie Cloud Pages para Salesforce Marketing Cloud com uma interface visual intuitiva, componentes reutilizáveis e publicação instantânea.',
  icons: {
    icon: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="24" height="24" x="0" y="0" fill="#2563EB" rx="6"></rect><path stroke="#fff" d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /><path stroke="#fff" d="m14 12-4 4 4 4" /><path stroke="#fff" d="m10 12 4 4" /></svg>')}`,
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
          <div className="flex-grow">
            {children}
          </div>
          <Toaster />
          <AppFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
