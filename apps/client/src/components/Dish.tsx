import { color } from '@/utils/theme';
import { css } from '@emotion/react';

import { DishProps } from '@devolunch/shared';

const dishStyles = css`
  padding: 0.75rem 0;
  border-bottom: 1px solid ${color.black};
`;

const dishTitleStyles = css`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 0.75rem;
  margin-right: 0.5rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.0625rem;
`;

const dishTitleIconStyles = css`
  width: 1rem;
  height: 1rem;
  margin: 0;
  background-color: ${color.foodType.meat};
  border-radius: 50%;
  border: 1px solid ${color.blackOlive};
  margin-right: 0.5rem;

  &[data-veg='true'] {
    background-color: ${color.foodType.veg};
  }

  &[data-fish='true'] {
    background-color: ${color.foodType.fish};
  }

  &[data-misc='true'] {
    background-color: ${color.foodType.misc};
  }
`;

const dishDescriptionStyles = css`
  font-family: 'Open Sans', sans-serif;
  margin: 0;
`;

export default function Dish({ type, description }: DishProps) {
  return (
    <div css={dishStyles}>
      <h3 css={dishTitleStyles}>
        <div
          css={dishTitleIconStyles}
          data-veg={type === 'veg'}
          data-fish={type === 'fish'}
          data-misc={type === 'misc'}
        />
        {type}
      </h3>
      <p css={dishDescriptionStyles}>{description}</p>
    </div>
  );
}
