import { logout } from "@/app/actions";
import { getCurrentPerson } from "@/lib/auth";
import { listPeople, listWishes, type Person, type Wish } from "@/lib/data";
import { AddWishForm } from "./add-wish-form";
import { JoinForm } from "./join-form";
import { WishCard } from "./wish-card";

type SectionProps = {
  title: string;
  wishes: Wish[];
  viewerId: string;
  names: Map<string, string>;
  children?: React.ReactNode;
};

function PersonSection({ title, wishes, viewerId, names, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">{title}</h2>
      {children}
      {wishes.length === 0 ? (
        <p className="text-sm text-stone-500">Sin deseos todavía</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {wishes.map((wish) => (
            <WishCard key={wish.id} wish={wish} viewerId={viewerId} names={names} />
          ))}
        </ul>
      )}
    </section>
  );
}

function wishesOf(person: Person, wishes: Wish[]): Wish[] {
  return wishes.filter((wish) => wish.ownerId === person.id);
}

export async function Board() {
  const me = await getCurrentPerson();
  if (!me) return <JoinForm />;

  const [people, wishes] = await Promise.all([listPeople(), listWishes()]);
  const names = new Map(people.map((person) => [person.id, person.name]));
  const others = people.filter((person) => person.id !== me.id);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <p className="text-stone-600">
          Hola, <span className="font-semibold text-stone-900">{me.name}</span>
        </p>
        <form action={logout}>
          <button type="submit" className="text-sm text-stone-500 hover:text-stone-800">
            Salir
          </button>
        </form>
      </div>

      <PersonSection title="Mi lista" wishes={wishesOf(me, wishes)} viewerId={me.id} names={names}>
        <AddWishForm />
      </PersonSection>

      {others.map((person) => (
        <PersonSection
          key={person.id}
          title={person.name}
          wishes={wishesOf(person, wishes)}
          viewerId={me.id}
          names={names}
        />
      ))}
    </div>
  );
}
