// Character rules for the public contact form. Mirrors back/src/common/text-patterns.ts
// so the browser rejects what the API would reject.

/** Person names: letters, spaces, apostrophe, dot, hyphen */
export const NAME_PATTERN = /^[\p{L}\p{M}' .-]+$/u;

/** Phone numbers: digits, spaces, parentheses, hyphen, optional leading + */
export const PHONE_PATTERN = /^\+?[0-9 ()-]+$/;

/** Place and city names: letters, digits, spaces and . , ' - ( ) */
export const PLACE_PATTERN = /^[\p{L}\p{M}0-9 .,'()-]+$/u;

/** Free text: letters, digits, whitespace and common punctuation (no markup, symbols or emoji) */
export const TEXT_PATTERN = /^[\p{L}\p{M}0-9\s.,;:¿?¡!()'"%$/+-]+$/u;

/** Stricter than the browser's type=email check (requires a dot in the domain) */
export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// The 24 provinces of Ecuador with their capital first, then other main cities
// and tourist towns. Esmeraldas goes first: it is where most work happens.
export const PROVINCES: { province: string; cities: string[] }[] = [
  { province: 'Esmeraldas', cities: ['Esmeraldas', 'Atacames', 'Tonsupa', 'Súa', 'Same', 'Muisne', 'Quinindé', 'Rioverde', 'San Lorenzo'] },
  { province: 'Azuay', cities: ['Cuenca', 'Gualaceo', 'Paute'] },
  { province: 'Bolívar', cities: ['Guaranda', 'San Miguel'] },
  { province: 'Cañar', cities: ['Azogues', 'La Troncal', 'Cañar'] },
  { province: 'Carchi', cities: ['Tulcán', 'San Gabriel'] },
  { province: 'Chimborazo', cities: ['Riobamba', 'Alausí'] },
  { province: 'Cotopaxi', cities: ['Latacunga', 'Salcedo', 'Pujilí'] },
  { province: 'El Oro', cities: ['Machala', 'Pasaje', 'Santa Rosa', 'Huaquillas', 'Zaruma'] },
  { province: 'Galápagos', cities: ['Puerto Baquerizo Moreno', 'Puerto Ayora', 'Puerto Villamil'] },
  { province: 'Guayas', cities: ['Guayaquil', 'Durán', 'Samborondón', 'Daule', 'Milagro', 'Playas'] },
  { province: 'Imbabura', cities: ['Ibarra', 'Otavalo', 'Cotacachi', 'Atuntaqui'] },
  { province: 'Loja', cities: ['Loja', 'Catamayo', 'Vilcabamba'] },
  { province: 'Los Ríos', cities: ['Babahoyo', 'Quevedo', 'Vinces'] },
  { province: 'Manabí', cities: ['Portoviejo', 'Manta', 'Chone', 'Bahía de Caráquez', 'Puerto López', 'Jipijapa', 'Montecristi'] },
  { province: 'Morona Santiago', cities: ['Macas', 'Gualaquiza'] },
  { province: 'Napo', cities: ['Tena', 'Archidona'] },
  { province: 'Orellana', cities: ['El Coca'] },
  { province: 'Pastaza', cities: ['Puyo'] },
  { province: 'Pichincha', cities: ['Quito', 'Cayambe', 'Sangolquí', 'Machachi', 'Mindo'] },
  { province: 'Santa Elena', cities: ['Santa Elena', 'Salinas', 'La Libertad', 'Montañita', 'Olón'] },
  { province: 'Santo Domingo de los Tsáchilas', cities: ['Santo Domingo'] },
  { province: 'Sucumbíos', cities: ['Nueva Loja'] },
  { province: 'Tungurahua', cities: ['Ambato', 'Baños'] },
  { province: 'Zamora Chinchipe', cities: ['Zamora', 'Yantzaza'] },
];

/** City → its province, for suggestion labels ("Manta · Manabí") */
export const CITY_PROVINCE: Record<string, string> = Object.fromEntries(
  PROVINCES.flatMap(({ province, cities }) => cities.map((c) => [c, province])),
);

// Cities offered in the contact form and the venues dashboard. Cities used by
// dashboard venues are added to this list automatically.
export const CITIES = PROVINCES.flatMap((p) => p.cities);

// Characters each kind of field refuses while typing (complements of the patterns above)
const BLOCKED = {
  name: /[^\p{L}\p{M}' .-]/gu,
  phone: /[^0-9 ()+-]/g,
  email: /[^A-Za-z0-9._%+@-]/g,
  place: /[^\p{L}\p{M}0-9 .,'()-]/gu,
  text: /[^\p{L}\p{M}0-9\s.,;:¿?¡!()'"%$/+-]/gu,
};
export type FieldKind = keyof typeof BLOCKED;

export function stripBlocked(value: string, kind: FieldKind) {
  let clean = value.replace(BLOCKED[kind], '');
  // "+" only as the first character of a phone number
  if (kind === 'phone') clean = clean.slice(0, 1) + clean.slice(1).replace(/\+/g, '');
  return clean;
}

/**
 * Removes refused characters from an input in place, keeping the caret where
 * the user was typing. Call from onChange/onInput; returns the cleaned value.
 */
export function cleanInput(el: HTMLInputElement | HTMLTextAreaElement, kind: FieldKind) {
  const clean = stripBlocked(el.value, kind);
  if (clean === el.value) return clean;
  let caret: number | null = null;
  try {
    // type=email has no selection API (null or throws)
    if (el.selectionStart !== null) caret = stripBlocked(el.value.slice(0, el.selectionStart), kind).length;
  } catch {}
  el.value = clean;
  if (caret !== null) {
    try {
      el.setSelectionRange(caret, caret);
    } catch {}
  }
  return clean;
}
