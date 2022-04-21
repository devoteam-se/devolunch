import { ReactComponent as Icon } from "../../assets/sun.svg";
import './Header.css'

export const Header = () => {
  return (
    <div className="header-wrapper">
      <p className="header-text">Lunch Time menu</p>
      <Icon className="header-icon"/>
      <p className="header-text frequency">Daily</p>
    </div>
  );
};
