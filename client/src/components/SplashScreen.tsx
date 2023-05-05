import { css, keyframes } from "@emotion/react";
import { useLottie } from "lottie-react";

import steamPot from "@/assets/steam-pot.json";

const splashScreenKeyFrame = keyframes`
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const potStyles = css`
  width: 200px;
  height: 200px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: fixed;
  margin: auto;
  animation: ${splashScreenKeyFrame} 500ms;
`;

export default () => {
  const options = {
    animationData: steamPot,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options);
  return <div css={potStyles}>{View}</div>;
};
