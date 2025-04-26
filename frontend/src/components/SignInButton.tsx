"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  const handleSignIn = async () => {
    console.log("SignInButton clicked");
    try {
      const result = await signIn("google", { 
        callbackUrl: "/dashboards",
        redirect: true 
      });
      console.log("SignIn result:", result);
    } catch (error) {
      console.error("SignIn error:", error);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
    >
      Sign in with Google
    </button>
  );
} 