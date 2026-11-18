import { Suspense } from "react";
import { Board } from "@/components/board";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="text-center">
        <h1 className="text-4xl font-black tracking-tight">
          Cuchumbo <span className="text-orange-500">Temu</span>
        </h1>
        <p className="mt-2 text-stone-600">Una página por Coso Solutions</p>
      </header>
      <Suspense fallback={<p className="text-center text-stone-500">Cargando...</p>}>
        <Board />
      </Suspense>
    </main>
  );
}
