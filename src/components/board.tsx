import { approve, logout, removePerson, unlock } from "@/app/actions";
import { getCurrentPerson } from "@/lib/auth";
import {
  listApprovedPeople,
  listLockedPeople,
  listPendingPeople,
  listWishes,
  type Person,
  type Wish,
} from "@/lib/data";
import { AddWishForm } from "./add-wish-form";
import { AdminPeopleList } from "./admin-people-list";
import { JoinForm } from "./join-form";
import { WishCard } from "./wish-card";

type SectionProps = {
  title: string;
  wishes: Wish[];
  viewerId: string;
  viewerHasReservation: boolean;
  names: Map<string, string>;
  children?: React.ReactNode;
};

function PersonSection({ title, wishes, viewerId, viewerHasReservation, names, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">{title}</h2>
      {children}
      {wishes.length === 0 ? (
        <p className="text-sm text-stone-500">Sin deseos todavía</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {wishes.map((wish) => (
            <WishCard
              key={wish.id}
              wish={wish}
              viewerId={viewerId}
              viewerHasReservation={viewerHasReservation}
              names={names}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function wishesOf(person: Person, wishes: Wish[]): Wish[] {
  return wishes.filter((wish) => wish.ownerId === person.id);
}

function Greeting({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-stone-600">
        Hola, <span className="font-semibold text-stone-900">{name}</span>
      </p>
      <form action={logout}>
        <button type="submit" className="text-sm text-stone-500 hover:text-stone-800">
          Salir
        </button>
      </form>
    </div>
  );
}

export async function Board() {
  const me = await getCurrentPerson();
  if (!me) return <JoinForm />;
  if (!me.approved) {
    return (
      <div className="flex flex-col gap-6">
        <Greeting name={me.name} />
        <p className="rounded-2xl bg-white p-6 text-center text-stone-600 shadow-sm">Esperando aprobación</p>
      </div>
    );
  }

  const [people, pending, locked, wishes] = await Promise.all([
    listApprovedPeople(),
    me.isAdmin ? listPendingPeople() : Promise.resolve([]),
    me.isAdmin ? listLockedPeople() : Promise.resolve([]),
    listWishes(),
  ]);
  const names = new Map(people.map((person) => [person.id, person.name]));
  const others = people.filter((person) => person.id !== me.id);
  const members = me.isAdmin ? people.filter((person) => !person.isAdmin) : [];
  const hasReservation = wishes.some((wish) => wish.reservedBy === me.id);

  return (
    <div className="flex flex-col gap-10">
      <Greeting name={me.name} />
      <AdminPeopleList
        title="Solicitudes"
        people={pending}
        actions={[
          { label: "Aprobar", action: approve },
          { label: "Rechazar", action: removePerson, variant: "danger" },
        ]}
      />
      <AdminPeopleList title="Bloqueados" people={locked} actions={[{ label: "Desbloquear", action: unlock }]} />
      <AdminPeopleList
        title="Miembros"
        people={members}
        actions={[{ label: "Eliminar", action: removePerson, variant: "danger", confirm: "¿Eliminar esta cuenta?" }]}
      />

      <PersonSection title="Mi lista" wishes={wishesOf(me, wishes)} viewerId={me.id} viewerHasReservation={hasReservation} names={names}>
        <AddWishForm />
      </PersonSection>

      {others.map((person) => (
        <PersonSection
          key={person.id}
          title={person.name}
          wishes={wishesOf(person, wishes)}
          viewerId={me.id}
          viewerHasReservation={hasReservation}
          names={names}
        />
      ))}
    </div>
  );
}
