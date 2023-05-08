import { ReactComponent as Icon } from '@/assets/devoteam.svg';
import { css } from '@emotion/react';

const headerStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid black;
  padding: 0 1.25rem;
  margin: 0;
  animation-name: load;
  animation-duration: 1s;
  background-color: #fff;
  height: 5.625rem;
`;

const headerHeadingStyles = css`
  display: flex;
  flex-direction: column;
  font-family: 'Azeret Mono', monospace;

  h1 {
    font-size: 2rem;
    font-weight: 400;
    margin: 0 0.25rem 0 0;
    padding: 0;
  }

  @media only screen and (max-width: 460px) {
    h1 {
      font-size: 1.25rem;
    }
  }
`;

const headerUpdatedAtStyles = css`
  font-size: 0.75rem;
  margin-top: 0.25rem;
  margin-bottom: 0;
`;

const headerIconStyles = css`
  justify-self: center;
  width: 12rem;

  @media only screen and (max-width: 430px) {
    width: 7.5rem;
  }
`;

interface HeaderI {
  scrapeDate: Date;
}

export default function Header({ scrapeDate }: HeaderI) {
  return (
    <div css={headerStyles}>
      <div css={headerHeadingStyles}>
        <h1>Lunch Menu</h1>
        <div css={headerUpdatedAtStyles}>
          Updated&nbsp;
          {scrapeDate
            .toLocaleDateString('us-EN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })
            .replace(',', '')}
        </div>
      </div>
      <a href="https://se.devoteam.com/">
        <Icon css={headerIconStyles} />
      </a>
    </div>
  );
}
