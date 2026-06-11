"use client";

import { clsx } from "clsx";
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div className={clsx("glass neon-ring rounded-2xl", className)} {...rest} />;
}

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const { className, variant = "primary", ...rest } = props;
  return (
    <button
      className={clsx(
        "rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-neon-400/50 disabled:opacity-50",
        variant === "primary" &&
          "bg-neon-500/20 text-neon-300 border border-neon-500/30 hover:bg-neon-500/28",
        variant === "ghost" && "bg-transparent border border-white/10 hover:border-neon-500/25 hover:bg-white/5",
        className,
      )}
      {...rest}
    />
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      className={clsx(
        "w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm outline-none focus:border-neon-500/40 focus:ring-2 focus:ring-neon-500/20",
        className,
      )}
      {...rest}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      className={clsx(
        "w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm outline-none focus:border-neon-500/40 focus:ring-2 focus:ring-neon-500/20",
        className,
      )}
      {...rest}
    />
  );
}

