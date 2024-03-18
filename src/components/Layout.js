// components/Layout.js
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const { data: session } = useSession();
  const router = useRouter();

  const isActive = (pathname) => router.pathname === pathname;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">PhoneScreen.AI</h1>
          <nav>
            <ul className="flex items-center space-x-4">
              {session && (
                <>
                  <li>
                    <Link href="/jobs">
                      <span
                        className={`hover:underline ${
                          isActive("/jobs") ? "text-blue-300" : "text-white"
                        }`}
                      >
                        Active Jobs
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/candidates">
                      <span
                        className={`hover:underline ${
                          isActive("/candidates")
                            ? "text-blue-300"
                            : "text-white"
                        }`}
                      >
                        Candidates
                      </span>
                    </Link>
                  </li>

                  <li>
                    <button
                      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex-1 p-4">{children}</main>
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} PhoneScreen.AI</p>
        </div>
      </footer>
    </div>
  );
}
