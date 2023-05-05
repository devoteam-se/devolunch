import { css } from "@emotion/react";

import Sort from "@/components/Sort";
import LanguageSelector from "@/components/LanguageSelector";

const optionsStyles = css`
  display: flex;
  width: 100%;
  height: 6rem;
  align-items: center;

  @media only screen and (max-width: 430px) {
    justify-content: space-between;
  }
`;

export default () => {
  return (
    <div css={optionsStyles}>
      <Sort />
      <LanguageSelector />
    </div>
  );
};
