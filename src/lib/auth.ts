import "server-only";
import { findPerson, type Person } from "./data";
import { getSessionPersonId } from "./session";

export async function getCurrentPerson(): Promise<Person | null> {
  const personId = await getSessionPersonId();
  return personId ? findPerson(personId) : null;
}

export async function requirePerson(): Promise<Person> {
  const person = await getCurrentPerson();
  if (!person) throw new Error("Not signed in");
  return person;
}
