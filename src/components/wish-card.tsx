import Image from "next/image";
import { release, removeWish, reserve } from "@/app/actions";
import type { Wish } from "@/lib/data";
import { SubmitButton } from "./submit-button";

type Props = {
  wish: Wish;
  viewerId: string;
  viewerHasReservation: boolean;
  names: Map<string, string>;
};

function WishAction({ wish, viewerId, viewerHasReservation, names }: Props) {
  const hidden = <input type="hidden" name="wishId" value={wish.id} />;

  if (wish.ownerId === viewerId) {
    return (
      <form action={removeWish}>
        {hidden}
        <SubmitButton variant="danger">Quitar</SubmitButton>
      </form>
    );
  }
  if (wish.reservedBy === viewerId) {
    return (
      <form action={release}>
        {hidden}
        <SubmitButton variant="ghost">Lo compro yo · soltar</SubmitButton>
      </form>
    );
  }
  if (wish.reservedBy) {
    return (
      <p className="rounded-lg bg-stone-100 px-3 py-2 text-center text-sm text-stone-500">
        Reservado por {names.get(wish.reservedBy) ?? "alguien"}
      </p>
    );
  }
  if (viewerHasReservation) {
    return <p className="px-3 py-2 text-center text-sm text-stone-400">Ya elegiste tu regalo</p>;
  }
  return (
    <form action={reserve}>
      {hidden}
      <SubmitButton>Yo lo compro</SubmitButton>
    </form>
  );
}

export function WishCard(props: Props) {
  const { wish } = props;
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      <a href={wish.url} target="_blank" rel="noopener noreferrer" className="relative block aspect-square bg-stone-100">
        {wish.image && (
          <Image src={wish.image} alt={wish.title} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
        )}
      </a>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <a
          href={wish.url}
          target="_blank"
          rel="noopener noreferrer"
          className="line-clamp-2 text-sm font-medium hover:text-orange-600"
        >
          {wish.title}
        </a>
        <div className="mt-auto">
          <WishAction {...props} />
        </div>
      </div>
    </li>
  );
}
