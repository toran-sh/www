/**
 * Root Layout for Marketing Site
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Toran - API Gateway as a Service',
  description:
    'Transform, cache, and route API requests with powerful mutations. Built on Cloudflare Workers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
