import "../styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import layoutStyles from "@/styles/layout.module.css";
import { Playfair_Display, Poppins } from "next/font/google";

export const metadata = {
  title: "My Friend’s Portfolio",
  description: "A personal portfolio site",
};

const headingFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Poppins({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "600"],
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
