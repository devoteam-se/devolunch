import { css } from '@emotion/react';

import Sort from '@/components/Sort';
import LanguageSelector from '@/components/LanguageSelector';
import { screenSize } from '@/utils/theme';
import Search from '@/components/Search';
import McpStatus from '@/components/McpStatus';

const optionsStyles = css`
  display: flex;
  width: 100%;
  height: 6rem;
  align-items: center;
  gap: 0.75rem;

  @media only screen and (max-width: ${screenSize.extraSmall}) {
    justify-content: space-between;
  }
`;

interface OptionsProps { onQueryChange: (v: string) => void }

export default function Options({ onQueryChange }: OptionsProps) {
  return (
    <div css={optionsStyles}>
      <Search onChange={onQueryChange} />
      <Sort />
      <LanguageSelector />
      <McpStatus />
    </div>
  );
}
