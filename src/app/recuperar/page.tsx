import type { Metadata } from "next";
import { RecoverForm } from "@/components/recover-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RecoverPage() {
  return (
    <main className="flex flex-1 items-center px-4 py-10">
      <RecoverForm />
    </main>
  );
}
