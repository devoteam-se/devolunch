import { ReactComponent as Icon } from "../../assets/sun.svg";
import "./Header.css";

interface HeaderI {
  scrapeDate: Date;
}

export const Header = ({ scrapeDate }: HeaderI) => {
  return (
    <div className="header">
      <div className="header-heading">
        <h1>Lunch Menu</h1>
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
      <div className="header-logo">Devoteam</div>
    </div>
  );
};
