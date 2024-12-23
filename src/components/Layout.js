// components/Layout.js
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { PersonIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Layout({ children, whitelabelLogo }) {
  const { data: session } = useSession();
  const router = useRouter();
  console.log("whitelabelLogo", whitelabelLogo);  
  // Use whitelabelLogo prop if provided, otherwise fallback to session data
  const companyLogo = whitelabelLogo || session?.user?.company?.whitelabel_logo;
  const logoSrc = companyLogo ? `/logos/${companyLogo}` : "/small-logo.png";

  const isActive = (pathname) => router.pathname === pathname;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/jobs">
            <Image
              src={logoSrc}
              alt={companyLogo ? "Company Logo" : "PhoneScreen.AI Logo"}
              width={120}
              height={160}
              className="h-8 max-w-[160px] w-auto object-contain"
            />
          </Link>
          <nav>
            <ul className="flex items-center space-x-4">
              {session && (
                <>
                  <li>
                    <Link href="/dashboard">
                      <span
                        className={cn(
                          "hover:text-primary",
                          isActive("/dashboard")
                            ? "text-primary"
                            : "text-foreground"
                        )}
                      >
                        Dashboard
                      </span>
                    </Link>
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
                      Sign Out
                    </Button>
                  </li>
                  <li>
                    <Link href="/profile">
                      <span className="hover:text-primary">
                        <PersonIcon className="w-4 h-4" />
                      </span>
                    </Link>
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
