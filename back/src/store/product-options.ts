import { BadRequestException } from '@nestjs/common';
import { Product } from '@prisma/client';

/** A choice that changes the price, e.g. Medida → 30 × 40 cm (+0) / 50 × 70 cm (+1500) */
export interface ProductOption {
  name: string;
  values: { label: string; priceCents: number }[];
}

/** What the buyer picked for one option, as stored on the order line */
export interface ChosenOption {
  name: string;
  value: string;
}

export const optionsOf = (p: Product) => (p.options as unknown as ProductOption[]) ?? [];

/**
 * Checks the buyer's choices against the product's current options (one value
 * per option, all options answered) and returns the unit price. Prices always
 * come from the database, never from the browser.
 */
export function priceWithOptions(product: Product, chosen: ChosenOption[] = []) {
  const options = optionsOf(product);
  let unitCents = product.priceCents;
  const picked: ChosenOption[] = [];
  for (const option of options) {
    const choice = chosen.find((c) => c.name === option.name);
    const value = choice && option.values.find((v) => v.label === choice.value);
    if (!value) {
      throw new BadRequestException(
        `Elige una opción válida de "${option.name}" para "${product.nameEs}"`,
      );
    }
    unitCents += value.priceCents;
    picked.push({ name: option.name, value: value.label });
  }
  if (chosen.some((c) => !options.some((o) => o.name === c.name))) {
    throw new BadRequestException(`"${product.nameEs}" cambió sus opciones; revisa tu carrito`);
  }
  return { unitCents, options: picked };
}

/** "Foto A3 (50 × 70 cm, Negro)" */
export const lineTitle = (name: string, options?: ChosenOption[]) =>
  options?.length ? `${name} (${options.map((o) => o.value).join(', ')})` : name;
