import "../styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import layoutStyles from "@/styles/layout.module.css";
import { Oswald, Roboto } from "next/font/google";

export const metadata = {
  title: "NKP Portfolio",
  description: "Nikhil Patel's personal portfolio site",
};

const headingFont = Oswald({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "700"],
});

const bodyFont = Roboto({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
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
