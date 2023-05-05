import { css } from "@emotion/react";

import Sort from "@/components/Sort";
import LanguageSelector from "@/components/LanguageSelector";

const optionsStyles = css`
  display: flex;
  height: 6rem;
  align-items: center;
  margin-left: auto;
`;

export default () => {
  return (
    <div css={optionsStyles}>
      <Sort />
      <LanguageSelector />
    </div>
  );
};
