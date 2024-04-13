// components/Layout.js
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { EyeClosedIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

export default function Layout({ children }) {
  const { data: session } = useSession();
  const router = useRouter();

  const isActive = (pathname) => router.pathname === pathname;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-bold">PhoneScreen.AI</h1>
          <nav>
            <ul className="flex items-center space-x-4">
              {session && (
                <>
                  <li>
                    <ThemeToggle />
                  </li>
                  <li>
                    <Link href="/jobs">
                      <span
                        className={cn(
                          "hover:text-primary",
                          isActive("/jobs") ? "text-primary" : "text-foreground"
                        )}
                      >
                        Jobs
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Button
                      variant={"link"}
                      className="text-foreground hover:text-primary"
                      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    >
                      <EyeClosedIcon className="w-5 h-5 mr-2" />
                      Sign Out
                    </Button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex-1 py-8">{children}</main>
      <footer className="border-t">
        <div className="container py-4">
          <p>&copy; {new Date().getFullYear()} PhoneScreen.AI</p>
        </div>
      </footer>
    </div>
  );
}
