import "../styles/globals.css";
import Header from "@/components/Header";

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
      <body>
        <Header />
        <main style={{ padding: "2rem" }}>{children}</main>
      </body>
    </html>
  );
}
