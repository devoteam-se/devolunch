import { css } from '@emotion/react';

import { ReactComponent as Icon } from '@/assets/devoteam-round.svg';
import { color, screenSize } from '@/utils/theme';

const headerStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${color.black};
  padding: 0 1.25rem;
  margin: 0;
  animation-name: load;
  animation-duration: 1s;
  background-color: ${color.white};
  height: 5.625rem;
`;

const linkStyles = css`
  position: relative;
  text-decoration: none;
  color: inherit;

  ::before {
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    width: 14rem;
    height: 4rem;
  }

  @media only screen and (max-width: ${screenSize.extraSmall}) {
    ::before {
      width: 12.25rem;
      height: 3rem;
    }
  }
`;

const headerHeadingStyles = css`
  display: flex;
  flex-direction: column;
  font-family: 'Azeret Mono', monospace;

  h1 {
    font-size: 2rem;
    font-weight: 400;
    margin: 0;
    padding: 0 0.25rem 0 0;
  }

  @media only screen and (max-width: ${screenSize.extraSmall}) {
    h1 {
      font-size: 1.25rem;
    }
  }
`;

const headerUpdatedAtStyles = css`
  white-space: pre-wrap;
  font-size: 0.75rem;
  margin: 0;
  padding-top: 0.25rem;

  a {
    padding-top: 0.25rem;
  }
`;

const headerIconStyles = css`
  justify-self: center;
  width: 3rem;
  fill: ${color.devoteam};
`;

interface HeaderI {
  scrapeDate: Date | null;
}

export default function Header({ scrapeDate }: HeaderI) {
  return (
    <header css={headerStyles}>
      <div css={headerHeadingStyles}>
        <h1>
          <a href='/' css={linkStyles}>
            Devolunch
          </a>
        </h1>
        <div css={headerUpdatedAtStyles}>
          {scrapeDate
            ? `Updated ${scrapeDate
                ?.toLocaleDateString('us-EN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })
                .replace(',', '')}`
            : ' '}
        </div>
      </div>
      <a href='https://se.devoteam.com/' aria-label='Go to Devoteam Creative Tech website'>
        <Icon css={headerIconStyles} />
      </a>
    </header>
  );
}
