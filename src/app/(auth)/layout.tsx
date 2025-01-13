export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <header style={{ flexShrink: 0 }}></header>
      <div style={{ flexGrow: 1, overflow: "auto" }}>{children}</div>
    </div>
  );
}
