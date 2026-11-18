"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
};

const VARIANTS = {
  primary: "bg-orange-500 text-white hover:bg-orange-600",
  ghost: "bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50",
  danger: "bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50",
};

export function SubmitButton({ children, variant = "primary" }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${VARIANTS[variant]}`}
    >
      {pending ? "..." : children}
    </button>
  );
}
