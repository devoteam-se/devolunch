import { css } from '@emotion/react';

import Options from '@/components/Options';
import RestaurantGrid from '@/components/RestaurantGrid';
import { screenSize } from '@/utils/theme';

import { RestaurantGridProps } from '@devolunch/shared';

const mainStyles = css`
  display: flex;
  flex-direction: column;
  max-width: ${screenSize.extraLarge};
  margin: 0 auto;
  padding: 0 1.25rem 2rem;
`;

const optionsStyles = css`
  display: flex;
  height: 6rem;
  align-items: center;
  margin-left: auto;

  @media only screen and (max-width: ${screenSize.extraSmall}) {
    width: 100%;
    margin-left: 0;
    justify-content: space-between;
  }
`;

export default function Main({ restaurants }: RestaurantGridProps) {
  return (
    <main css={mainStyles}>
      <div css={optionsStyles}>
        <Options />
      </div>
      <RestaurantGrid restaurants={restaurants} />
    </main>
  );
}
