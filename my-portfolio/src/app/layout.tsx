import "../styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import layoutStyles from "@/styles/layout.module.css";

export const metadata = {
  title: "My Friend’s Portfolio",
  description: "A personal portfolio site",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={layoutStyles.body}>
        <Header />
        <main className={layoutStyles.main}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
