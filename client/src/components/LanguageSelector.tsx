import { css } from "@emotion/react";

import { useRestaurants } from "@/contexts/restaurants";

const languageSelectorStyles = css`
  padding: 0 0.5rem;
  font-size: 1.4rem;
  font-family: "Azeret Mono", monospace;
`;

const languageSelectorButtonStyles = css`
  background: none;
  border: 0;
  color: #4a8cca;
  font: inherit;
  line-height: normal;
  overflow: visible;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
`;

const languageSelectorButtonActiveStyles = css`
  color: inherit;
  text-decoration: none;
  cursor: auto;
`;

export default () => {
  const { language, setLanguage } = useRestaurants();

  const setLang = (lang: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set("lang", lang);
    window.history.pushState(null, "", url.toString());
    setLanguage(lang);
  };

  return (
    <div css={languageSelectorStyles}>
      <button
        css={[languageSelectorButtonStyles, language === "sv" && languageSelectorButtonActiveStyles]}
        onClick={() => setLang("sv")}
      >
        SE
      </button>
      |
      <button
        css={[languageSelectorButtonStyles, language === "en" && languageSelectorButtonActiveStyles]}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </div>
  );
};
