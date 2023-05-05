import { css } from "@emotion/react";

import Options from "@/components/Options";
import RestaurantList from "@/components/RestaurantList";

const mainStyles = css`
  display: flex;
  flex-direction: column;
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 2rem 2rem;
`;

const optionsStyles = css`
  display: flex;
  height: 6rem;
  align-items: center;
  margin-left: auto;
`;

interface RestaurantListI {
  restaurants: App.Restaurant[];
}

export default ({ restaurants }: RestaurantListI) => {
  return (
    <div css={mainStyles}>
      <div css={optionsStyles}>
        <Options />
      </div>
      <RestaurantList restaurants={restaurants} />
    </div>
  );
};
