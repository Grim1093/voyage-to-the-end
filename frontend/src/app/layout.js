import { Bebas_Neue, Oswald, Montserrat } from "next/font/google";
import { CustomCursor } from "@/components/ui/custom-cursor";
import "./globals.css";

// 1. Headings
const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

// 2. Subheadings
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

// 3. Body Text
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nexus | Global Control Plane",
  description: "Secure, multi-tenant state management and ledger for enterprise nodes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${bebasNeue.variable} ${oswald.variable} ${montserrat.variable} antialiased selection:bg-[#2563EB]/30 selection:text-white`}>
        {/* Global Trailing Cursor injected at the highest DOM level */}
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}