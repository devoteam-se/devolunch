import { ReactComponent as Icon } from "../../assets/sun.svg";
import "./Header.css";

interface HeaderI {
  scrapeDate: Date;
}

export const Header = ({ scrapeDate }: HeaderI) => {
  return (
    <div className="header-wrapper">
      <p className="header-text">Lunch menu</p>
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
