"use client";

import { useActionState } from "react";
import { addWish, type FormState } from "@/app/actions";
import { INPUT_CLASS } from "./styles";
import { SubmitButton } from "./submit-button";

export function AddWishForm() {
  const [state, formAction] = useActionState<FormState, FormData>(addWish, {});

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm sm:flex-row">
      <input name="url" required placeholder="Escribí el perro link acá" className={`${INPUT_CLASS} flex-[2]`} />
      <input name="title" maxLength={120} placeholder="¿Qué es? (opcional)" className={`${INPUT_CLASS} flex-1`} />
      <div className="sm:w-32">
        <SubmitButton>Agregar</SubmitButton>
      </div>
      {state.error && <p className="text-sm text-red-600 sm:self-center">{state.error}</p>}
    </form>
  );
}
