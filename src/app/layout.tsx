import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIGHT CLOCK // Your Sleep Schedule is Dead",
  description: "Premium UFC countdown for fight fans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="arena-bg">
          <div className="beam"></div>
          <div className="noise"></div>
        </div>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
