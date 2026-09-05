'use client'
import React, { useState } from 'react';
import { ToastSuccess } from '@/app/utils';

interface CopyToClipboardProps {
  value: string;      // Lo que se copia
  label?: string;     // Lo que se muestra
  toastText: string;  // Texto del toast
  style?: string;
}

export const CopyText: React.FC<CopyToClipboardProps> = ({
  value,
  label,
  toastText,
  style
}) => {
  const [showToast, setShowToast] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <>
      <button
        onClick={handleCopy}
        className={`text-white cursor-pointer hover:underline ${style}`}
      >
        {label ?? value}
      </button>

      {showToast && (
        <ToastSuccess
          text={toastText}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};
