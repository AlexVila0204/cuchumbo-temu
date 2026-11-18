"use client";

import { useActionState } from "react";
import { join, type FormState } from "@/app/actions";
import { SubmitButton } from "./submit-button";

const INPUT = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-orange-500";

export function JoinForm() {
  const [state, formAction] = useActionState<FormState, FormData>(join, {});

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold">Entrar</h2>
      <input name="name" placeholder="Tu nombre" required maxLength={30} className={INPUT} />
      <input
        name="pin"
        placeholder="PIN (4-6 números)"
        required
        inputMode="numeric"
        pattern="\d{4,6}"
        type="password"
        className={INPUT}
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton>Entrar</SubmitButton>
    </form>
  );
}
