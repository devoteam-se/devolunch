import { ReactComponent as Icon } from "../../assets/sun.svg";
import { ReactComponent as SvFlag } from "../../assets/sv.svg";
import { ReactComponent as EnFlag } from "../../assets/en.svg";
import { useRestaurants } from "../../contexts/restaurants";
import "./Header.css";

interface HeaderI {
  scrapeDate: Date;
}

export const Header = ({ scrapeDate }: HeaderI) => {
  const { setLanguage } = useRestaurants()
  const setSwedish = () => setLanguage("sv");
  const setEnglish = () => setLanguage("en");

  return (
    <div className="header-wrapper">
      <div className="header-text">
        Lunch menu&nbsp;
        <a href="#" className="header-language-button" onClick={ setSwedish }>
          <SvFlag className="header-language-icon" />
        </a>
        <a href="#" className="header-language-button" onClick={ setEnglish }>
          <EnFlag className="header-language-icon" />
        </a>
      </div>
      <Icon className="header-icon" />
      <p className="header-text frequency">
        Updated&nbsp;
        {scrapeDate.toLocaleDateString("us-EN", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })}
      </p>
    </div>
  );
};
