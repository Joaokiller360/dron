'use client'

import { Download } from 'lucide-react';

/** The browser's print dialog, where "Save as PDF" makes the file */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-jb-accent text-jb-ink text-[14px] font-semibold hover:bg-jb-accent-hi cursor-pointer print:hidden"
    >
      <Download size={16} /> Descargar PDF
    </button>
  );
}
