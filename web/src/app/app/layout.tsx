"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { signOut, useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return (email[0] ?? "?").toUpperCase();
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { data, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    if (!data?.user) {
      router.replace("/login");
    }
  }, [data, isPending, router]);

  async function handleSignOut() {
    try {
      await signOut();
      toast.success("Signed out");
      router.replace("/login");
    } catch {
      toast.error("Could not sign out.");
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-zinc-950">
        <div
          className="size-6 animate-spin rounded-full border-2 border-zinc-700 border-t-teal-500"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-zinc-950">
        <div
          className="size-6 animate-spin rounded-full border-2 border-zinc-700 border-t-teal-500"
          role="status"
          aria-label="Redirecting"
        />
      </div>
    );
  }

  const { user } = data;

  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 text-zinc-100">
      <header className="flex h-12 shrink-0 items-center gap-4 border-b border-zinc-800 px-4">
        <Link
          href="/app"
          className="font-mono text-sm font-semibold tracking-tight text-zinc-100"
        >
          zipress
        </Link>
        <div className="flex flex-1 items-center justify-end gap-3">
          <Separator
            orientation="vertical"
            className="hidden h-6 bg-zinc-800 sm:block"
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className="flex h-9 items-center gap-2 rounded-sm border border-transparent px-2 font-medium text-zinc-300 outline-none transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-teal-500/40"
            >
              <span className="hidden max-w-[200px] truncate font-mono text-xs sm:inline">
                {user.email}
              </span>
              <Avatar size="sm" className="size-7 rounded-sm">
                <AvatarFallback className="rounded-sm bg-zinc-800 font-mono text-xs text-teal-400">
                  {initialsFromEmail(user.email)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-sm border-zinc-800 bg-zinc-900"
            >
              <DropdownMenuItem
                className="rounded-sm focus:bg-zinc-800"
                render={
                  <Link
                    href="/app"
                    className="flex cursor-default items-center gap-1.5"
                  />
                }
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem
                variant="destructive"
                className="rounded-sm focus:bg-zinc-800"
                onClick={handleSignOut}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
