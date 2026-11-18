import "server-only";
import { db } from "./db";
import type { TemuProduct } from "./temu";

export type Person = { id: string; name: string };
export type PersonWithPin = Person & { pinHash: string };
export type Wish = {
  id: string;
  ownerId: string;
  url: string;
  title: string;
  image: string | null;
  reservedBy: string | null;
};

type WishRow = {
  id: string;
  owner_id: string;
  url: string;
  title: string;
  image: string | null;
  reserved_by: string | null;
};

const WISH_COLUMNS = "id, owner_id, url, title, image, reserved_by";

function toWish(row: WishRow): Wish {
  return {
    id: row.id,
    ownerId: row.owner_id,
    url: row.url,
    title: row.title,
    image: row.image,
    reservedBy: row.reserved_by,
  };
}

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export async function findPersonBySlug(slug: string): Promise<PersonWithPin | null> {
  const row = unwrap<{ id: string; name: string; pin_hash: string } | null>(
    await db().from("people").select("id, name, pin_hash").eq("slug", slug).maybeSingle(),
  );
  return row ? { id: row.id, name: row.name, pinHash: row.pin_hash } : null;
}

export async function findPerson(id: string): Promise<Person | null> {
  return unwrap(await db().from("people").select("id, name").eq("id", id).maybeSingle());
}

export async function createPerson(name: string, slug: string, pinHash: string): Promise<Person> {
  return unwrap(
    await db().from("people").insert({ name, slug, pin_hash: pinHash }).select("id, name").single(),
  );
}

export async function listPeople(): Promise<Person[]> {
  return unwrap(await db().from("people").select("id, name").order("created_at"));
}

export async function listWishes(): Promise<Wish[]> {
  const rows = unwrap<WishRow[]>(await db().from("wishes").select(WISH_COLUMNS).order("created_at"));
  return rows.map(toWish);
}

export async function insertWish(ownerId: string, product: TemuProduct): Promise<void> {
  unwrap(await db().from("wishes").insert({ owner_id: ownerId, ...product }));
}

export async function deleteWish(wishId: string, ownerId: string): Promise<void> {
  unwrap(await db().from("wishes").delete().eq("id", wishId).eq("owner_id", ownerId));
}

export async function reserveWish(wishId: string, personId: string): Promise<void> {
  unwrap(
    await db()
      .from("wishes")
      .update({ reserved_by: personId })
      .eq("id", wishId)
      .neq("owner_id", personId)
      .is("reserved_by", null),
  );
}

export async function releaseWish(wishId: string, personId: string): Promise<void> {
  unwrap(
    await db()
      .from("wishes")
      .update({ reserved_by: null })
      .eq("id", wishId)
      .eq("reserved_by", personId),
  );
}
