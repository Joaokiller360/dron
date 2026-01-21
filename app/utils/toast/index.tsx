'use client'
import React from 'react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastSuccessProps {
  text: string;
  variant?: ToastVariant;
  onClose: () => void;
}

export const ToastSuccess: React.FC<ToastSuccessProps> = ({
  text,
  variant = 'success',
  onClose,
}) => {
  const variants = {
    success: {
      iconBg: 'bg-success-soft text-white',
      textColor: 'text-white',
      backGruond: 'bg-honeydew-800',
      icon: (
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 11.917 9.724 16.5 19 7.5"
        />
      ),
    },
    error: {
      iconBg: 'bg-red-100 text-red-600',
      textColor: 'text-white',
      backGruond: 'bg-red-800',
      icon: (
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18 18 6M18 18 6 6"
        />
      ),
    },
    info: {
      iconBg: 'bg-blue-100 text-blue-600',
      textColor: 'text-honeydew-800',
      backGruond: 'bg-white',
      icon: (
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 16v-4m0-4h.01"
        />
      ),
    },
  };

  const current = variants[variant];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center w-full max-w-sm p-4 rounded-full shadow-xs ${current.backGruond}`}
    >
      <div
        className={`inline-flex items-center justify-center shrink-0 w-7 h-7 rounded ${current.iconBg}`}
      >
        <svg
          className="w-5 h-5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          {current.icon}
        </svg>
      </div>

      <div className={`ms-3 text-sm font-semibold ${current.textColor}`}>
        {text}
      </div>

      <button
        onClick={onClose}
        type="button"
        aria-label="Cerrar alerta"
        className={`ms-auto flex items-center justify-center hover:opacity-80 bg-transparent focus:ring-4 focus:ring-neutral-tertiary font-medium h-8 w-8 rounded-full ${current.textColor}`}
      >
        <svg
          className="w-5 h-5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18 17.94 6M18 18 6.06 6"
          />
        </svg>
      </button>
    </div>
  );
};
