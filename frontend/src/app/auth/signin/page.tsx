import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import SignInButton from "@/components/SignInButton"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Image src="/placeholder.svg?height=40&width=40" alt="Logo" width={40} height={40} className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <SignInButton />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center rounded-md border border-input p-3">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center rounded-md border border-input p-3">
              <input
                type="password"
                placeholder="Password"
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button className="w-full rounded-md bg-primary p-3 text-primary-foreground hover:bg-primary/90">
              Sign in with Email
            </button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <div>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up <ArrowRight className="ml-1 inline-block h-3 w-3" />
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
