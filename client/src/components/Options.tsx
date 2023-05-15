import { css } from '@emotion/react';

import Sort from '@/components/Sort';
import LanguageSelector from '@/components/LanguageSelector';
import { screenSize } from '@/utils/theme';

const optionsStyles = css`
  display: flex;
  width: 100%;
  height: 6rem;
  align-items: center;

  @media only screen and (max-width: ${screenSize.extraSmall}) {
    justify-content: space-between;
  }
`;

export default function Options() {
  return (
    <div css={optionsStyles}>
      <Sort />
      <LanguageSelector />
    </div>
  );
}
