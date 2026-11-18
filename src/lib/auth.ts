import "server-only";
import { findPerson, type Person } from "./data";
import { getSessionPersonId } from "./session";

export async function getCurrentPerson(): Promise<Person | null> {
  const personId = await getSessionPersonId();
  return personId ? findPerson(personId) : null;
}

export async function requireApprovedPerson(): Promise<Person> {
  const person = await getCurrentPerson();
  if (!person?.approved) throw new Error("Not approved");
  return person;
}

export async function requireAdmin(): Promise<Person> {
  const person = await requireApprovedPerson();
  if (!person.isAdmin) throw new Error("Not admin");
  return person;
}
