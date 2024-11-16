import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import freeDomains from 'free-email-domains';

const isFreeEmailProvider = (email) => {
  const domain = email.split('@')[1];
  const isFree = freeDomains.includes(domain);

  return isFree;
};

const validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const isValidFormat = re.test(email);
  const isFreeEmail = isFreeEmailProvider(email);
  console.log('Email validation:', { isValidFormat, isFreeEmail });
  return isValidFormat && !isFreeEmail;
};

const validatePassword = (password) => {
  return password.length >= 8;
};

export function SignUpForm({ isWhiteLabel = false, parentCompanyId = null }) {
  const posthog = usePostHog();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      let isValid = true;

      console.log('Validating email:', email);
      if (!validateEmail(email)) {
        if (isFreeEmailProvider(email)) {
          setEmailError("Please use your business email address");
        } else {
          setEmailError("Invalid email format");
        }
        isValid = false;
      } else {
        setEmailError("");
      }

      if (!validatePassword(password)) {
        setPasswordError("Password must be at least 8 characters long");
        isValid = false;
      } else {
        setPasswordError("");
      }

      if (password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
        isValid = false;
      } else {
        setConfirmPasswordError("");
      }

      if (isValid) {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            email, 
            password, 
            name, 
            company,
            parentCompanyId: isWhiteLabel ? parentCompanyId : null 
          }),
        });
        const data = await res.json();
        if (res.ok) {
          // Capture the signup event in PostHog
          posthog.capture('User Sign Up', {
            email,
            name,
            company,
            isWhiteLabel,
            parentCompanyId
          });

          if (isWhiteLabel) {
            // Redirect white-label users to a different page if needed
            router.push(`/dashboard?token=${data.token}`);
          } else {
            // Regular signup flow
            router.push(`/onboarding?token=${data.token}`);
          }
        } else {
          // Handle errors
          toast({
            title: "Error",
            description: data.message || "An error occurred during signup",
            variant: "destructive",
          });
        }
      }
      setLoading(false);
    },
    [email, password, name, company, confirmPassword, router, toast, posthog, isWhiteLabel, parentCompanyId]
  );

  return (
    <Card className="w-full max-w-md p-8 space-y-4 m-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your details below to create an account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="m@example.com"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <div className="text-red-500">{emailError}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="Acme Inc."
              required
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && (
              <div className="text-red-500">{passwordError}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPasswordError && (
              <div className="text-red-500">{confirmPasswordError}</div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <div className="text-sm">
            Already have an account?{" "}
            <Link href="/auth/signin" className="underline">
              Log in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}