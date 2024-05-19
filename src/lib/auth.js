// lib/auth.js
export async function resetPassword(token, password) {
  const response = await fetch("/api/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    throw new Error("Failed to reset password");
  }
}
