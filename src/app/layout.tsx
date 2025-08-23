
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { AppFooter } from '@/components/app/app-footer';

export const metadata: Metadata = {
  title: {
    default: 'CloudPage Studio',
    template: '%s | CloudPage Studio',
  },
  description: 'Gere páginas para Salesforce Marketing Cloud com facilidade, utilizando componentes pré-prontos e uma interface intuitiva.',
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
