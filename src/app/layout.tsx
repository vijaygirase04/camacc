import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CamAcc | AI Face-Based Event Photo SaaS',
  description: 'Instantly find your photos at events using secure AI face recognition.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className={`${inter.className} min-h-full flex flex-col bg-white text-slate-900`}>
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
