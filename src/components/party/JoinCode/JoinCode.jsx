import { useState } from 'react';

const COPIED_RESET_MS = 2000;

function JoinCode({ code, codeClassName = '' }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // clipboard unavailable — code is visible on screen
    }
  }

  return (
    <button
      className="inline-flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer py-1.5 px-2.5 rounded-sm text-accent transition-[background] duration-150 hover:bg-[rgba(139,26,26,0.12)]"
      onClick={handleCopy}
      aria-label={`Join code ${code}. ${copied ? 'Kopierad!' : 'Klicka för att kopiera'}`}
    >
      <span className={`font-bold${codeClassName ? ` ${codeClassName}` : ''}`}>{code}</span>
      <span
        className={`text-[11px] font-semibold tracking-[0.06em] uppercase transition-[color] duration-150 ${copied ? 'text-like' : 'text-muted'}`}
        aria-live="polite"
      >
        {copied ? 'Kopierad!' : 'Kopiera'}
      </span>
    </button>
  );
}

export default JoinCode;
