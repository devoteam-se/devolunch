import { css, keyframes } from '@emotion/react';
import { ReactComponent as LoadingIcon } from '@/assets/cooking.svg';
import { color, screenSize } from '@/utils/theme';

const activeKeyFrame = keyframes`
	0% {
		transform: scale(0.85);
	}

	70% {
		transform: scale(1);
	}

	100% {
		transform: scale(0.85);
	}
`;

const loadingStyles = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;

  :before {
    content: '';
    height: 100%;
    display: inline-block;
    vertical-align: middle;
  }

  @media only screen and (max-width: ${screenSize.small}) {
    margin-top: 5rem;

    :before {
      vertical-align: top;
    }
  }
`;

const loadingIconStyles = css`
  width: 14rem;
  fill: ${color.blue};
  animation: ${activeKeyFrame} 2s infinite;
`;

export default function SplashScreen() {
  return (
    <div css={loadingStyles}>
      <LoadingIcon css={loadingIconStyles} />
    </div>
  );
}
