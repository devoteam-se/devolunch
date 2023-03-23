import { useRestaurants } from "../../contexts/restaurants";
import "./LanguageSelector.css";

export const LanguageSelector = () => {
  const { language, setLanguage } = useRestaurants();
  const setLang = (lang: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set("lang", lang);
    window.history.pushState(null, "", url.toString());
    setLanguage(lang);
  };

  return (
    <div className="language-selector-wrapper">
      <button
        className={"language-selector-button " + (language === "sv" ? "language-selector-button--active" : "")}
        onClick={() => setLang("sv")}
      >
        SE
      </button>
      |
      <button
        className={"language-selector-button " + (language === "en" ? "language-selector-button--active" : "")}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </div>
  );
};
