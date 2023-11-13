import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { headers } from "next/headers";

import { ThemeProvider } from "~/app/_components/providers/theme";
import { ThemeSwitcher } from "~/app/_components/theme-switcher";

import { Toaster } from "~/app/_components/ui/toaster";
import { TRPCReactProvider } from "~/trpc/react";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Vocabulary",
  description: "Test your german vocabulary",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ClerkProvider>
        <body className={`font-sans ${inter.variable}`}>
          <TRPCReactProvider headers={headers()}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SignedIn>
                <div className="absolute right-0 m-3 flex">
                  <div className="mr-3">
                    <ThemeSwitcher />
                  </div>
                  <div className="flex flex-col justify-center">
                    <UserButton />
                  </div>
                </div>
              </SignedIn>
              {children}
              <Toaster />
            </ThemeProvider>
          </TRPCReactProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
