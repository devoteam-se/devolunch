import React, { useCallback } from 'react';
import { css } from '@emotion/react';
import { color } from '@/utils/theme';

const inputWrap = css`
  position: relative;
  width: 100%;
  margin-bottom: 5rem; /* Space for chevron */

  @media (max-width: 768px) {
    margin-bottom: 4rem;
  }
`;

const input = css`
  width: 100%;
  height: 3.25rem;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 0 3.5rem 0 1rem; /* space for send button inside */
  font-size: 1.1rem;
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-color: #888;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    height: 3rem;
    font-size: 1rem;
    padding: 0 3rem 0 0.875rem;
  }
`;

const sendButton = css`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  height: 2rem;
  width: 2rem;
  border-radius: 999px;
  border: 1px solid ${color.blue};
  cursor: pointer;
  background: transparent;
  color: ${color.blue};
  display: inline-grid;
  place-items: center;
  padding: 0;
  line-height: 0;
  box-sizing: border-box;
  vertical-align: middle;
  transition: all 120ms ease;

  &:hover:not(:disabled) {
    background: ${color.blue};
    color: ${color.white};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    right: 0.5rem;
    height: 1.75rem;
    width: 1.75rem;
  }
`;

const sendIcon = css`
  position: relative;
  width: 0.7rem;
  height: 0.7rem;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(-45deg);
  display: block;

  @media (max-width: 768px) {
    width: 0.6rem;
    height: 0.6rem;
  }
`;

const loadingSpinner = css`
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid currentColor;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    width: 0.65rem;
    height: 0.65rem;
  }
`;

const errorMessage = css`
  color: #d9534f;
  font-size: 0.875rem;
  margin: 0.5rem 0 0;
  text-align: center;
`;

interface SearchInputProps {
  query: string;
  isSearching: boolean;
  error: string | null;
  placeholder?: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
}

export default function SearchInput({
  query,
  isSearching,
  error,
  placeholder = 'Skriv vad du är sugen på här...',
  onQueryChange,
  onSubmit
}: SearchInputProps) {
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onQueryChange(e.target.value);
  }, [onQueryChange]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  }, [onSubmit]);

  return (
    <>
      <div css={inputWrap}>
        <input
          css={input}
          type='text'
          placeholder={placeholder}
          value={query}
          onChange={onChange}
          onKeyDown={onKeyDown}
          disabled={isSearching}
          aria-label='Skriv vad du är sugen på'
        />
        <button
          css={sendButton}
          aria-label={isSearching ? 'Söker...' : 'Sök'}
          onClick={onSubmit}
          type='button'
          disabled={isSearching || !query.trim()}
        >
          {isSearching ? (
            <span css={loadingSpinner} />
          ) : (
            <span css={sendIcon} />
          )}
        </button>
      </div>
      {error && (
        <p css={errorMessage}>
          {error}
        </p>
      )}
    </>
  );
}