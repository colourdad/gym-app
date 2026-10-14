import { useEffect, useState } from 'react';

interface Props {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  decimal?: boolean;
  'aria-label': string;
}

/**
 * Text input that brings up the numeric keypad on iPhone and keeps half-typed
 * values like "7." while editing. Accepts "," as a decimal point.
 */
export function NumberInput({ value, onChange, placeholder, decimal = false, ...rest }: Props) {
  const [text, setText] = useState(value == null ? '' : String(value));

  useEffect(() => {
    const parsed = parse(text);
    if (parsed !== value) setText(value == null ? '' : String(value));
  }, [value]);

  return (
    <input
      type="text"
      inputMode={decimal ? 'decimal' : 'numeric'}
      enterKeyHint="next"
      value={text}
      placeholder={placeholder}
      aria-label={rest['aria-label']}
      onChange={(e) => {
        const next = e.target.value.replace(',', '.');
        if (next !== '' && !/^\d*\.?\d*$/.test(next)) return;
        setText(next);
        onChange(parse(next));
      }}
    />
  );
}

function parse(text: string): number | undefined {
  if (text === '' || text === '.') return undefined;
  const n = Number(text);
  return Number.isFinite(n) ? n : undefined;
}
