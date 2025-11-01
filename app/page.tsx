import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6" />
          <span className="text-xl font-bold">NextAuth Starter</span>
        </div>
        <nav className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Production-Ready
              <br />
              Authentication System
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              A complete Next.js authentication starter with JWT tokens, role-based access control,
              and optional feature branches. Start building your app in minutes.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="grid gap-8 pt-12 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex flex-col items-center space-y-2">
              <Lock className="h-10 w-10 text-primary" />
              <h3 className="font-semibold">Secure JWT</h3>
              <p className="text-sm text-muted-foreground">
                Token-based authentication with refresh rotation
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Users className="h-10 w-10 text-primary" />
              <h3 className="font-semibold">Role-Based</h3>
              <p className="text-sm text-muted-foreground">
                USER, ADMIN, and SUPER_ADMIN roles built-in
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Shield className="h-10 w-10 text-primary" />
              <h3 className="font-semibold">Production Ready</h3>
              <p className="text-sm text-muted-foreground">
                Security headers and best practices included
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Zap className="h-10 w-10 text-primary" />
              <h3 className="font-semibold">Type-Safe</h3>
              <p className="text-sm text-muted-foreground">
                Full TypeScript coverage with strict mode
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto border-t py-6 px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Built with Next.js, TypeScript, Prisma, and Shadcn/ui
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/api-docs" className="text-sm text-muted-foreground hover:text-foreground">
              API Docs
            </Link>
            <Link
              href="https://github.com"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
