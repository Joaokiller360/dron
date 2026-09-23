'use client'

import { useEffect, useMemo, useState, FormEvent, ReactNode } from 'react';
import emailjs from '@emailjs/browser';
import { useLocale, useTranslations } from 'next-intl';
import { btnPrimary, inputClass } from './styles';
import { useContactInfo } from './ContactInfo';
import { fetchPublic, PublicVenue } from './api';
import {
  CITIES,
  EMAIL_PATTERN,
  NAME_PATTERN,
  PHONE_PATTERN,
  PLACE_PATTERN,
  TEXT_PATTERN,
  cleanInput,
  type FieldKind,
} from '@/app/utils/formRules';

// Contact request form from the design (Contact.dc.html / landing #contacto).
// Saves the request to the dashboard inbox (/contact-messages) and sends the
// same EmailJS template the old form used (name, number, email, message).

// Local YYYY-MM-DD for today, used as the date picker's minimum
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const OTHER = '__other';

// Per input name: format rule, translation key of its error, and which
// characters are refused while typing
const RULES: Record<string, [RegExp, string, FieldKind]> = {
  name: [NAME_PATTERN, 'name', 'name'],
  email: [EMAIL_PATTERN, 'email', 'email'],
  phone: [PHONE_PATTERN, 'phone', 'phone'],
  cityCustom: [PLACE_PATTERN, 'place', 'place'],
  venueCustom: [PLACE_PATTERN, 'place', 'place'],
  message: [TEXT_PATTERN, 'message', 'text'],
};

function Field({ label, hint, optional, children }: { label: string; hint?: string; optional?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col min-w-0 gap-1.5">
      <span className="text-[13.5px] font-semibold text-jb-text">
        {label}
        {optional && <span className="ml-1 font-normal text-jb-muted">({optional})</span>}
      </span>
      {children}
      {hint && <span className="text-[12px] leading-[1.4] text-jb-muted">{hint}</span>}
    </label>
  );
}

export default function ContactForm({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const t = useTranslations('site.contact');
  const locale = useLocale();
  const contact = useContactInfo();
  const types = t.raw('form.types') as string[];
  const templates = t.raw('form.templates') as string[];
  const [type, setType] = useState(types[0]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [venues, setVenues] = useState<PublicVenue[]>([]);
  const [city, setCity] = useState('');
  const [venue, setVenue] = useState('');
  const [template, setTemplate] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (variant !== 'full') return;
    fetchPublic<PublicVenue[]>('/venues').then((list) => setVenues(list ?? []));
  }, [variant]);

  // Fixed cities plus any city a dashboard venue uses
  const cities = useMemo(() => [...new Set([...CITIES, ...venues.map((v) => v.city)])], [venues]);
  const cityVenues = venues.filter((v) => v.city === city);

  // Sets the browser's validation message for one field ('' = valid)
  const check = (el: EventTarget | null) => {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return;
    const value = el.value.trim();
    let error = '';
    if (el.name === 'date') {
      if (value && value < todayISO()) error = t('form.errors.date');
    } else if (RULES[el.name] && value && !RULES[el.name][0].test(value)) {
      error = t(`form.errors.${RULES[el.name][1]}`);
    }
    el.setCustomValidity(error);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    Array.from(form.elements).forEach(check);
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? '').trim();

    const cityValue = city === OTHER ? get('cityCustom') : city;
    const venueValue =
      venue === OTHER || cityVenues.length === 0 ? get('venueCustom') : cityVenues.find((v) => v.id === venue)?.name ?? '';
    const details = [
      `${t('form.type')}: ${variant === 'full' ? type : get('type')}`,
      get('date') && `${t('form.date')}: ${get('date')}`,
      cityValue && `${t('form.city')}: ${cityValue}`,
      venueValue && `${t('form.venue')}: ${venueValue}`,
    ].filter(Boolean);
    const payload = {
      name: get('name'),
      number: get('phone'),
      email: get('email'),
      message: `${details.join('\n')}\n\n${get('message')}`,
    };

    setStatus('sending');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const inbox = apiUrl
      ? fetch(`${apiUrl}/contact-messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload.name,
            phone: payload.number,
            email: payload.email,
            message: payload.message,
            locale,
          }),
        }).then((r) => r.ok)
      : Promise.resolve(false);
    const mail = emailjs
      .send(
        `${process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID}`,
        `${process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID}`,
        payload,
        { publicKey: `${process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY}` },
      )
      .then(() => true);

    // Success if either channel got the request through
    const results = await Promise.allSettled([inbox, mail]);
    const ok = results.some((r) => r.status === 'fulfilled' && r.value);
    if (ok) {
      form.reset();
      setCity('');
      setVenue('');
      setTemplate('');
      setMessage('');
      setStatus('sent');
    } else {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="flex flex-col gap-3.5 px-8 py-10 rounded-[18px] bg-jb-card border border-[rgba(52,209,122,.35)] animate-jb-fade">
        <span className="flex items-center justify-center text-[22px] font-bold rounded-full w-11 h-11 bg-jb-accent text-jb-ink">
          ✓
        </span>
        <h2 className="m-0 text-2xl font-bold text-white">{t('sent.title')}</h2>
        <p className="m-0 text-[15px] leading-[1.6] text-jb-soft">{t('sent.text')}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="self-start mt-1.5 bg-transparent border border-white/20 text-jb-text text-sm px-4 py-2.5 rounded-[10px] cursor-pointer hover:bg-white/[.07]"
        >
          {t('sent.again')}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      onInput={(e) => {
        const el = e.target;
        if ((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) && RULES[el.name] && el.name !== 'message') {
          cleanInput(el, RULES[el.name][2]);
        }
        check(el);
      }}
      className={`flex flex-col min-w-0 border bg-jb-card border-white/[.09] ${
        variant === 'full' ? 'gap-[18px] p-7 rounded-[18px]' : 'gap-3.5 p-[26px] rounded-2xl'
      }`}
    >
      {variant === 'full' && (
        <div className="flex flex-col gap-2.5">
          <span className="text-[13.5px] font-semibold text-jb-text">{t('form.type')}</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('form.type')}>
            {types.map((label) => {
              const on = label === type;
              return (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setType(label)}
                  className={`border text-[13.5px] font-semibold px-3.5 py-2 rounded-full cursor-pointer transition ${
                    on ? 'bg-jb-accent border-jb-accent text-jb-ink' : 'bg-transparent border-white/[.16] text-jb-soft hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={variant === 'full' ? 'grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3' : 'flex flex-col gap-3.5'}>
        <Field label={t('form.name')}>
          <input required minLength={2} maxLength={100} name="name" type="text" autoComplete="name" placeholder={t('form.placeholders.name')} className={inputClass} />
        </Field>
        <Field label={t('form.email')}>
          <input required name="email" type="email" autoComplete="email" placeholder={t('form.placeholders.email')} className={inputClass} />
        </Field>
        <Field label={t('form.phone')} hint={t('form.hints.phone')}>
          <input
            required
            name="phone"
            type="tel"
            autoComplete="tel"
            minLength={7}
            maxLength={20}
            placeholder={t('form.placeholders.phone')}
            className={inputClass}
          />
        </Field>
        {variant === 'full' ? (
          <>
            <Field label={t('form.date')} optional={t('form.optional')} hint={t('form.hints.date')}>
              <input
                name="date"
                type="date"
                // Set on interaction (not render) so SSR markup matches and "today" is current
                onFocus={(e) => (e.currentTarget.min = todayISO())}
                onPointerDown={(e) => (e.currentTarget.min = todayISO())}
                className={`${inputClass} [color-scheme:dark]`} />
            </Field>
            <Field label={t('form.city')} optional={t('form.optional')}>
              <select
                name="city"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setVenue('');
                }}
                className={inputClass}
              >
                <option value="">{t('form.chooseCity')}</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value={OTHER}>{t('form.otherCity')}</option>
              </select>
            </Field>
            {city === OTHER && (
              <Field label={t('form.cityCustom')}>
                <input required minLength={2} maxLength={60} name="cityCustom" type="text" placeholder={t('form.placeholders.place')} className={inputClass} />
              </Field>
            )}
            {city && city !== OTHER && cityVenues.length > 0 && (
              <Field label={t('form.venue')} optional={t('form.optional')}>
                <select name="venue" value={venue} onChange={(e) => setVenue(e.target.value)} className={inputClass}>
                  <option value="">{t('form.noVenue')}</option>
                  {cityVenues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                  <option value={OTHER}>{t('form.otherVenue')}</option>
                </select>
              </Field>
            )}
            {city && (venue === OTHER || city === OTHER || cityVenues.length === 0) && (
              <Field label={t('form.venueCustom')} optional={t('form.optional')}>
                <input minLength={2} maxLength={80} name="venueCustom" type="text" placeholder={t('form.placeholders.venue')} className={inputClass} />
              </Field>
            )}
          </>
        ) : (
          <Field label={t('form.type')}>
            <select name="type" defaultValue={types[0]} className={inputClass}>
              {types.map((label) => (
                <option key={label}>{label}</option>
              ))}
            </select>
          </Field>
        )}
      </div>

      <Field label={t('form.messageType')}>
        <select
          value={template}
          onChange={(e) => {
            setTemplate(e.target.value);
            setMessage(e.target.value === '' ? '' : templates[Number(e.target.value)]);
          }}
          className={inputClass}
        >
          <option value="">{t('form.customMessage')}</option>
          {templates.map((text, i) => (
            <option key={i} value={i}>
              {text}
            </option>
          ))}
        </select>
      </Field>

      {template === '' ? (
        <Field label={t('form.message')}>
          <textarea
            required
            minLength={5}
            maxLength={1800}
            name="message"
            rows={variant === 'full' ? 5 : 4}
            value={message}
            onChange={(e) => setMessage(cleanInput(e.target, 'text'))}
            placeholder={t('form.placeholders.message')}
            className={`${inputClass} resize-y`}
          />
        </Field>
      ) : (
        // Preset message chosen: send it without showing the text box
        <input type="hidden" name="message" value={message} />
      )}

      {status === 'error' && (
        <p className="m-0 text-sm text-red-300">
          {t('form.error')}{' '}
          <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="underline">
            WhatsApp ↗
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className={`${btnPrimary} text-[15px] p-3.5 border-0 cursor-pointer disabled:opacity-60`}
      >
        {status === 'sending' ? t('form.sending') : t('form.submit')}
      </button>
    </form>
  );
}
