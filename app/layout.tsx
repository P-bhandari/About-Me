import type { Metadata } from 'next';
import { DM_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';

const sans = DM_Sans({ variable: '--font-sans-custom', subsets: ['latin'] });
const display = Space_Grotesk({ variable: '--font-display', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: 'Piyush Bhandari — Product, AI & Technology Leader',
  description:
    'The personal atlas of Piyush Bhandari: product leadership, enterprise AI, technology transformation, research, and the systems behind the work.',
  openGraph: {
    title: 'Piyush Bhandari — Product, AI & Technology',
    description: 'Enterprise AI, product leadership, technology transformation, research, and the systems behind the work.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Piyush Bhandari — Product, AI, Technology' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Piyush Bhandari — Product, AI & Technology',
    description: 'Enterprise AI, product leadership, technology transformation, research, and the systems behind the work.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable}`}>
        {children}
      </body>
    </html>
  );
}
