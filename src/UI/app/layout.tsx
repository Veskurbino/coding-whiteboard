import './globals.css';
import '../tailwind.css';
import { ReactNode } from 'react';
import { Providers } from '../src/providers/Providers';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Coding Whiteboard',
  description: 'Real-Time Collaborative Code Whiteboard'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}


