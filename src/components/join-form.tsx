"use client";

import { useActionState } from "react";
import { join, type FormState } from "@/app/actions";
import { CARD_FORM_CLASS, INPUT_CLASS } from "./styles";
import { SubmitButton } from "./submit-button";

export function JoinForm() {
  const [state, formAction] = useActionState<FormState, FormData>(join, {});

  return (
    <form action={formAction} className={CARD_FORM_CLASS}>
      <h2 className="text-lg font-bold">Entrar</h2>
      <input name="name" placeholder="Tu nombre" required maxLength={30} className={INPUT_CLASS} />
      <input
        name="pin"
        placeholder="PIN (4-6 números)"
        required
        type="password"
        className={INPUT_CLASS}
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton>Entrar</SubmitButton>
    </form>
  );
}
