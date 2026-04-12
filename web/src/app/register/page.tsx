"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { signUp } from "@/lib/auth-client";
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await signUp.email({ email, password, name });
      if (result.error?.message) {
        toast.error(result.error.message);
        return;
      }
      toast.success("Account created");
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
        <CardHeader className="space-y-1 text-center">
          <p className="font-mono text-2xl font-bold tracking-tight text-zinc-50">
            zipress
          </p>
          <CardTitle className="text-lg font-semibold text-zinc-100">
            Create Account
          </CardTitle>
          <CardDescription className="font-mono text-xs text-zinc-500">
            Set up your workspace
          </CardDescription>
        </CardHeader>
        <form method="post" onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                className="rounded-sm border-zinc-700 bg-zinc-950/80 font-mono text-sm text-zinc-100 placeholder:text-zinc-600"
                placeholder="Your name"
              />
            </div>
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                className="rounded-sm border-zinc-700 bg-zinc-950/80 font-mono text-sm text-zinc-100 placeholder:text-zinc-600"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(ev) => setConfirmPassword(ev.target.value)}
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
              {submitting ? "Creating…" : "Create Account"}
            </Button>
            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-mono text-teal-500 hover:text-teal-400"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

