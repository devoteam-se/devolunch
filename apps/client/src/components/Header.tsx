import { css } from '@emotion/react';

import Icon from '@/assets/devoteam-round.svg?react';
import Sort from '@/components/Sort';
import LanguageSelector from '@/components/LanguageSelector';
import { color, screenSize } from '@/utils/theme';

const headerStyles = css`
  border-bottom: 1px solid ${color.black};
  padding: 0 1.25rem;
  margin: 0;
  animation-name: load;
  animation-duration: 1s;
  background-color: ${color.white};
  position: sticky;
  top: 0;
  z-index: 10;

  @media only screen and (max-width: ${screenSize.small}) {
    padding: 1rem;
  }

  @media only screen and (max-width: ${screenSize.extraSmall}) {
    padding: 0.75rem;
  }
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

  @media only screen and (max-width: ${screenSize.small}) {
    h1 {
      font-size: 1.5rem;
    }
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

  @media only screen and (max-width: ${screenSize.small}) {
    font-size: 0.7rem;
  }

  @media only screen and (max-width: ${screenSize.extraSmall}) {
    font-size: 0.65rem;
    display: none; /* Hide on very small screens to save space */
  }
`;

const headerIconStyles = css`
  justify-self: center;
  width: 3rem;
  fill: ${color.devoteam};

  @media only screen and (max-width: ${screenSize.small}) {
    width: 2.5rem;
  }

  @media only screen and (max-width: ${screenSize.extraSmall}) {
    width: 2rem;
  }
`;

const headerTopRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 5.625rem;

  @media only screen and (max-width: ${screenSize.small}) {
    height: 4rem;
  }

  @media only screen and (max-width: ${screenSize.extraSmall}) {
    height: 3.5rem;
  }
`;

const headerBottomRow = css`
  display: none;

  @media only screen and (max-width: ${screenSize.small}) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.75rem;
    border-top: 1px solid #e0e0e0;
  }
`;

const headerRightStyles = css`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media only screen and (max-width: ${screenSize.small}) {
    /* Hide on mobile - moved to bottom row */
    display: none;
  }
`;

const mobileControlsStyles = css`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  justify-content: space-between;
`;

interface HeaderI {
  scrapeDate: Date | null;
}

export default function Header({ scrapeDate }: HeaderI) {
  return (
    <header css={headerStyles}>
      <div css={headerTopRow}>
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
        <div css={headerRightStyles}>
          <Sort />
          <LanguageSelector />
          <a href='https://se.devoteam.com/' aria-label='Go to Devoteam Creative Tech website'>
            <Icon css={headerIconStyles} />
          </a>
        </div>
      </div>
      <div css={headerBottomRow}>
        <div css={mobileControlsStyles}>
          <Sort />
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
