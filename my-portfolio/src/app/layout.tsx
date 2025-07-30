import "../styles/globals.css";

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
        <header style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
          <span style={{ float: "right" }}>🔐 Login</span>
          <nav style={{ textAlign: "center" }}>
            <a href="/" style={{ margin: "0 1rem" }}>
              Home
            </a>
            <a href="/projects" style={{ margin: "0 1rem" }}>
              Projects
            </a>
          </nav>
        </header>
        <main style={{ padding: "2rem" }}>{children}</main>
      </body>
    </html>
  );
}
