import "../styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import layoutStyles from "@/styles/layout.module.css";
import {
  Playfair_Display,
  Space_Mono,
} from "next/font/google";

export const metadata = {
  title: "Nikhil Patel",
  description: "Nikhil Patel's personal portfolio site",
};

const headingFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const bodyFont = Space_Mono({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className={layoutStyles.body}>
        <Header />
        <main className={layoutStyles.main}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
