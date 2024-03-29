// pages/_app.tsx
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react"
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
      <Analytics />
    </SessionProvider>
  );
}

export default MyApp;
