import React from 'react';
import { css } from '@emotion/react';
import { color } from '@/utils/theme';

const buttonStyles = css`
  display: flex;
  align-items: center;
  color: ${color.blue};
  background-color: ${color.white};
  border: 1px solid ${color.blue};
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  cursor: pointer;

  &:hover {
    background-color: ${color.orange};
  }
`;

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, ...attributes }: Props) {
  return (
    <button type='button' css={buttonStyles} {...attributes}>
      {children}
    </button>
  );
}
