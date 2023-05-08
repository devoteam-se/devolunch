import { css } from '@emotion/react';

import Options from '@/components/Options';
import RestaurantGrid from '@/components/RestaurantGrid';

const mainStyles = css`
  display: flex;
  flex-direction: column;
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.25rem 2rem;
`;

const optionsStyles = css`
  display: flex;
  height: 6rem;
  align-items: center;
  margin-left: auto;

  @media only screen and (max-width: 430px) {
    width: 100%;
    margin-left: 0;
    justify-content: space-between;
  }
`;

interface RestaurantGridI {
  restaurants: App.Restaurant[];
}

export default function Main({ restaurants }: RestaurantGridI) {
  return (
    <div css={mainStyles}>
      <div css={optionsStyles}>
        <Options />
      </div>
      <RestaurantGrid restaurants={restaurants} />
    </div>
  );
}
