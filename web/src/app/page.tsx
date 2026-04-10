import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid, Printer, Ruler } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "zipress — 专业证件照排版工具",
  description:
    "开源证件照排版：上传证件照，选择纸张规格，一键生成 300 DPI 打印级排版图。支持多种标准尺寸与智能混排。",
};

const features = [
  {
    icon: Ruler,
    title: "多种尺寸",
    body:
      "支持 1 寸、2 寸等标准证件照尺寸，5 寸、6 寸、A4 纸张",
  },
  {
    icon: LayoutGrid,
    title: "智能排版",
    body: "自动计算最优排列，支持单一尺寸和混排模式",
  },
  {
    icon: Printer,
    title: "打印级输出",
    body: "300 DPI 高清输出，裁切辅助线，直接打印",
  },
] as const;

const photoSpecs = [
  { label: "1 寸", dims: "25×35mm" },
  { label: "小 2 寸", dims: "33×48mm" },
  { label: "2 寸", dims: "35×49mm" },
  { label: "大 2 寸", dims: "35×53mm" },
] as const;

const paperSpecs = [
  { label: "5 寸", dims: "89×127mm" },
  { label: "6 寸", dims: "102×152mm" },
  { label: "A4", dims: "210×297mm" },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 text-zinc-50">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />
      <main className="relative z-10 flex flex-1 flex-col">
        {/* Hero */}
        <section className="border-b border-zinc-800/80 px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs font-medium tracking-widest text-teal-500/90 uppercase">
              Open source
            </p>
            <h1 className="mt-4 font-mono text-5xl font-bold tracking-tighter text-zinc-50 sm:text-7xl md:text-8xl">
              zipress
            </h1>
            <p className="mt-6 text-xl font-medium text-zinc-100 sm:text-2xl">
              专业证件照排版工具
            </p>
            <p className="mt-2 font-mono text-sm text-zinc-500 sm:text-base">
              ID Photo Layout Tool
            </p>
            <p className="mx-auto mt-8 max-w-xl text-pretty text-sm leading-relaxed text-zinc-400 sm:text-base">
              上传证件照，选择纸张规格，一键生成打印级排版图
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button
                nativeButton={false}
                render={<Link href="/login" />}
                className="h-10 rounded-md border-0 bg-teal-500 px-6 text-sm font-medium text-zinc-950 no-underline shadow-none hover:bg-teal-400 focus-visible:ring-teal-500/40"
              >
                开始使用
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <Link
                    href="https://github.com/ax2/zipress"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                className="h-10 rounded-md border-zinc-700 bg-transparent px-6 text-sm font-medium text-zinc-200 no-underline hover:border-zinc-600 hover:bg-zinc-900"
              >
                <svg
                  className="mr-2 size-4 shrink-0 text-zinc-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-zinc-800/80 px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-mono text-xs font-medium tracking-widest text-zinc-500 uppercase">
              Features
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {features.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-6"
                >
                  <div className="flex size-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-teal-500">
                    <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-zinc-100">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specs */}
        <section className="border-b border-zinc-800/80 px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-mono text-xs font-medium tracking-widest text-zinc-500 uppercase">
              Supported sizes
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="font-mono text-sm text-teal-500/90">
                  Photo
                </h3>
                <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900/50">
                  {photoSpecs.map(({ label, dims }) => (
                    <li
                      key={label}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <span className="text-zinc-300">{label}</span>
                      <span className="font-mono text-zinc-500 tabular-nums">
                        {dims}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-sm text-teal-500/90">
                  Paper
                </h3>
                <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900/50">
                  {paperSpecs.map(({ label, dims }) => (
                    <li
                      key={label}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <span className="text-zinc-300">{label}</span>
                      <span className="font-mono text-zinc-500 tabular-nums">
                        {dims}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto px-6 py-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 border-t border-zinc-800/80 pt-10 sm:flex-row sm:items-center">
            <div className="text-center sm:text-left">
              <span className="font-mono text-sm font-semibold text-zinc-200">
                zipress
              </span>
              <span className="mx-2 text-zinc-700">·</span>
              <span className="font-mono text-xs text-zinc-500">
                Open Source · MIT License
              </span>
            </div>
            <Link
              href="https://github.com/ax2/zipress"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-teal-500/90 no-underline hover:text-teal-400"
            >
              github.com/ax2/zipress
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
