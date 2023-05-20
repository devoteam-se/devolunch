import { css } from '@emotion/react';

import { ReactComponent as Devoteam } from '@/assets/devoteam-round.svg';
import { ReactComponent as Github } from '@/assets/github-mark.svg';
import { ReactComponent as LinkedIn } from '@/assets/linkedin.svg';
import { color, screenSize } from '@/utils/theme';

const footerStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: ${screenSize.extraLarge};
  margin: 4rem auto 0;
  text-align: center;
  padding: 0 4rem 6rem 4rem;

  p {
    margin: 0;
  }
`;

const iconsStyles = css`
  a {
    display: inline-block;
    width: 2.5rem;
    height: 2.5rem;
    margin: 0 0.5rem 1rem;
  }
`;

const iconStyles = css`
  width: 1.25rem;
  height: 1.25rem;
  padding: 0.5rem;
  border: 1px solid ${color.blue};
  border-radius: 50%;
  fill: ${color.blue};

  :hover {
    background-color: ${color.orange};
  }
`;

export default function Footer() {
  return (
    <footer css={footerStyles}>
      <div css={iconsStyles}>
        <a href="https://se.devoteam.com">
          <Devoteam css={iconStyles} />
        </a>
        <a href="https://www.linkedin.com/company/devoteamcreativetech/">
          <LinkedIn css={iconStyles} />
        </a>
        <a href="https://github.com/jayway/devolunch">
          <Github css={iconStyles} />
        </a>
        <p>Developed by Devoteam Sverige AB as a fun side project.</p>
        <p>This project is licensed under the terms of the MIT license.</p>
      </div>
    </footer>
  );
}
