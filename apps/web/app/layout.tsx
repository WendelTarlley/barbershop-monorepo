import "./globals.css";
import Header from "@/components/GlobalComponents/Header";
import Footer from "@/components/GlobalComponents/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body style={{ height: "100dvh" }} className="bg-zinc-950 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}