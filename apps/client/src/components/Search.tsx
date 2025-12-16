import { css } from '@emotion/react';
import { useEffect, useMemo, useState } from 'react';

const containerStyles = css`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 28rem;
`;

const inputStyles = css`
  width: 100%;
  height: 2.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0 0.75rem;
  font-size: 0.95rem;
`;

interface SearchProps {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export default function Search({ value = '', placeholder = 'What do you want to eat?', onChange, debounceMs = 300 }: SearchProps) {
  const [local, setLocal] = useState<string>(value);

  useEffect(() => setLocal(value), [value]);

  const debounced = useMemo(() => {
    const handle = { id: 0 as unknown as number };
    return (next: string) => {
      clearTimeout(handle.id);
      // @ts-expect-error Node vs browser typings
      handle.id = setTimeout(() => onChange(next), debounceMs);
    };
  }, [onChange, debounceMs]);

  return (
    <div css={containerStyles}>
      <input
        css={inputStyles}
        type='text'
        value={local}
        placeholder={placeholder}
        aria-label='Search dishes'
        onChange={(e) => {
          const v = e.target.value;
          setLocal(v);
          debounced(v);
        }}
      />
    </div>
  );
}

