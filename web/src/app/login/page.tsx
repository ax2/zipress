"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error?.message) {
        toast.error(result.error.message);
        return;
      }
      toast.success("Signed in");
      router.push("/app");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-zinc-950 px-4">
      <Card className="w-full max-w-sm rounded-sm border-zinc-800 bg-zinc-900/80 ring-zinc-800">
        <CardHeader className="space-y-1 pb-2 text-center">
          <p className="font-mono text-2xl font-bold tracking-tight text-zinc-50">
            zipress
          </p>
          <CardTitle className="sr-only">Sign in</CardTitle>
          <CardDescription className="sr-only">
            Enter your email and password to sign in
          </CardDescription>
        </CardHeader>
        <form method="post" onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                className="rounded-sm border-zinc-700 bg-zinc-950/80 font-mono text-sm text-zinc-100 placeholder:text-zinc-600"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                className="rounded-sm border-zinc-700 bg-zinc-950/80 font-mono text-sm text-zinc-100 placeholder:text-zinc-600"
                placeholder="••••••••"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-zinc-800 bg-zinc-900/50">
            <Button
              type="submit"
              disabled={submitting}
              className="h-9 w-full rounded-sm bg-teal-500 font-medium text-zinc-950 hover:bg-teal-400"
            >
              {submitting ? "Signing in…" : "Sign In"}
            </Button>
            <p className="text-center text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-mono text-teal-500 hover:text-teal-400"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
