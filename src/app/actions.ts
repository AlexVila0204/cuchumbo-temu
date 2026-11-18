"use server";

import { refresh } from "next/cache";
import { requireAdmin, requireApprovedPerson } from "@/lib/auth";
import {
  approvePerson,
  createPerson,
  deleteWish,
  findPersonBySlug,
  insertWish,
  rejectPerson,
  releaseWish,
  reserveWish,
} from "@/lib/data";
import { hashPin, verifyPin } from "@/lib/pin";
import { clearSession, setSession } from "@/lib/session";
import { fetchTemuProduct } from "@/lib/temu";

export type FormState = { error?: string };

const PIN_PATTERN = /^\d{4,6}$/;
const TITLE_MAX_LENGTH = 120;

function readText(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function join(_: FormState, formData: FormData): Promise<FormState> {
  const name = readText(formData, "name").replace(/\s+/g, " ");
  const pin = readText(formData, "pin");
  if (name.length < 2 || name.length > 30) return { error: "Nombre inválido" };
  if (!PIN_PATTERN.test(pin)) return { error: "PIN de 4 a 6 números" };

  const slug = name.toLowerCase();
  const existing = await findPersonBySlug(slug);
  if (existing && !verifyPin(pin, existing.pinHash)) return { error: "PIN incorrecto" };

  const person = existing ?? (await createPerson(name, slug, hashPin(pin)));
  await setSession(person.id);
  refresh();
  return {};
}

export async function logout(): Promise<void> {
  await clearSession();
  refresh();
}

export async function addWish(_: FormState, formData: FormData): Promise<FormState> {
  const me = await requireApprovedPerson();
  const product = await fetchTemuProduct(readText(formData, "url")).catch(() => null);
  if (!product) return { error: "Link de Temu inválido" };

  const customTitle = readText(formData, "title").slice(0, TITLE_MAX_LENGTH);
  await insertWish(me.id, { ...product, title: customTitle || product.title });
  refresh();
  return {};
}

export async function removeWish(formData: FormData): Promise<void> {
  const me = await requireApprovedPerson();
  await deleteWish(readText(formData, "wishId"), me.id);
  refresh();
}

export async function reserve(formData: FormData): Promise<void> {
  const me = await requireApprovedPerson();
  await reserveWish(readText(formData, "wishId"), me.id);
  refresh();
}

export async function release(formData: FormData): Promise<void> {
  const me = await requireApprovedPerson();
  await releaseWish(readText(formData, "wishId"), me.id);
  refresh();
}

export async function approve(formData: FormData): Promise<void> {
  await requireAdmin();
  await approvePerson(readText(formData, "personId"));
  refresh();
}

export async function reject(formData: FormData): Promise<void> {
  await requireAdmin();
  await rejectPerson(readText(formData, "personId"));
  refresh();
}
