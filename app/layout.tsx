import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IntellRecurso Creative — Ideas with attitude.",
  description: "IntellRecurso Creative creates OVCs, TVCs, AVCs, brand films and influencer marketing campaigns, alongside branding, social content, animation, 3D and AI creative.",
  openGraph: {
    title: "IntellRecurso Creative",
    description: "Ideas with attitude. OVC, TVC, AVC, influencer marketing, branding, content and digital experiences.",
    images: ["/creative-bloom.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "IntellRecurso Creative",
    description: "Ideas with attitude. Films, creator campaigns, branding and digital creative for your next big idea.",
    images: ["/creative-bloom.webp"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
