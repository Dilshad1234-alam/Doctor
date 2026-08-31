import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-playfair",
});

export const metadata = {
  title: "DocPulse SaaS",
  description: "The ultimate website builder and booking platform for medical professionals.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${playfair.variable} ${jakarta.className} h-full antialiased`}>
      <body className="font-sans bg-slate-50 text-slate-900 min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
