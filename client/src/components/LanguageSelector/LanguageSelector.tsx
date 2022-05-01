import { useRestaurants } from "../../contexts/restaurants";
import "./LanguageSelector.css";

export const LanguageSelector = () => {
  const { setLanguage } = useRestaurants()
  const setLang = (lang: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set('lang', lang);
    window.history.pushState(null, '', url.toString());
    setLanguage(lang)
  }

  return (
    <div className="language-selector-wrapper">
      <button className="language-selector-button" onClick={ () => setLang("sv") }>
        Svenska
      </button>
      &nbsp;/&nbsp;
      <button className="language-selector-button" onClick={ () => setLang("en") }>
        English
      </button>
    </div>
  );
};
