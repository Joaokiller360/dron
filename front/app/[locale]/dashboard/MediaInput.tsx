'use client'

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { errorMessage, uploadFile, type UploadFolder } from './lib/api';
import { btn, inputCls } from './ui';

const ACCEPT = { image: 'image/*', video: 'video/*', any: 'image/*,video/*' };

/**
 * URL field with an "Subir" button: paste a link or upload a file to the S3
 * bucket and the field is filled with its public URL.
 */
export default function MediaInput({
  value,
  onChange,
  folder,
  accept = 'image',
  required = false,
  placeholder,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  accept?: keyof typeof ACCEPT;
  required?: boolean;
  placeholder?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const uploading = progress !== null;

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setProgress(0);
    try {
      onChange(await uploadFile(file, folder, setProgress));
    } catch (err) {
      // ApiError from the presign call, plain Error from the bucket upload
      setError(err instanceof Error ? err.message : errorMessage(err, 'No se pudo subir el archivo'));
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <span className="flex flex-col gap-1.5">
      <span className="flex gap-2">
        <input
          required={required}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={uploading}
          className={inputCls}
        />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={`${btn.ghost} flex-none`}>
          <Upload size={15} />
          {uploading ? `${progress}%` : 'Subir'}
        </button>
        <input ref={fileRef} type="file" accept={ACCEPT[accept]} hidden onChange={(e) => pick(e.target.files?.[0])} />
      </span>
      {uploading && (
        <span className="h-1 overflow-hidden rounded-full bg-white/[.08]">
          <span className="block h-full transition-[width] bg-jb-accent" style={{ width: `${progress}%` }} />
        </span>
      )}
      {error && <span className="text-[12px] text-red-300">{error}</span>}
    </span>
  );
}
