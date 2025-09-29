import { css } from '@emotion/react';

import RestaurantGrid from '@/components/RestaurantGrid';
import { screenSize } from '@/utils/theme';

import type { RestaurantGridProps } from '@devolunch/shared';

const mainStyles = css`
  display: flex;
  flex-direction: column;
  max-width: ${screenSize.extraLarge};
  margin: 0 auto;
  padding: 0 1.25rem 2rem;
  scroll-margin-top: 6.5rem; /* account for sticky header */
`;

export default function Main({ restaurants }: RestaurantGridProps) {
  return (
    <main id='restaurants-section' css={mainStyles}>
      <RestaurantGrid restaurants={restaurants} />
    </main>
  );
}
