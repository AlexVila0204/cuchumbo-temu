"use client";

import { useActionState } from "react";
import { addWish, type FormState } from "@/app/actions";
import { SubmitButton } from "./submit-button";

const INPUT = "rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-orange-500";

export function AddWishForm() {
  const [state, formAction] = useActionState<FormState, FormData>(addWish, {});

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm sm:flex-row">
      <input name="url" required placeholder="Pega tu link de Temu" className={`${INPUT} flex-[2]`} />
      <input name="title" maxLength={120} placeholder="¿Qué es? (opcional)" className={`${INPUT} flex-1`} />
      <div className="sm:w-32">
        <SubmitButton>Agregar</SubmitButton>
      </div>
      {state.error && <p className="text-sm text-red-600 sm:self-center">{state.error}</p>}
    </form>
  );
}
