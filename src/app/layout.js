import { Inter } from "next/font/google";
import { AppHeader } from "@/components/shared/app-header";
import { SonnerProvider } from "@/components/providers/sonner-provider";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "SpaceUp Ambassador Portal",
  description:
    "Manage the SpaceUp ambassador program at SEDS CUSAT with real-time referrals, points, and profiles.",
  icons: {
    icon: "/SpaceUp-Icon.jpg",
    shortcut: "/SpaceUp-Icon.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "app-root antialiased",
          "min-h-screen bg-[#0a0e27] font-sans",
          inter.variable,
        )}
      >
        <AppHeader />
        <div className="relative flex min-h-dvh flex-col">
          {children}
        </div>
        <SonnerProvider />
      </body>
    </html>
  );
}
