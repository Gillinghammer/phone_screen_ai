// pages/_app.tsx
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css"; // or wherever your global styles are

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
