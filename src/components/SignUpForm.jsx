import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export function SignUpForm({ isWhiteLabel, parentCompanyId }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    company: "",
  });

  useEffect(() => {
    console.log("SignUpForm props:", { isWhiteLabel, parentCompanyId });
  }, [isWhiteLabel, parentCompanyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        parentCompanyId: isWhiteLabel ? parentCompanyId : undefined,
      };
      console.log("Submitting signup with payload:", payload);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/onboarding?token=${data.token}`);
      } else {
        console.error("Signup failed:", data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  // ... rest of the component
} 