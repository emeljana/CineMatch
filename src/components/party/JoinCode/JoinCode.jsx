import { useState } from 'react';
import './JoinCode.css';

const COPIED_RESET_MS = 2000;

function JoinCode({ code }) {
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
      className={`join-code${copied ? ' join-code--copied' : ''}`}
      onClick={handleCopy}
      aria-label={`Join code ${code}. ${copied ? 'Kopierad!' : 'Klicka för att kopiera'}`}
    >
      <span className="join-code-value">{code}</span>
      <span className="join-code-hint" aria-live="polite">
        {copied ? 'Kopierad!' : 'Kopiera'}
      </span>
    </button>
  );
}

export default JoinCode;
