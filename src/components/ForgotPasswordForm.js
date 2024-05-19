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
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";
import axios from "axios";

export function ForgotPasswordForm() {
  const posthog = usePostHog();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/reset-password", { email });

      if (response.status === 200) {
        posthog.capture("User Requested Password Reset Email");
        // Reset the form and show a success message
        setEmail("");
        toast({
          title: "Password reset email sent",
          description: "Please check your email for further instructions.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send password reset email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending password reset email:", error);
      toast({
        title: "Error",
        description:
          "An error occurred while sending the password reset email.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md p-8 space-y-4 m-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email below to receive a password reset link.
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
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
          <div className="text-sm">
            <Link href="/auth/signin" className="underline">
              Back to Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
