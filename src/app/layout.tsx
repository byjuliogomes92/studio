
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { AppFooter } from '@/components/app/app-footer';
import { CommandPalette } from '@/components/app/command-palette';
import { ThemeProvider } from 'next-themes';


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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Language" content="pt-br" />
        <meta name="robots" content="index, follow" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
         <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
                <div className="flex-grow flex flex-col">
                  <main className="flex-grow">{children}</main>
                  <CommandPalette />
                  <Toaster />
                  <AppFooter />
                </div>
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
