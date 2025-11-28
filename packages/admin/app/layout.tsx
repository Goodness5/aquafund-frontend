"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { wagmiConfig } from "../services/web3/wagmiConfig";
import { AdminAuthGuard } from "../components/auth/AdminAuthGuard";
import AdminLayout from "../components/layout/AdminLayout";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en">
      <body>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              theme={mounted ? lightTheme() : lightTheme()}
            >
              <AdminAuthGuard>
                <AdminLayout>{children}</AdminLayout>
              </AdminAuthGuard>
              <Toaster position="top-right" />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
