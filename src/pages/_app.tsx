import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import "../styles/globals.css";
import { cn } from "@/lib/utils";
import { Inter as FontSans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      loaded: (posthog) => {
        console.log("PostHog loaded:", posthog);
      },
    });
  } else {
    console.error("PostHog key is not defined");
  }
}

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

interface MyAppProps extends AppProps {
  Component: AppProps["Component"];
  pageProps: AppProps["pageProps"] & {
    session: any;
  };
}

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: MyAppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <div
          className={cn(
            "min-h-screen bg-background font-sans antialiased dark:bg-gray-900 dark:text-white",
            fontSans.variable
          )}
        >
          <PostHogProvider client={posthog}>
            <Component {...pageProps} />
          </PostHogProvider>
          <Analytics />
          <Toaster />
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
