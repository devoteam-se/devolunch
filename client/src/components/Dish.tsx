import { css } from '@emotion/react';

const dishStyles = css`
  padding: 0.75rem 0;
  border-bottom: 1px solid #000000;
`;

const dishTitleStyles = css`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 0.875rem;
  margin-right: 8px;
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-family: 'Azeret Mono', monospace;
  font-weight: 400;
  text-transform: uppercase;
`;

const dishTitleIconStyles = css`
  width: 1rem;
  height: 1rem;
  margin: 0;
  background-color: #ffaa5b;
  border-radius: 50%;
  border: 1px solid #000;
  margin-right: 0.5rem;

  &[data-veg='true'] {
    background-color: #449856;
  }

  &[data-fish='true'] {
    background-color: #457b9d;
  }

  &[data-misc='true'] {
    background-color: #bc8f8f;
  }
`;

const dishDescriptionStyles = css`
  font-size: 0.9rem;
  font-family: 'Open Sans', sans-serif;
  max-width: 241px;
  margin: 0;
`;

export default function Dish({ type, description }: App.Dish) {
  // const { isFish } = useIsFish(description);

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