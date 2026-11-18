import "server-only";
import { db } from "./db";
import type { TemuProduct } from "./temu";

export type Person = { id: string; name: string; approved: boolean; isAdmin: boolean };
export type PersonWithPin = Person & { pinHash: string };

type PersonRow = { id: string; name: string; approved: boolean; is_admin: boolean };

const PERSON_COLUMNS = "id, name, approved, is_admin";

function toPerson(row: PersonRow): Person {
  return { id: row.id, name: row.name, approved: row.approved, isAdmin: row.is_admin };
}
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
  const row = unwrap<(PersonRow & { pin_hash: string }) | null>(
    await db().from("people").select(`${PERSON_COLUMNS}, pin_hash`).eq("slug", slug).maybeSingle(),
  );
  return row ? { ...toPerson(row), pinHash: row.pin_hash } : null;
}

export async function findPerson(id: string): Promise<Person | null> {
  const row = unwrap<PersonRow | null>(
    await db().from("people").select(PERSON_COLUMNS).eq("id", id).maybeSingle(),
  );
  return row ? toPerson(row) : null;
}

export async function createPerson(name: string, slug: string, pinHash: string): Promise<Person> {
  const row = unwrap<PersonRow>(
    await db().from("people").insert({ name, slug, pin_hash: pinHash }).select(PERSON_COLUMNS).single(),
  );
  return toPerson(row);
}

async function listPeopleByApproval(approved: boolean): Promise<Person[]> {
  const rows = unwrap<PersonRow[]>(
    await db().from("people").select(PERSON_COLUMNS).eq("approved", approved).order("created_at"),
  );
  return rows.map(toPerson);
}

export function listApprovedPeople(): Promise<Person[]> {
  return listPeopleByApproval(true);
}

export function listPendingPeople(): Promise<Person[]> {
  return listPeopleByApproval(false);
}

export async function approvePerson(id: string): Promise<void> {
  unwrap(await db().from("people").update({ approved: true }).eq("id", id));
}

export async function deleteNonAdminPerson(id: string): Promise<void> {
  unwrap(await db().from("people").delete().eq("id", id).eq("is_admin", false));
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

const MAX_LOGIN_ATTEMPTS = 3;

export async function consumeLoginAttempt(personId: string): Promise<boolean> {
  return unwrap<boolean>(
    await db().rpc("consume_login_attempt", { p_person_id: personId, p_max_attempts: MAX_LOGIN_ATTEMPTS }),
  );
}

export async function updatePinHash(personId: string, pinHash: string): Promise<void> {
  unwrap(await db().from("people").update({ pin_hash: pinHash, failed_attempts: 0 }).eq("id", personId));
}

export async function resetLoginAttempts(personId: string): Promise<void> {
  unwrap(await db().from("people").update({ failed_attempts: 0 }).eq("id", personId));
}

export async function listLockedPeople(): Promise<Person[]> {
  const rows = unwrap<PersonRow[]>(
    await db()
      .from("people")
      .select(PERSON_COLUMNS)
      .gte("failed_attempts", MAX_LOGIN_ATTEMPTS)
      .order("created_at"),
  );
  return rows.map(toPerson);
}
