import type { Person } from "@/lib/data";
import { SubmitButton } from "./submit-button";

type PersonAction = {
  label: string;
  action: (formData: FormData) => Promise<void>;
  variant?: "primary" | "danger";
  confirm?: string;
};

type Props = {
  title: string;
  people: Person[];
  actions: PersonAction[];
};

export function AdminPeopleList({ title, people, actions }: Props) {
  if (people.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-orange-300 bg-white p-4">
      <h2 className="text-lg font-bold">{title}</h2>
      <ul className="flex flex-col gap-2">
        {people.map((person) => (
          <li key={person.id} className="flex items-center gap-2">
            <span className="flex-1 font-medium">{person.name}</span>
            {actions.map(({ label, action, variant, confirm }) => (
              <form key={label} action={action} className="w-28">
                <input type="hidden" name="personId" value={person.id} />
                <SubmitButton variant={variant} confirm={confirm}>
                  {label}
                </SubmitButton>
              </form>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
