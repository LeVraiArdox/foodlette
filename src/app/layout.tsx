import type { Metadata } from "next";
import "@fontsource-variable/roboto-flex/full.css";
import "material-symbols/rounded.css";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foodlette — Material 3 Expressive Restaurant Roulette",
  description:
    "Can't decide what to eat? Spin an expressive Material 3 roulette wheel powered by BAN (data.gouv.fr), Foursquare Places, OpenStreetMap, and Haversine calculus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased selection:bg-[var(--md-sys-color-primary-container)] selection:text-[var(--md-sys-color-on-primary-container)]">
        {children}
      </body>
    </html>
  );
}
