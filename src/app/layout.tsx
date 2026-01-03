import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "toran - See Your Outbound API Calls Live",
    template: "%s - toran",
  },
  description:
    "Watch outbound API calls in real time. toran is a read-only, reversible API inspector for debugging integrations and AI agents-no SDKs, agents, or logging setup required.",
  metadataBase: new URL("https://toran.sh"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://toran.sh/",
    siteName: "toran",
    title: "toran - See Your Outbound API Calls Live",
    description:
      "Watch outbound API calls in real time. toran is a read-only, reversible API inspector for debugging integrations and AI agents-no SDKs, agents, or logging setup required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "toran - See Your Outbound API Calls Live",
    description:
      "Watch outbound API calls in real time. toran is a read-only, reversible API inspector for debugging integrations and AI agents-no SDKs, agents, or logging setup required.",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${workSans.className} antialiased`}
      >
        <ThemeProvider>
          {children}
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
