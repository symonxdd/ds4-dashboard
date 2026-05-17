import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "DS4 Dashboard | Lightweight DualShock 4 Controller Monitoring",
  description: "A modern, high-performance dashboard for DualShock 4 controllers on Windows. Built with Tauri and Rust.",
  icons: {
    icon: '/icon.svg',
  }
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
