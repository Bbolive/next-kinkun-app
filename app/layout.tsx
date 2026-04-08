import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
 
const prompt = Prompt({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
 
export const metadata: Metadata = {
  title: "Kinkun App (Supabase)",
  description: "บันทึกการกิน",
};
 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${prompt.className}`}
      >
        {children}
      </body>
    </html>
  );
}
 