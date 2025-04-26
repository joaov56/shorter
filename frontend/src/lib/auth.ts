import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ExtendedSession extends Session {
  user?: ExtendedUser;
}

console.log("Auth configuration loaded");

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("=== SignIn Callback Start ===");
      console.log("User:", user);
      console.log("Account:", account);
      console.log("Profile:", profile);
      
      try {
        console.log("Making request to backend...");
        const response = await fetch("http://localhost:8080/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
          }),
        });

        console.log("Backend response status:", response.status);
        console.log("Backend response headers:", response.headers);
        
        if (!response.ok && response.status !== 409) {
          const errorText = await response.text();
          console.error("Registration failed:", errorText);
          return false;
        }

        console.log("=== SignIn Callback End ===");
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }: { session: ExtendedSession; token: JWT }) {
      console.log("Session callback:", { session, token });
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: ExtendedUser }) {
      console.log("JWT callback:", { token, user });
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  debug: true, // Enable debug mode
}; 