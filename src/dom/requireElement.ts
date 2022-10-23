export function requireElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);

  if (el === null) {
    throw new Error(`element with id ${id} not found`);
  }

  return el as T;
}
