// Allowed upload formats. Anything else (SVG, HTML, GIF, executables…) is
// rejected: SVG in particular can carry scripts.

export interface UploadType {
  kind: 'image' | 'video';
  ext: string; // extension used for the stored file
  extensions: string[]; // accepted extensions on the original filename
  sniff: (head: Uint8Array) => boolean; // checks the real bytes, not the declared type
}

const bytesAt = (b: Uint8Array, sig: number[], offset = 0) =>
  b.length >= offset + sig.length && sig.every((v, i) => b[offset + i] === v);
const textAt = (b: Uint8Array, start: number, end: number) =>
  Buffer.from(b.subarray(start, end)).toString('latin1');

// ISO base media (MP4 / MOV): first box type is "ftyp"; old QuickTime files
// can start with other top-level atoms
const isIsoMedia = (b: Uint8Array) => textAt(b, 4, 8) === 'ftyp';
const QUICKTIME_ATOMS = ['ftyp', 'moov', 'mdat', 'wide', 'free', 'skip', 'pnot'];

export const UPLOAD_TYPES: Record<string, UploadType> = {
  'image/jpeg': {
    kind: 'image',
    ext: 'jpg',
    extensions: ['jpg', 'jpeg'],
    sniff: (b) => bytesAt(b, [0xff, 0xd8, 0xff]),
  },
  'image/png': {
    kind: 'image',
    ext: 'png',
    extensions: ['png'],
    sniff: (b) => bytesAt(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  'image/webp': {
    kind: 'image',
    ext: 'webp',
    extensions: ['webp'],
    sniff: (b) => textAt(b, 0, 4) === 'RIFF' && textAt(b, 8, 12) === 'WEBP',
  },
  'video/mp4': {
    kind: 'video',
    ext: 'mp4',
    extensions: ['mp4', 'm4v'],
    sniff: isIsoMedia,
  },
  'video/quicktime': {
    kind: 'video',
    ext: 'mov',
    extensions: ['mov', 'qt'],
    sniff: (b) => QUICKTIME_ATOMS.includes(textAt(b, 4, 8)),
  },
  'video/webm': {
    kind: 'video',
    ext: 'webm',
    extensions: ['webm'],
    // EBML header whose DocType is "webm"
    sniff: (b) => bytesAt(b, [0x1a, 0x45, 0xdf, 0xa3]) && textAt(b, 0, 4096).includes('webm'),
  },
};

export const ALLOWED_CONTENT_TYPES = Object.keys(UPLOAD_TYPES);

// sharp's format name for each image type
export const SHARP_FORMAT: Record<string, string> = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
};
