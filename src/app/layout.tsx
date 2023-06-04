import { SupabaseListener } from "@/app/_components/SupabaseListener";
import "./globals.css";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Supabase Auth",
  description: "Supabase Auth",
};

// レイアウト
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          {/* @ts-expect-error next version of TS will fix this */}
        <SupabaseListener />
          <main className="container mx-auto max-w-screen-sm flex-1 px-1 py-5">{children}</main>

          <footer className="py-5">
            <div className="text-center text-sm">Copyright © All rights reserved | supabase-auth-app</div>
          </footer>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
