import { approve, reject } from "@/app/actions";
import type { Person } from "@/lib/data";
import { SubmitButton } from "./submit-button";

export function PendingRequests({ people }: { people: Person[] }) {
  if (people.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-orange-300 bg-white p-4">
      <h2 className="text-lg font-bold">Solicitudes</h2>
      <ul className="flex flex-col gap-2">
        {people.map((person) => (
          <li key={person.id} className="flex items-center gap-2">
            <span className="flex-1 font-medium">{person.name}</span>
            <form action={approve} className="w-28">
              <input type="hidden" name="personId" value={person.id} />
              <SubmitButton>Aprobar</SubmitButton>
            </form>
            <form action={reject} className="w-28">
              <input type="hidden" name="personId" value={person.id} />
              <SubmitButton variant="danger">Rechazar</SubmitButton>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
