'use client'

import { ChevronDown } from 'lucide-react';

// Dial codes offered in phone fields. `min`/`max` = digits of the national
// number (without the country code); `trunk` = countries where people dial a
// leading 0 at home, which is dropped here (Ecuador: 0987654321 → 987654321).
export const PHONE_COUNTRIES = [
  { iso: 'EC', name: 'Ecuador', dial: '593', min: 9, max: 9, trunk: true },
  { iso: 'CO', name: 'Colombia', dial: '57', min: 10, max: 10 },
  { iso: 'PE', name: 'Perú', dial: '51', min: 9, max: 9 },
  { iso: 'US', name: 'Estados Unidos', dial: '1', min: 10, max: 10 },
  { iso: 'CA', name: 'Canadá', dial: '1', min: 10, max: 10 },
  { iso: 'MX', name: 'México', dial: '52', min: 10, max: 10 },
  { iso: 'ES', name: 'España', dial: '34', min: 9, max: 9 },
  { iso: 'AR', name: 'Argentina', dial: '54', min: 10, max: 11, trunk: true },
  { iso: 'BO', name: 'Bolivia', dial: '591', min: 8, max: 8 },
  { iso: 'BR', name: 'Brasil', dial: '55', min: 10, max: 11 },
  { iso: 'CL', name: 'Chile', dial: '56', min: 9, max: 9 },
  { iso: 'CR', name: 'Costa Rica', dial: '506', min: 8, max: 8 },
  { iso: 'GT', name: 'Guatemala', dial: '502', min: 8, max: 8 },
  { iso: 'PA', name: 'Panamá', dial: '507', min: 7, max: 8 },
  { iso: 'PY', name: 'Paraguay', dial: '595', min: 9, max: 9, trunk: true },
  { iso: 'UY', name: 'Uruguay', dial: '598', min: 8, max: 8, trunk: true },
  { iso: 'VE', name: 'Venezuela', dial: '58', min: 10, max: 10, trunk: true },
  { iso: 'DE', name: 'Alemania', dial: '49', min: 10, max: 11, trunk: true },
  { iso: 'FR', name: 'Francia', dial: '33', min: 9, max: 9, trunk: true },
  { iso: 'IT', name: 'Italia', dial: '39', min: 9, max: 10 },
  { iso: 'GB', name: 'Reino Unido', dial: '44', min: 10, max: 10, trunk: true },
] as const;

export type PhoneCountry = (typeof PHONE_COUNTRIES)[number]['iso'];

export const countryOf = (iso: PhoneCountry) => PHONE_COUNTRIES.find((c) => c.iso === iso) ?? PHONE_COUNTRIES[0];

/** 🇪🇨 from "EC" (regional indicator letters) */
const flag = (iso: string) => String.fromCodePoint(...[...iso].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));

/** "+593 987654321" — the format sent to the API */
export const formatPhone = (iso: PhoneCountry, digits: string) => `+${countryOf(iso).dial} ${digits}`;

/** True when the national number has a valid length for the country */
export const isValidPhone = (iso: PhoneCountry, digits: string) => {
  const c = countryOf(iso);
  return /^\d+$/.test(digits) && digits.length >= c.min && digits.length <= c.max;
};

/**
 * Keeps digits only, drops a pasted country code ("+593 98…") and a
 * home-dialing leading 0, and caps the length
 */
export function cleanPhoneDigits(iso: PhoneCountry, raw: string) {
  const c = countryOf(iso);
  let digits = raw.replace(/\D/g, '');
  const international = /^\s*(\+|00)/.test(raw);
  if (international) digits = digits.replace(/^00/, '');
  if ((international || digits.length > c.max) && digits.startsWith(c.dial)) {
    digits = digits.slice(c.dial.length);
  }
  if ('trunk' in c && c.trunk) digits = digits.replace(/^0+/, '');
  return digits.slice(0, c.max);
}

/**
 * Phone field: country picker (flag + dial code) and a digits-only number.
 * The picker is a native <select> laid over the visible flag button, so it
 * keeps keyboard and screen-reader support on every device.
 */
export default function PhoneInput({
  country,
  number,
  onChange,
  inputClassName,
  countryLabel,
  id,
}: {
  country: PhoneCountry;
  number: string;
  onChange: (country: PhoneCountry, number: string) => void;
  inputClassName: string;
  countryLabel: string;
  id?: string;
}) {
  const c = countryOf(country);
  return (
    <div className="flex gap-2">
      <div className="relative flex-none">
        <span
          aria-hidden
          className={`${inputClassName} flex items-center gap-1.5 h-full pr-2.5 pointer-events-none whitespace-nowrap`}
        >
          <span className="text-[18px] leading-none">{flag(c.iso)}</span>
          <span className="font-mono text-[14px]">+{c.dial}</span>
          <ChevronDown size={14} className="text-jb-muted" />
        </span>
        <select
          aria-label={countryLabel}
          value={country}
          onChange={(e) => {
            const next = e.target.value as PhoneCountry;
            onChange(next, cleanPhoneDigits(next, number));
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
          {PHONE_COUNTRIES.map((p) => (
            <option key={p.iso} value={p.iso}>
              {flag(p.iso)} {p.name} (+{p.dial})
            </option>
          ))}
        </select>
      </div>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        required
        minLength={c.min}
        maxLength={c.max}
        pattern={`\\d{${c.min},${c.max}}`}
        placeholder={c.iso === 'EC' ? '987654321' : '1234567890123'.slice(0, c.min)}
        value={number}
        onChange={(e) => onChange(country, cleanPhoneDigits(country, e.target.value))}
        className={`${inputClassName} flex-1 min-w-0 font-mono tracking-[.04em]`}
      />
    </div>
  );
}
