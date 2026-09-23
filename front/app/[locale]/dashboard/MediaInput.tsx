'use client'

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { checkUploadFile, errorMessage, uploadFile, UPLOAD_FORMATS, type UploadFolder } from './lib/api';
import { btn, inputCls } from './ui';

type Accept = 'image' | 'video' | 'any';

// Exact MIME list for the file picker (no image/* wildcard: it would offer SVG)
const pickerAccept = (accept: Accept) =>
  (accept === 'any' ? [...UPLOAD_FORMATS.image.types, ...UPLOAD_FORMATS.video.types] : UPLOAD_FORMATS[accept].types).join(',');

const formatsLabel = (accept: Accept) =>
  accept === 'any' ? `${UPLOAD_FORMATS.image.label} o ${UPLOAD_FORMATS.video.label}` : UPLOAD_FORMATS[accept].label;

/**
 * URL field with an "Subir" button: paste a link or upload a file to the S3
 * bucket and the field is filled with its public URL once the API has
 * verified it.
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
  accept?: Accept;
  required?: boolean;
  placeholder?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const uploading = progress !== null;
  // Upload finished, the API is checking and publishing the file
  const verifying = progress === 100;

  const pick = async (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = '';
    if (!file) return;
    setError('');
    const problem = await checkUploadFile(file, accept);
    if (problem) {
      setError(problem);
      return;
    }
    setProgress(0);
    try {
      onChange(await uploadFile(file, folder, setProgress));
    } catch (err) {
      // ApiError from the API calls, plain Error from the bucket upload
      setError(err instanceof Error ? err.message : errorMessage(err, 'No se pudo subir el archivo'));
    } finally {
      setProgress(null);
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
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title={`Formatos: ${formatsLabel(accept)}`}
          className={`${btn.ghost} flex-none`}
        >
          <Upload size={15} />
          {verifying ? 'Verificando…' : uploading ? `${progress}%` : 'Subir'}
        </button>
        <input ref={fileRef} type="file" accept={pickerAccept(accept)} hidden onChange={(e) => pick(e.target.files?.[0])} />
      </span>
      {uploading && (
        <span className="h-1 overflow-hidden rounded-full bg-white/[.08]">
          <span
            className={`block h-full transition-[width] bg-jb-accent ${verifying ? 'animate-pulse' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </span>
      )}
      {error ? (
        <span className="text-[12px] text-red-300">{error}</span>
      ) : (
        <span className="text-[11.5px] text-jb-muted">Formatos: {formatsLabel(accept)}</span>
      )}
    </span>
  );
}
