// components/Layout.js
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Layout({ children }) {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">PhoneScreen.AI</h1>
          <nav>
            <ul className="flex space-x-4">
              {/* Add other navigation links here */}
              {session && (
                <li>
                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Sign Out
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex-1 p-4">
        {children}
      </main>
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} PhoneScreen.AI</p>
        </div>
      </footer>
    </div>
  );
}
