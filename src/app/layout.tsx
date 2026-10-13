import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GarmentFlow ERP | Garment Manufacturing Management Platform",
  description: "Complete ERP, MIS, CMS, Production Management and HRMS platform for garment manufacturing companies. Manage orders, production, quality, inventory, HR, and more.",
  keywords: "garment ERP, manufacturing ERP, production management, HRMS, garment factory, apparel manufacturing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
