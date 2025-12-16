import { css } from '@emotion/react';

const chevronWrap = css`
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: -8rem;
  margin-bottom: 5rem;

  @media (max-width: 768px) {
    margin-top: -6rem;
    margin-bottom: 4rem;
  }
`;

const chevronLink = css`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  color: #333;
  text-decoration: none;
  opacity: 0.85;
  transition: opacity 120ms ease;
  &:hover {
    opacity: 1;
  }
`;

const chevron = css`
  width: 0.9rem;
  height: 0.9rem;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg);
  margin-top: -0.15rem;
`;

interface ScrollToSectionProps {
  targetSection: string;
  label: string;
  ariaLabel: string;
}

export default function ScrollToSection({
  targetSection,
  label,
  ariaLabel
}: ScrollToSectionProps) {
  return (
    <div css={chevronWrap}>
      <a href={`#${targetSection}`} css={chevronLink} aria-label={ariaLabel}>
        <span>{label}</span>
        <span css={chevron} />
      </a>
    </div>
  );
}
