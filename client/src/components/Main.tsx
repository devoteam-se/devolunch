import { css } from '@emotion/react';

import Options from '@/components/Options';
import RestaurantGrid from '@/components/RestaurantGrid';
import { screenSize } from '@/utils/theme';

import { Restaurant as RestaurantProps } from '@devolunch/shared';

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

const noRestaurantsStyles = css`
  font-size: 1.5rem;
  text-align: center;
  margin: 3rem 0;
`;

interface RestaurantGridI {
  restaurants: RestaurantProps[];
}

export default function Main({ restaurants }: RestaurantGridI) {
  return (
    <main css={mainStyles}>
      {restaurants?.length ? (
        <>
          <div css={optionsStyles}>
            <Options />
          </div>
          <RestaurantGrid restaurants={restaurants} />
        </>
      ) : (
        <div css={noRestaurantsStyles}>Have not scraped any restaurants yet</div>
      )}
    </main>
  );
}
