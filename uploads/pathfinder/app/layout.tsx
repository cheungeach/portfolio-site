import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import "@/styles/tokens.css";
import "@/styles/bundle.css";
import "@/styles/app.css";

const serif = Source_Serif_4({ subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = { title: "Pathfinder", description: "A weekly job-search agent for students. Fewer, better, you decide." };

const themeInit = `try{var t=localStorage.getItem('pf-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={serif.variable} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit }} /></head>
      <body>{children}</body>
    </html>
  );
}
