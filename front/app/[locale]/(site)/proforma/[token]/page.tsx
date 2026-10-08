import { notFound } from 'next/navigation';
import { fetchPublic, whatsappUrl, type ContactInfo } from '@/app/component';
import PrintButton from './PrintButton';
import AcceptForm from './AcceptForm';

interface PublicQuote {
  code: string;
  clientName: string;
  clientCompany?: string | null;
  clientTaxId?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  items: { description: string; quantity: number; unitCents: number }[];
  discountCents: number;
  taxPercent: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  notes?: string | null;
  validUntil?: string | null;
  /** Past validUntil (computed by the API) */
  expired: boolean;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  /** Set when the client accepted on this page */
  acceptedAt?: string | null;
  acceptedName?: string | null;
  /** Version on screen; accepting a different one is refused */
  version: string;
  createdAt: string;
  contact: ContactInfo;
}

const money = (cents: number) => (cents / 100).toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-EC', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil' });
const day = (iso: string) => new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// Reached only through the secret link sent to the client: never indexed
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const q = await fetchPublic<PublicQuote>(`/quotes/public/${encodeURIComponent(token)}`);
  return {
    title: q ? `Proforma ${q.code} | JB.SKYLENS` : 'Proforma | JB.SKYLENS',
    robots: { index: false, follow: false },
    referrer: 'no-referrer' as const,
  };
}

export default async function ProformaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const q = await fetchPublic<PublicQuote>(`/quotes/public/${encodeURIComponent(token)}`);
  if (!q) notFound();

  const { expired } = q;
  const canAccept = !q.acceptedAt && !expired && q.status !== 'REJECTED';

  return (
    <div className="px-4 py-10 sm:py-14">
      {/* Prints as a plain document: no site header/footer, no dark background */}
      <style>{`@media print {
  @page { margin: 14mm; }
  body, body > div, main { background: #fff !important; }
  header, footer { display: none !important; }
}`}</style>

      <div className="flex flex-wrap items-center justify-between gap-3 max-w-[820px] mx-auto mb-5 print:hidden">
        <p className="m-0 text-[14px] text-jb-soft">
          {q.acceptedAt
            ? `Aceptada el ${dateTime(q.acceptedAt)}. ¡Gracias! Te contactaremos para coordinar.`
            : expired
              ? 'Esta proforma ya venció. Escríbenos para actualizarla.'
              : 'Revísala y acéptala al final de la página. También puedes descargarla en PDF.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={`${whatsappUrl(q.contact.phone)}?text=${encodeURIComponent(`Hola, escribo por la proforma ${q.code}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] border border-white/[.16] text-[14px] font-semibold text-jb-text hover:bg-white/[.06]"
          >
            Responder por WhatsApp
          </a>
          <PrintButton />
        </div>
      </div>

      <article className="max-w-[820px] mx-auto px-6 py-8 sm:px-12 sm:py-12 rounded-2xl bg-white text-[#111] shadow-[0_30px_80px_rgba(0,0,0,.45)] print:shadow-none print:p-0 print:rounded-none">
        <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b-2 border-[#111]">
          <div className="flex items-center gap-3">
            <img src="/img/logo-p.png" alt="" className="w-12 h-12 rounded-full" />
            <div>
              <div className="font-mono text-[18px] font-bold tracking-[-.01em]">JB.SKYLENS</div>
              <div className="text-[12.5px] text-[#555]">Producción audiovisual y tomas con dron</div>
              <div className="text-[12.5px] text-[#555]">
                {q.contact.phone} · {q.contact.email}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[11px] font-semibold tracking-[.16em] uppercase text-[#16a34a]">Proforma</div>
            <div className="font-mono text-[22px] font-bold">{q.code}</div>
            <div className="text-[12.5px] text-[#555]">Emitida el {day(q.createdAt)}</div>
            {q.validUntil && (
              <div className={`text-[12.5px] ${expired ? 'text-[#b91c1c] font-semibold' : 'text-[#555]'}`}>
                {expired ? 'Venció' : 'Válida hasta'} el {day(q.validUntil)}
              </div>
            )}
          </div>
        </div>

        <section className="py-6">
          <div className="font-mono text-[11px] font-semibold tracking-[.14em] uppercase text-[#777]">Cliente</div>
          <div className="mt-1 text-[16px] font-semibold">{q.clientName}</div>
          <div className="text-[13.5px] text-[#444]">
            {[q.clientCompany, q.clientTaxId && `CI/RUC ${q.clientTaxId}`, q.clientEmail, q.clientPhone].filter(Boolean).join(' · ')}
          </div>
        </section>

        <table className="w-full text-[14px] border-collapse">
          <thead>
            <tr className="font-mono text-[11px] tracking-[.1em] uppercase text-[#777] border-b border-[#ddd]">
              <th className="py-2 pr-3 font-semibold text-left">Descripción</th>
              <th className="py-2 px-3 font-semibold text-right">Cant.</th>
              <th className="py-2 px-3 font-semibold text-right whitespace-nowrap">P. unitario</th>
              <th className="py-2 pl-3 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {q.items.map((l, i) => (
              <tr key={i} className="border-b border-[#eee] break-inside-avoid">
                <td className="py-2.5 pr-3 align-top">{l.description}</td>
                <td className="py-2.5 px-3 font-mono text-right align-top">{l.quantity}</td>
                <td className="py-2.5 px-3 font-mono text-right align-top whitespace-nowrap">{money(l.unitCents)}</td>
                <td className="py-2.5 pl-3 font-mono text-right align-top whitespace-nowrap">{money(Math.round(l.quantity * l.unitCents))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="ml-auto mt-4 w-full max-w-[300px] text-[14px] border-collapse break-inside-avoid">
          <tbody>
            <tr>
              <td className="py-1 text-[#555]">Subtotal</td>
              <td className="py-1 font-mono text-right">{money(q.subtotalCents)}</td>
            </tr>
            {q.discountCents > 0 && (
              <tr>
                <td className="py-1 text-[#555]">Descuento</td>
                <td className="py-1 font-mono text-right">−{money(q.discountCents)}</td>
              </tr>
            )}
            <tr>
              <td className="py-1 text-[#555]">{q.taxPercent ? `IVA ${q.taxPercent}%` : 'IVA 0%'}</td>
              <td className="py-1 font-mono text-right">{money(q.taxCents)}</td>
            </tr>
            <tr className="border-t-2 border-[#111]">
              <td className="pt-2 text-[16px] font-bold">Total</td>
              <td className="pt-2 font-mono text-[18px] font-bold text-right">{money(q.totalCents)}</td>
            </tr>
          </tbody>
        </table>

        {q.notes && (
          <section className="mt-8 break-inside-avoid">
            <div className="font-mono text-[11px] font-semibold tracking-[.14em] uppercase text-[#777]">Condiciones</div>
            <p className="mt-1.5 mb-0 text-[13.5px] leading-relaxed text-[#333] whitespace-pre-wrap">{q.notes}</p>
          </section>
        )}

        {q.acceptedAt && (
          <section className="mt-8 p-4 rounded-xl border-2 border-[#16a34a] break-inside-avoid">
            <div className="font-mono text-[11px] font-semibold tracking-[.14em] uppercase text-[#16a34a]">Aceptada por el cliente</div>
            <p className="mt-1.5 mb-0 text-[14px] text-[#222]">
              <strong>{q.acceptedName}</strong> aceptó esta proforma, sus condiciones y los Términos y condiciones el {dateTime(q.acceptedAt)}.
            </p>
          </section>
        )}

        {canAccept && <AcceptForm token={token} total={money(q.totalCents)} version={q.version} />}

        <p className="mt-10 mb-0 text-[12px] text-[#777]">
          Documento informativo, no es una factura. Precios en dólares de EE. UU.
        </p>
      </article>
    </div>
  );
}
